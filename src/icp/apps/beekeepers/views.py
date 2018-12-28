# -*- coding: utf-8 -*-
from __future__ import division

import os

from django.shortcuts import get_object_or_404
from django.utils.timezone import now

from rest_framework import decorators, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.status import HTTP_204_NO_CONTENT

from models import Apiary, Survey, UserSurvey, SUBSURVEY_MODELS
from serializers import (
    ApiarySerializer,
    SurveySerializer,
    SUBSURVEY_SERIALIZERS,
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
        """Create a survey and subsurvey from subsurvey form data
        Request data expected as {"survey: {...}, ...}
        """
        # validated survey data is required by the subsurvey serializer
        survey_data = request.data['survey']
        serialized_survey = SurveySerializer(data=survey_data)
        serialized_survey.is_valid(raise_exception=True)

        survey_type = survey_data['survey_type']
        subsurvey_serializer = SUBSURVEY_SERIALIZERS[survey_type]
        subsurvey_data = request.data
        subsurvey_data['survey'] = serialized_survey.data
        serialized_subsurvey = subsurvey_serializer(data=subsurvey_data)
        serialized_subsurvey.is_valid(raise_exception=True)

        serialized_subsurvey.save()
        return Response(serialized_subsurvey.data, status=201)


@decorators.api_view(['GET'])
@decorators.permission_classes((IsAuthenticated, ))
def get_survey(request, apiary_id=None, survey_id=None):
    """Retrieve a survey and its subsurvey."""
    survey = get_object_or_404(Survey,
                               apiary=apiary_id,
                               id=survey_id)
    survey_type = survey.survey_type
    subsurvey = get_object_or_404(SUBSURVEY_MODELS[survey_type],
                                  survey__apiary=apiary_id,
                                  survey=survey_id)
    serializer = SUBSURVEY_SERIALIZERS[survey_type]
    serialized_data = serializer(subsurvey)
    return Response(serialized_data.data)


class UserSurveyViewSet(viewsets.ModelViewSet):
    queryset = UserSurvey.objects.all()
    serializer_class = UserSurveySerializer
    permissions_classes = [IsAuthenticated]
    
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
