# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0014_update_hive_scale_id_help_text'),
    ]

    operations = [
        migrations.RunSQL(
            "UPDATE beekeepers_apiary SET scores='{\"3km\": null, \"5km\": null}';"
        ),
    ]
