# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import division

from django.conf.urls import include, patterns, url

from rest_framework import routers

from apps.beekeepers import views

router = routers.DefaultRouter()
router.register(r'apiary', views.ApiaryViewSet)

urlpatterns = patterns(
    '',
    url(r'^', include(router.urls)),
    url(r'fetch/$', views.fetch_data, name='fetch_data'),
)
