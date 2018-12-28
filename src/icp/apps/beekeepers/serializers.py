# -*- coding: utf-8 -*-

import json

from django.db import transaction
from rest_framework.serializers import (
    BaseSerializer,
    CurrentUserDefault,
    ModelSerializer,
    PrimaryKeyRelatedField,
)

from models import (
    Apiary,
    Survey,
    AprilSurvey,
    NovemberSurvey,
    MonthlySurvey,
    UserSurvey
)


class JsonField(BaseSerializer):
    def to_representation(self, obj):
        return json.loads(obj)

    def to_internal_value(self, obj):
        return json.dumps(obj)


class SurveySerializer(ModelSerializer):
    class Meta:
        model = Survey


class SubSurveySerializer(ModelSerializer):
    survey = SurveySerializer(many=False)

    @transaction.atomic
    def create(self, validated_data):
        survey = Survey.objects.create(**validated_data['survey'])
        validated_data['survey'] = survey
        subsurvey = self.Meta.model.objects.create(**validated_data)
        return subsurvey


class AprilSurveySerializer(SubSurveySerializer):
    class Meta:
        model = AprilSurvey


class NovemberSurveySerializer(SubSurveySerializer):
    class Meta:
        model = NovemberSurvey


class MonthlySurveySerializer(SubSurveySerializer):
    class Meta:
        model = MonthlySurvey


SUBSURVEY_SERIALIZERS = {
    'APRIL': AprilSurveySerializer,
    'NOVEMBER': NovemberSurveySerializer,
    'MONTHLY': MonthlySurveySerializer,
}


class UserSurveySerializer(ModelSerializer):
    class Meta:
        model = UserSurvey

    user = PrimaryKeyRelatedField(read_only=True, default=CurrentUserDefault())


class ApiarySerializer(ModelSerializer):
    class Meta:
        model = Apiary
        fields = ('id', 'lat', 'lng', 'marker', 'name',
                  'scores', 'surveys',
                  'starred', 'surveyed',
                  'created_at', 'updated_at',
                  'user',)

    scores = JsonField(required=False)
    surveys = SurveySerializer(many=True, read_only=True)
    user = PrimaryKeyRelatedField(read_only=True, default=CurrentUserDefault())
