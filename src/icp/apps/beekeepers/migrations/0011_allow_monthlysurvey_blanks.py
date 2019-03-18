# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0010_edit_usersurvey_fields_for_form_compatibility'),
    ]

    operations = [
        migrations.AlterField(
            model_name='monthlysurvey',
            name='activity_since_last',
            field=models.CharField(help_text='Since the last assessment have you: removed honey, removed brood, fed pollen or protein, fed sugar? Select all that apply.', max_length=255, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monthlysurvey',
            name='colony_loss_reason',
            field=models.TextField(help_text='The most likely causes for colony loss', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monthlysurvey',
            name='num_bodies_supers_deep',
            field=models.IntegerField(help_text='Total number of hive bodies and supers (deep)', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monthlysurvey',
            name='num_bodies_supers_medium',
            field=models.IntegerField(help_text='Total number of hive bodies and supers (medium)', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monthlysurvey',
            name='num_bodies_supers_shallow',
            field=models.IntegerField(help_text='Total number of hive bodies and supers (shallow)', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monthlysurvey',
            name='queen_source',
            field=models.CharField(blank=True, max_length=255, null=True, help_text='Where did the queen come from?', choices=[('NON_LOCAL_COMMERCIAL', 'Non-local commercial breeder'), ('LOCAL_COMMERCIAL', 'Local commercial breeder'), ('REQUEENED', 'Colony requeened itself'), ('PACKAGE', 'Package'), ('FERAL', 'Feral colony or swarm')]),
        ),
        migrations.AlterField(
            model_name='monthlysurvey',
            name='queen_stock',
            field=models.CharField(help_text='To the best of your knowledge, what is the stock of the queen?', max_length=255, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monthlysurvey',
            name='varroa_count_result',
            field=models.IntegerField(help_text='Number of mites per 300 bees (1/2 cup)', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monthlysurvey',
            name='varroa_count_technique',
            field=models.CharField(help_text='How did you do a Varroa count?', max_length=255, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monthlysurvey',
            name='varroa_treatment',
            field=models.TextField(help_text='What methods of mite management do you use? Select all that apply.', null=True, blank=True),
        ),
    ]
