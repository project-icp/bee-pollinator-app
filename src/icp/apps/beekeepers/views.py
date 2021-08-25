# -*- coding: utf-8 -*-
from __future__ import division

import os
import psycopg2
from cStringIO import StringIO
from zipfile import ZipFile
from tempfile import SpooledTemporaryFile

from django.conf import settings
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import now

from rest_framework import decorators, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.status import HTTP_204_NO_CONTENT

from models import Apiary, Survey, UserSurvey
from serializers import (
    ApiarySerializer,
    SurveyDetailSerializer,
    UserSurveySerializer,
)
from tasks import sample_at_point


DATA_HOST = os.environ['BEEKEEPERS_DATA_HOST']
DATA_BUCKET = os.environ['AWS_BEEKEEPERS_DATA_BUCKET']
PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
DB = settings.DATABASES['default']


@decorators.api_view(['GET'])
@decorators.permission_classes((IsAdminUser, ))
def export_survey_tables(request):
    """Export a zip file of CSVs of all types of beekeepers surveys."""

    # prepare queries to the database
    db_options = 'dbname={} user={} host={} password={}'.format(
        DB['NAME'], DB['USER'], DB['HOST'], DB['PASSWORD']
    )
    connection = psycopg2.connect(db_options)
    cur = connection.cursor()
    tables = dict(
        apiary=None,
        novembersurvey=None,
        aprilsurvey=None,
        monthlysurvey=None,
        usersurvey="""
            SELECT auth_user.username, auth_user.email,
            beekeepers_usersurvey.*
            FROM beekeepers_usersurvey
            INNER JOIN auth_user ON beekeepers_usersurvey.user_id=auth_user.id
        """,
        survey="""
            SELECT beekeepers_survey.*, beekeepers_apiary.lat,
            beekeepers_apiary.lng, beekeepers_apiary.user_id
            FROM beekeepers_survey
            INNER JOIN beekeepers_apiary
            ON beekeepers_survey.apiary_id=beekeepers_apiary.id
        """,
    )

    # the zipped CSVs are written in memory
    date_stamp = now().strftime('%Y-%m-%d_%H-%M-%S')
    zip_dir = 'beekeepers_exports_{}'.format(date_stamp)
    stream = StringIO()

    with ZipFile(stream, 'w') as zf:
        for table, query in tables.iteritems():
            if query is None:
                query = 'SELECT * FROM beekeepers_{}'.format(table)

            filename = '{}/{}_{}.csv'.format(zip_dir, table, date_stamp)
            full_query = 'COPY ({0}) TO STDOUT WITH CSV HEADER'.format(query)
            tempfile = SpooledTemporaryFile()
            cur.copy_expert(full_query, tempfile)
            tempfile.seek(0)
            zf.writestr(filename, tempfile.read())
        zf.close()

    resp = HttpResponse(
        stream.getvalue(),
        content_type='application/zip'
    )
    resp['Content-Disposition'] = 'attachment; filename={}.zip'.format(zip_dir)
    connection.close()
    return resp


@decorators.api_view(['POST'])
@decorators.permission_classes((AllowAny, ))
def fetch_data(request):
    """
    Return the cell values from rasters on s3 and any errors.

    :param locations: List of dicts with lat and lng values,
        i.e [{lat: float, lng: float}]
    :param forage_range: A string value of "3km" or "5km"
    :param indicators: An array of indicator names corresponding to s3 rasters
    """

    locations = request.DATA['locations']
    forage_range = request.DATA['forage_range']
    indicators = request.DATA['indicators']

    resp = []
    for location in locations:
        all_location_data = {}
        for indicator in indicators:
            web_filename = '{}_{}.vrt'.format(indicator, forage_range)
            web_url = '{}/{}/{}/{}'.format(
                DATA_HOST,
                DATA_BUCKET,
                forage_range,
                web_filename
            )
            data = sample_at_point(location, web_url)
            all_location_data.update({indicator: data})
        resp.append(all_location_data)

    return Response(resp)


@decorators.api_view(['POST'])
@decorators.permission_classes((IsAuthenticated, ))
def create_survey(request, apiary_id=None):
        """Create a survey and subsurvey for an apiary.

        Requests are expected to be in the shape:

        {
            "month_year": "042018",
            "num_colonies": 3,
            "survey_type": "APRIL", // or "NOVEMBER" or "MONTHLY"
            "april": {              // Must be specified for "APRIL" surveys
                "colony_loss_reason": "",
                "num_new_colonies": 1
            },
            "november" : {          // Must be specified for "NOVEMBER" surveys
                ...
            },
            "monthlies": [          // Must be specified for "MONTHLY" surveys
                { ... },
                { ... },
                { ... },
            ]
        }
        """
        if not apiary_id:
            raise Http404

        data = request.data
        data['apiary'] = apiary_id

        serializer = SurveyDetailSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=201)


@decorators.api_view(['GET', 'PUT'])
@decorators.permission_classes((IsAuthenticated, ))
def get_or_update_survey(request, apiary_id=None, survey_id=None):
    """Retrieve or update a survey and its subsurvey."""
    survey = get_object_or_404(Survey,
                               apiary=apiary_id,
                               id=survey_id)

    if (request.method == 'GET'):
        serializer = SurveyDetailSerializer(survey)
    else:
        data = request.data
        serializer = SurveyDetailSerializer(survey, data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    return Response(serializer.data, status=200)


class UserSurveyViewSet(viewsets.ModelViewSet):
    queryset = UserSurvey.objects.all()
    serializer_class = UserSurveySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSurvey.objects.filter(user=self.request.user)


class ApiaryViewSet(viewsets.ModelViewSet):
    queryset = Apiary.objects.all()
    serializer_class = ApiarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (Apiary.objects
                      .filter(user=self.request.user, deleted_at=None)
                      .order_by('id'))

    def destroy(self, request, pk=None):
        """Soft deletes Apiaries from user's account"""
        apiary = get_object_or_404(Apiary,
                                   id=pk,
                                   user=request.user,
                                   deleted_at=None)

        apiary.deleted_at = now()
        apiary.save()

        return Response(status=HTTP_204_NO_CONTENT)

    @decorators.list_route(methods=['post'],
                           permission_classes=[IsAuthenticated])
    def upsert(self, request):
        """Given a list of apiaries, updates those with ids and inserts others.
           Returns the list of upserted apiaries."""
        items = request.data
        apiaries = []

        for item in items:
            apiary = None

            if item.get('id'):
                try:
                    apiary = Apiary.objects.get(id=item.get('id'),
                                                user=request.user,
                                                deleted_at=None)
                except Apiary.DoesNotExist:
                    apiary = None

            serializer = ApiarySerializer(apiary,
                                          data=item,
                                          context={'request': request})

            serializer.is_valid(raise_exception=True)
            serializer.save()

            apiaries.append(serializer.data)

        return Response(apiaries)
