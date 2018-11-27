# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0001_add_beekeepers_apiary_model'),
    ]

    operations = [
        migrations.CreateModel(
            name='Survey',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('month_year', models.CharField(help_text='MMYYYY formatted value indicating the month of this survey', max_length=255)),
                ('num_colonies', models.IntegerField(help_text='Number of colonies in this survey')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('survey_type', models.CharField(help_text='The kind of survey this is', max_length=255, choices=[('APRIL', 'April'), ('NOVEMBER', 'November'), ('MONTHLY', 'Monthly')])),
                ('apiary', models.ForeignKey(related_name='surveys', to='beekeepers.Apiary')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='survey',
            unique_together=set([('month_year', 'apiary')]),
        ),
    ]
