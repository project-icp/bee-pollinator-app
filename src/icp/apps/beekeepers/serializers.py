# -*- coding: utf-8 -*-

import json

from rest_framework.serializers import (
    BaseSerializer,
    CurrentUserDefault,
    ModelSerializer,
    PrimaryKeyRelatedField,
)

from models import Apiary, Survey


class JsonField(BaseSerializer):
    def to_representation(self, obj):
        return json.loads(obj)

    def to_internal_value(self, obj):
        return json.dumps(obj)


class SurveySerializer(ModelSerializer):
    class Meta:
        model = Survey


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
