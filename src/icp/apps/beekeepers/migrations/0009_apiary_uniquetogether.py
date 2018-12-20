# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0008_usersurvey'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='apiary',
            unique_together=set([('user', 'lat', 'lng')]),
        ),
    ]
