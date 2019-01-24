# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import division

from django.conf.urls import include, patterns, url

from rest_framework import routers

from apps.beekeepers import views

router = routers.DefaultRouter()
router.register(r'apiary', views.ApiaryViewSet)
router.register(r'user_survey', views.UserSurveyViewSet)


urlpatterns = patterns(
    '',
    url(r'export/$', views.export_survey_tables, name='export'),
    url(r'fetch/$', views.fetch_data, name='fetch_data'),
    url(r'^apiary/(?P<apiary_id>[0-9]+)/survey/$',
        views.create_survey, name='survey-create'),
    url(r'^apiary/(?P<apiary_id>[0-9]+)/survey/(?P<survey_id>[0-9]+)/$',
        views.get_survey, name='survey-get'),
    url(r'^', include(router.urls)),
)
