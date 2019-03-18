# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import division

from django.contrib import admin
from apps.beekeepers import models

admin.site.register(models.Apiary)
admin.site.register(models.Survey)
admin.site.register(models.AprilSurvey)
admin.site.register(models.NovemberSurvey)
admin.site.register(models.MonthlySurvey)
admin.site.register(models.UserSurvey)
