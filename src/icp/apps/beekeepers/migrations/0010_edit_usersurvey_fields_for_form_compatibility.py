# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0009_apiary_uniquetogether'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='usersurvey',
            name='email',
        ),
        migrations.AlterField(
            model_name='usersurvey',
            name='equipment',
            field=models.TextField(help_text='What kind of equipment do you use?Check all that apply.', blank=True),
        ),
        migrations.AlterField(
            model_name='usersurvey',
            name='income',
            field=models.CharField(help_text='Do you obtain income for your bees? What do you receive income from? Check all that apply.', max_length=255, blank=True),
        ),
        migrations.AlterField(
            model_name='usersurvey',
            name='organization',
            field=models.TextField(help_text="Are you part of a Beekeeper's Organization or Club? Which one?", null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='usersurvey',
            name='phone',
            field=models.CharField(help_text='Phone', max_length=255, blank=True),
        ),
        migrations.AlterField(
            model_name='usersurvey',
            name='purchased_queens_sources',
            field=models.TextField(help_text='Please provide the state(s) where your purchased bees originated from', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='usersurvey',
            name='resistant_queens_genetics',
            field=models.TextField(help_text='Describe their genetics', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='usersurvey',
            name='varroa_management_trigger',
            field=models.TextField(help_text='How do you decide when to manage for Varroa?', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='usersurvey',
            name='year_began',
            field=models.PositiveIntegerField(help_text='What year did you start keeping bees?', null=True),
        ),
        migrations.AlterField(
            model_name='usersurvey',
            name='total_colonies',
            field=models.CharField(help_text='How many total colonies do you manage?', max_length=255, choices=[('BETWEEN_1_AND_3', '1-3'), ('BETWEEN_4_AND_7', '4-7'), ('BETWEEN_8_AND_25', '8-25'), ('BETWEEN_26_AND_59', '26-59'), ('BETWEEN_60_AND_99', '60-99'), ('BETWEEN_100_AND_499', '100-499'), ('BETWEEN_500_AND_2000', '500-2000'), ('MORE_THAN_2000', 'More than 2000')]),
        )
    ]
