# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields
from django.conf import settings
 

class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('origin_app', models.CharField(help_text=b'Record on which app the user signed up', max_length=255, choices=[(b'Pollination', b'Pollination'), (b'Beekeepers', b'Beekeepers')])),
                ('user', models.OneToOneField(to=settings.AUTH_USER_MODEL)),
            ],
        )
    ]
