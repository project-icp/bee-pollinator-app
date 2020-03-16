# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models

def update_colony_loss_reason(apps, schema_editor):
    AprilSurvey = apps.get_model('beekeepers', 'AprilSurvey')
    for survey in AprilSurvey.objects.all():
        survey.colony_loss_reason = survey.colony_loss_reason.replace('INADEQUETE', 'INADEQUATE')
        survey.save()

class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0017_aprilsurvey_num_new_colonies'),
    ]

    operations = [
        migrations.RunPython(update_colony_loss_reason),
    ]
