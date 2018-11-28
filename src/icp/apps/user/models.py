# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.conf import settings

AUTH_USER_MODEL = getattr(settings, 'AUTH_USER_MODEL', 'auth.User')


class UserProfile(models.Model):
    """For additional user properties."""

    POLLINATORS = ('POLLINATORS', 'Pollinators')
    BEEKEEPERS = ('BEEKEEPERS', 'Beekeepers')
    APP_CHOICES = (POLLINATORS, BEEKEEPERS,)

    user = models.OneToOneField(AUTH_USER_MODEL)
    origin_app = models.CharField(
        max_length=255,
        choices=APP_CHOICES,
        default=POLLINATORS,
        help_text="Record on which app the user signed up"
    )

    def __unicode__(self):
        return self.user.username
