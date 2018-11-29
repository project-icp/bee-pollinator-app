# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields
from django.conf import settings
from django.contrib.auth.models import User

from apps.user.models import UserProfile

def create_user_profiles_for_existing_users(apps, schema_editor):
    for user in User.objects.all():
        UserProfile.objects.get_or_create(user=user, origin_app=UserProfile.POLLINATION)
 

class Migration(migrations.Migration):
    
    dependencies = [
        ('user', '0001_create_user_profile_model')
    ]

    operations = [
        migrations.RunPython(create_user_profiles_for_existing_users)
    ]
