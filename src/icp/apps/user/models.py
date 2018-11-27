# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.conf import settings

AUTH_USER_MODEL = getattr(settings, 'AUTH_USER_MODEL', 'auth.User')


class UserProfile(models.Model):
    """For additional user properties."""

    # App options
    POLL = ('POLL', 'Pollinator')
    BEEK = ('BEEK', 'Beekeepers')
    APP_CHOICES = (POLL, BEEK)

    user = models.OneToOneField(AUTH_USER_MODEL)
    app = ArrayField(
        models.CharField(
            max_length=255,
            choices=APP_CHOICES,
        ),
        default=[POLL],
        blank=True,
    )
