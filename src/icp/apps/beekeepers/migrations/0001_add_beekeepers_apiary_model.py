# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Apiary',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('lat', models.FloatField()),
                ('lng', models.FloatField()),
                ('marker', models.CharField(help_text='Code displayed on textual marker symbol', max_length=255)),
                ('name', models.CharField(help_text='Short text identifier for apiary', max_length=255)),
                ('scores', models.TextField(help_text='JSON representation of raster values at lat/lng', null=True)),
                ('starred', models.BooleanField(default=False, help_text='Has the apiary been starred in the UI?')),
                ('surveyed', models.BooleanField(default=False, help_text='Has the apiary been designated as requiring surveys?')),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
