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
    deleted_at = models.DateTimeField(
        null=True,
        help_text='When was the Apiary deleted')

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
        unique_together = ('month_year', 'apiary', 'survey_type')

    def __unicode__(self):
        return self.month_year


class AprilSurvey(models.Model):
    """
    A short survey taken in April by all users.

    Has only one question:
      - What do you think the most likely cause of colony loss was?

    The answers can be:
      - varroa mites
      - inadequate food stores
      - poor queens
      - poor weather conditions
      - colony too small in November
      - pesticide exposure
      - other (fillable field)

    Multiple selections are possible, and will be separated by a semicolon.
    Answers to "other" will be prefixed with OTHER- to indicate so. E.g.

    "VARROA_MITES;INADEQUATE_FOOD_STORES;OTHER-negligence"
    """

    survey = models.OneToOneField(
        Survey,
        primary_key=True,
        related_name='april')
    colony_loss_reason = models.TextField(
        null=False,
        help_text='The most likely causes for colony loss')


class NovemberSurvey(models.Model):
    """
    A long survey taken in November by all users.

    - varroa_check_method and varroa_manage_frequency need only be filled if
      varroa_check_frequency has been filled out
    - mite_management can take a large list of predefined inputs, but also
      free-form text prefixed by CHEMICAL_OTHER_ORGANIC-, MECHANICAL_OTHER-,
      or OTHER-
    """
    HARVEST_CHOICES = (
        ('DID_NOT_HARVEST', 'Did not harvest'),
        ('LESS_THAN_10', 'Less than 10 lbs'),
        ('BETWEEN_10_AND_25', 'Between 10 and 25 lbs'),
        ('BETWEEN_25_AND_50', 'Between 25 and 50 lbs'),
        ('MORE_THAN_50', 'More than 50 lbs')
    )

    FREQUENCY_CHOICES = (
        ('NEVER', 'I did not'),
        ('ONCE', 'Once a year'),
        ('TWICE', 'Twice a year'),
        ('THRICE', 'Three times a year'),
        ('MORE_THAN_THREE', 'More than three times a year'),
    )

    survey = models.OneToOneField(
        Survey,
        primary_key=True,
        related_name='november')
    harvested_honey = models.CharField(
        max_length=255,
        null=False,
        choices=HARVEST_CHOICES,
        help_text='How much honey did you collect on average for each colony?')
    supplemental_sugar = models.CharField(
        # SPRING;SUMMER;FALL;WINTER
        max_length=255,
        null=True,
        help_text='Did you feed supplemental sugar? '
                  'If so, what times of year did you feed sugar? '
                  'Check all that apply.')
    supplemental_protein = models.CharField(
        # SPRING;SUMMER;FALL;WINTER
        max_length=255,
        null=True,
        help_text='Did you feed supplemental pollen or protein? '
                  'If so, what times of year did you feed pollen or protein? '
                  'Check all that apply.')
    small_hive_beetles = models.BooleanField(
        null=False,
        help_text='Have you observed small hive beetles in your hives?')
    varroa_check_frequency = models.CharField(
        max_length=255,
        null=False,
        choices=FREQUENCY_CHOICES,
        help_text='How often do you check for Varroa?')
    varroa_check_method = models.CharField(
        # ALCOHOL_WASH;SUGAR_SHAKE;STICKY_BOARDS;OTHER-
        max_length=255,
        null=True,
        help_text='What method do you use to check for Varroa?')
    varroa_manage_frequency = models.CharField(
        max_length=255,
        null=False,
        choices=FREQUENCY_CHOICES,
        default='NEVER',
        help_text='Do you manage for Varroa? If so, how often?')
    mite_management = models.TextField(
        # CHEMICAL_FORMIC_ACID_MAQS;CHEMICAL_FORMIC_ACID_FORMIC_PRO;
        # CHEMICAL_OXALIC_ACID_VAPORIZATION;CHEMICAL_OXALIC_ACID_DRIBBLE;
        # CHEMICAL_THYMOL_MENTHOL_APILIFE;CHEMICAL_THYMOL_MENTHOL_APIGUARD;
        # CHEMICAL_SYNTHETIC_APIVAR;CHEMICAL_SYNTHETIC_APISTAN;
        # CHEMICAL_SYNTHETIC_CHECKMITE_PLUS;CHEMICAL_OTHER_ORGANIC-
        # MECHANICAL_DRONE_BROOD_REMOVAL;MECHANICAL_QUEEN_MANIPULATION;
        # MECHANICAL_OTHER-
        # OTHER-
        null=True,
        help_text='What methods of mite management do you use? '
                  'Select all that apply.')
