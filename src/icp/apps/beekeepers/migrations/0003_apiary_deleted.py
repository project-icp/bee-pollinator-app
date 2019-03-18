# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0002_add_beekeepers_survey_model'),
    ]

    operations = [
        migrations.AddField(
            model_name='apiary',
            name='deleted_at',
            field=models.DateTimeField(help_text='When was the Apiary deleted', null=True),
        ),
    ]
