# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0010_alter_usersurvey_field'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='usersurvey',
            name='email',
        ),
    ]
