# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('beekeepers', '0007_monthlysurvey'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserSurvey',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('contribution_level', models.CharField(help_text='What level will you contribute at? Light users fill out a brief survey in April, and a detailed on in November. Pro users have to additionally fill out monthly surveys.', max_length=255, choices=[('PRO', 'Pro'), ('LIGHT', 'Light')])),
                ('email', models.CharField(help_text='Email', max_length=255)),
                ('phone', models.CharField(help_text='Phone', max_length=255)),
                ('preferred_contact', models.CharField(help_text='Do you prefer email or phone?', max_length=10, choices=[('EMAIL', 'Email'), ('PHONE', 'Phone')])),
                ('year_began', models.PositiveIntegerField(help_text='What year did you start keeping bees?')),
                ('organization', models.TextField(help_text="Are you part of a Beekeeper's Organization or Club? Which one?", null=True)),
                ('total_colonies', models.CharField(help_text='How many total colonies do you manage?', max_length=255, choices=[('BETWEEN_1_AND_3', '1-3'), ('BETWEEN_4_AND_7', '4-7'), ('BETWEEN_8_AND_25', '8-25'), ('BETWEEN_26_AND_59', '26-59'), ('BETWEEN_60_AND_99', '100-499'), ('BETWEEN_500_AND_2000', '500-2000'), ('MORE_THAN_2000', 'More than 2000')])),
                ('relocate', models.BooleanField(help_text='Do you relocate your colonies throughout the year?')),
                ('income', models.CharField(help_text='Do you obtain income for your bees? What do you receive income from? Check all that apply.', max_length=255)),
                ('practice', models.CharField(help_text='What best describes your beekeeping practice?', max_length=255, choices=[('CONVENTIONAL', 'Conventional'), ('ORGANIC', 'Organic'), ('NATURAL', 'Natural')])),
                ('varroa_management', models.BooleanField(help_text='Do you manage for Varroa?')),
                ('varroa_management_trigger', models.TextField(help_text='How do you decide when to manage for Varroa?', null=True)),
                ('purchased_queens', models.BooleanField(help_text='Do you buy queens, nucs or packages?')),
                ('purchased_queens_sources', models.TextField(help_text='Please provide the state(s) where your purchased bees originated from', null=True)),
                ('resistant_queens', models.BooleanField(help_text='Do you use Varroa-resistant queens?')),
                ('resistant_queens_genetics', models.TextField(help_text='Describe their genetics', null=True)),
                ('rear_queens', models.BooleanField(help_text='Do you rear queens?')),
                ('equipment', models.TextField(help_text='What kind of equipment do you use?Check all that apply.')),
                ('user', models.OneToOneField(related_name='beekeeper_user_survey', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
