# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0015_apiary_scores_nullify_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='aprilsurvey',
            name='notes',
            field=models.TextField(help_text='Miscellaneous comments', null=True, blank=True),
        ),
        migrations.AddField(
            model_name='monthlysurvey',
            name='notes',
            field=models.TextField(help_text='Miscellaneous comments', null=True, blank=True),
        ),
        migrations.AddField(
            model_name='novembersurvey',
            name='notes',
            field=models.TextField(help_text='Miscellaneous comments', null=True, blank=True),
        ),
    ]
