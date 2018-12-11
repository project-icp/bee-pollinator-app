# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0004_survey_unique_together'),
    ]

    operations = [
        migrations.CreateModel(
            name='AprilSurvey',
            fields=[
                ('survey', models.OneToOneField(related_name='april', primary_key=True, serialize=False, to='beekeepers.Survey')),
                ('colony_loss_reason', models.TextField(help_text='The most likely causes for colony loss')),
            ],
        ),
    ]
