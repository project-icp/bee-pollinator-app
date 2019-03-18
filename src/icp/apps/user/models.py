# -*- coding: utf-8 -*-
from django.db import models
from django.conf import settings

AUTH_USER_MODEL = getattr(settings, 'AUTH_USER_MODEL', 'auth.User')


class UserProfile(models.Model):
    """For additional user properties."""

    POLLINATION = 'Pollination'
    BEEKEEPERS = 'Beekeepers'

    APP_CHOICES = (
        (POLLINATION, POLLINATION),
        (BEEKEEPERS, BEEKEEPERS),
    )

    user = models.OneToOneField(AUTH_USER_MODEL)
    origin_app = models.CharField(
        max_length=255,
        choices=APP_CHOICES,
        null=False,
        help_text="Record on which app the user signed up"
    )

    def __unicode__(self):
        return self.user.username
