# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals

from django.db import models
from django.conf import settings

AUTH_USER_MODEL = getattr(settings, 'AUTH_USER_MODEL', 'auth.User')


class Apiary(models.Model):
    """An Apiary represents a real or possible physical location
    where multiple honeybee colonies are located.
    """
    created_at = models.DateTimeField(
        auto_now_add=True,
        null=False)
    lat = models.FloatField(
        null=False)
    lng = models.FloatField(
        null=False)
    marker = models.CharField(
        max_length=255,
        null=False,
        help_text='Code displayed on textual marker symbol')
    name = models.CharField(
        max_length=255,
        null=False,
        help_text='Short text identifier for apiary')
    scores = models.TextField(
        null=True,
        help_text='JSON representation of raster values at lat/lng')
    starred = models.BooleanField(
        default=False,
        null=False,
        help_text='Has the apiary been starred in the UI?')
    surveyed = models.BooleanField(
        default=False,
        null=False,
        help_text='Has the apiary been designated as requiring surveys?')
    updated_at = models.DateTimeField(
        auto_now=True,
        null=True)
    user = models.ForeignKey(
        AUTH_USER_MODEL,
        null=False)

    def __unicode__(self):
        return unicode('{}:{}'.format(self.user.username, self.name))


class Survey(models.Model):
    """Survey of questions for an Apiary for a given month"""
    APRIL = 'APRIL'
    NOVEMBER = 'NOVEMBER'
    MONTHLY = 'MONTHLY'

    SURVEY_TYPES = (
        (APRIL, 'April'),
        (NOVEMBER, 'November'),
        (MONTHLY, 'Monthly'),
    )

    month_year = models.CharField(
        max_length=255,
        null=False,
        help_text='MMYYYY formatted value indicating the month of this survey')
    num_colonies = models.IntegerField(
        null=False,
        help_text='Number of colonies in this survey')
    apiary = models.ForeignKey(
        Apiary,
        related_name='surveys',
        null=False)
    created_at = models.DateTimeField(
        auto_now=False,
        auto_now_add=True)
    survey_type = models.CharField(
        choices=SURVEY_TYPES,
        max_length=255,
        null=False,
        help_text='The kind of survey this is')

    class Meta:
        unique_together = ('month_year', 'apiary')

    def __unicode__(self):
        return self.month_year