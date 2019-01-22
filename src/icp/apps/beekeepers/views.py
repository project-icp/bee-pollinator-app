# -*- coding: utf-8 -*-
from __future__ import division

import os

from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils.timezone import now

from rest_framework import decorators, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.status import HTTP_204_NO_CONTENT

from models import Apiary, Survey, UserSurvey
from serializers import (
    ApiarySerializer,
    SurveyDetailSerializer,
    UserSurveySerializer,
)
from tasks import sample_at_point


DATA_BUCKET = os.environ['AWS_BEEKEEPERS_DATA_BUCKET']


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
            s3_filename = '{}_{}.vrt'.format(indicator, forage_range)
            s3_url = 's3://{}/{}/{}'.format(
                DATA_BUCKET,
                forage_range,
                s3_filename
            )
            data = sample_at_point(location, s3_url)
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
                "colony_loss_reason": ""
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


@decorators.api_view(['GET'])
@decorators.permission_classes((IsAuthenticated, ))
def get_survey(request, apiary_id=None, survey_id=None):
    """Retrieve a survey and its subsurvey."""
    survey = get_object_or_404(Survey,
                               apiary=apiary_id,
                               id=survey_id)
    serializer = SurveyDetailSerializer(survey)

    return Response(serializer.data)


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
        return Apiary.objects.filter(user=self.request.user, deleted_at=None)

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
