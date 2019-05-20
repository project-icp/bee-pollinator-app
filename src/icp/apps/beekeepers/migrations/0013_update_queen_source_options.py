# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0012_add_new_survey_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='monthlysurvey',
            name='queen_source',
            field=models.CharField(blank=True, max_length=255, null=True, help_text='Where did the queen come from?', choices=[('NON_LOCAL_COMMERCIAL', 'Non-local commercial breeder'), ('LOCAL_COMMERCIAL', 'Local commercial breeder'), ('LOCAL_NON_COMMERCIAL', 'Local, non-commercial or reared on site'), ('REQUEENED', 'Colony requeened itself'), ('PACKAGE', 'Package'), ('FERAL', 'Feral colony or swarm')]),
        ),
    ]
