# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0009_apiary_uniquetogether'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usersurvey',
            name='total_colonies',
            field=models.CharField(help_text='How many total colonies do you manage?', max_length=255, choices=[('BETWEEN_1_AND_3', '1-3'), ('BETWEEN_4_AND_7', '4-7'), ('BETWEEN_8_AND_25', '8-25'), ('BETWEEN_26_AND_59', '26-59'), ('BETWEEN_60_AND_99', '60-99'), ('BETWEEN_100_AND_499', '100-499'), ('BETWEEN_500_AND_2000', '500-2000'), ('MORE_THAN_2000', 'More than 2000')]),
        ),
    ]
