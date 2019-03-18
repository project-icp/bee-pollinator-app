# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0005_aprilsurvey'),
    ]

    operations = [
        migrations.CreateModel(
            name='NovemberSurvey',
            fields=[
                ('survey', models.OneToOneField(related_name='november', primary_key=True, serialize=False, to='beekeepers.Survey')),
                ('harvested_honey', models.CharField(help_text='How much honey did you collect on average for each colony?', max_length=255, choices=[('DID_NOT_HARVEST', 'Did not harvest'), ('LESS_THAN_10', 'Less than 10 lbs'), ('BETWEEN_10_AND_25', 'Between 10 and 25 lbs'), ('BETWEEN_25_AND_50', 'Between 25 and 50 lbs'), ('MORE_THAN_50', 'More than 50 lbs')])),
                ('supplemental_sugar', models.CharField(help_text='Did you feed supplemental sugar? If so, what times of year did you feed sugar? Check all that apply.', max_length=255, null=True)),
                ('supplemental_protein', models.CharField(help_text='Did you feed supplemental pollen or protein? If so, what times of year did you feed pollen or protein? Check all that apply.', max_length=255, null=True)),
                ('small_hive_beetles', models.BooleanField(help_text='Have you observed small hive beetles in your hives?')),
                ('varroa_check_frequency', models.CharField(help_text='How often do you check for Varroa?', max_length=255, choices=[('NEVER', 'I did not'), ('ONCE', 'Once a year'), ('TWICE', 'Twice a year'), ('THRICE', 'Three times a year'), ('MORE_THAN_THREE', 'More than three times a year')])),
                ('varroa_check_method', models.CharField(help_text='What method do you use to check for Varroa?', max_length=255, null=True)),
                ('varroa_manage_frequency', models.CharField(default='NEVER', help_text='Do you manage for Varroa? If so, how often?', max_length=255, choices=[('NEVER', 'I did not'), ('ONCE', 'Once a year'), ('TWICE', 'Twice a year'), ('THRICE', 'Three times a year'), ('MORE_THAN_THREE', 'More than three times a year')])),
                ('mite_management', models.TextField(help_text='What methods of mite management do you use? Select all that apply.', null=True)),
            ],
        ),
    ]
