# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations


def clear_old_results(apps, schema_editor):
    Scenario = apps.get_model('modeling', 'Scenario')

    Scenario.objects.all().update(
        results='[]',
        modification_hash='',
        inputmod_hash='',
    )


class Migration(migrations.Migration):

    dependencies = [
        ('modeling', '0020_auto_20161206_1556'),
    ]

    operations = [
        migrations.RunPython(clear_old_results)
    ]
