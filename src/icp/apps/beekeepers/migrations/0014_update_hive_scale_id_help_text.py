# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0013_update_queen_source_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='monthlysurvey',
            name='hive_scale_id',
            field=models.CharField(help_text='If you have an automated scale associated with this colony, please enter the hive scale brand and ID number here.', max_length=255, null=True, blank=True),
        ),
    ]
