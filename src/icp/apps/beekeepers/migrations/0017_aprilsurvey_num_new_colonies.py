# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0016_add_notes_to_surveys'),
    ]

    operations = [
        migrations.AddField(
            model_name='aprilsurvey',
            name='num_new_colonies',
            field=models.IntegerField(default=0, help_text='Number of new colonies in this survey', null=True),
        ),
    ]
