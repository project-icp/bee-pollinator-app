# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields
from django.conf import settings

def create_user_profiles_for_existing_users(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    UserProfile = apps.get_model('user', 'UserProfile')

    for user in User.objects.all():
        UserProfile.objects.create(user=user)
 

class Migration(migrations.Migration):
    
    dependencies = [
        ('user', '0001_create_user_profile_model')
    ]

    operations = [
        migrations.RunPython(create_user_profiles_for_existing_users)
    ]
