# -*- coding: utf-8 -*-

import json

from django.db import transaction
from rest_framework.serializers import (
    BaseSerializer,
    CurrentUserDefault,
    ModelSerializer,
    PrimaryKeyRelatedField,
    ValidationError,
)

from models import (
    Apiary,
    Survey,
    AprilSurvey,
    NovemberSurvey,
    MonthlySurvey,
    SUBSURVEY_MODELS,
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


class AprilSurveySerializer(ModelSerializer):
    class Meta:
        model = AprilSurvey
        exclude = ('survey',)


class NovemberSurveySerializer(ModelSerializer):
    class Meta:
        model = NovemberSurvey
        exclude = ('survey',)


class MonthlySurveySerializer(ModelSerializer):
    class Meta:
        model = MonthlySurvey
        exclude = ('survey',)


class SurveyDetailSerializer(ModelSerializer):
    class Meta:
        model = Survey
        fields = ('id', 'month_year', 'num_colonies', 'apiary', 'created_at',
                  'survey_type', 'april', 'november', 'monthlies',)

    april = AprilSurveySerializer(many=False, required=False)
    november = NovemberSurveySerializer(many=False, required=False)
    monthlies = MonthlySurveySerializer(many=True, required=False)

    @transaction.atomic
    def create(self, validated_data):
        survey_type = validated_data['survey_type']
        field = Survey.SUBSURVEY_FIELDS[survey_type]
        SubModel = SUBSURVEY_MODELS[survey_type]

        survey = Survey.objects.create(
            apiary=validated_data['apiary'],
            month_year=validated_data['month_year'],
            num_colonies=validated_data['num_colonies'],
            survey_type=validated_data['survey_type'])

        subdata = validated_data[field]
        if survey_type == 'MONTHLY':
            for monthly in subdata:
                monthly['survey'] = survey
                SubModel.objects.create(**monthly)
        else:
            subdata['survey'] = survey
            SubModel.objects.create(**subdata)

        return survey

    def validate(self, data):
        """Ensure subsurvey field is specified for the survey type"""
        survey_type = data['survey_type']
        field = Survey.SUBSURVEY_FIELDS[survey_type]
        if field not in data:
            raise ValidationError(
                '`{field}` field is required when '
                'survey type is `{survey_type}`'.format(
                    field=field, survey_type=survey_type))

        return data


class UserSurveySerializer(ModelSerializer):
    class Meta:
        model = UserSurvey
        fields = ('user', 'contribution_level', 'phone', 'preferred_contact',
                  'year_began', 'organization', 'total_colonies', 'relocate',
                  'income', 'practice', 'varroa_management',
                  'varroa_management_trigger', 'purchased_queens',
                  'purchased_queens_sources', 'resistant_queens',
                  'resistant_queens_genetics', 'rear_queens', 'equipment',)

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
