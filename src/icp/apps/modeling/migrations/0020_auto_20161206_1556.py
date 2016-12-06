# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('modeling', '0019_project_gis_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='model_package',
            field=models.CharField(help_text='Which model pack was chosen for this project', max_length=255, choices=[('yield', 'Crop Yield Model')]),
        ),
    ]
