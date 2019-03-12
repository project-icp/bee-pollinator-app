# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0011_allow_monthlysurvey_blanks'),
    ]

    operations = [
        migrations.AddField(
            model_name='monthlysurvey',
            name='hive_scale_id',
            field=models.CharField(help_text='If you have an automated scale associated with this colony, please enter the hive scale ID number here.', max_length=255, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='novembersurvey',
            name='all_colonies_treated',
            field=models.BooleanField(default=True, help_text='Did you treat all of the colonies in the apiary?'),
        ),
    ]
