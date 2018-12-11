# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0003_apiary_deleted'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='survey',
            unique_together=set([('month_year', 'apiary', 'survey_type')]),
        ),
    ]
