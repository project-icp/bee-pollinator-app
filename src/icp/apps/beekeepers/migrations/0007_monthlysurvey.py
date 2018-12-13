# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beekeepers', '0006_novembersurvey'),
    ]

    operations = [
        migrations.CreateModel(
            name='MonthlySurvey',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('inspection_date', models.DateField(help_text='Date of Inspection')),
                ('colony_name', models.CharField(help_text='Colony Name', max_length=255)),
                ('colony_alive', models.BooleanField(help_text='Is the colony alive?')),
                ('colony_loss_reason', models.TextField(help_text='The most likely causes for colony loss')),
                ('num_bodies_supers_deep', models.IntegerField(help_text='Total number of hive bodies and supers (deep)', null=True)),
                ('num_bodies_supers_medium', models.IntegerField(help_text='Total number of hive bodies and supers (medium)', null=True)),
                ('num_bodies_supers_shallow', models.IntegerField(help_text='Total number of hive bodies and supers (shallow)', null=True)),
                ('activity_since_last', models.CharField(help_text='Since the last assessment have you: removed honey, removed brood, fed pollen or protein, fed sugar? Select all that apply.', max_length=255, null=True)),
                ('queenright', models.BooleanField(help_text='Is the colony queenright?')),
                ('same_queen', models.CharField(help_text='Is this the same queen from the last assessment?', max_length=255, choices=[('YES', 'Yes'), ('NO_BEEKEEPER_REPLACED', 'No. Beekeeper Replaced.'), ('NO_SWARM', 'No. Swarm.'), ('NO_SUPERSEDURE', 'No. Supersedure.'), ('NO_QUEEN_DEATH', 'No. Queen Death.')])),
                ('queen_stock', models.CharField(help_text='To the best of your knowledge, what is the stock of the queen?', max_length=255, null=True)),
                ('queen_source', models.CharField(help_text='Where did the queen come from?', max_length=255, choices=[('NON_LOCAL_COMMERCIAL', 'Non-local commercial breeder'), ('LOCAL_COMMERCIAL', 'Local commercial breeder'), ('REQUEENED', 'Colony requeened itself'), ('PACKAGE', 'Package'), ('FERAL', 'Feral colony or swarm')])),
                ('varroa_count_performed', models.BooleanField(help_text='Did you do a Varroa count?')),
                ('varroa_count_technique', models.CharField(help_text='How did you do a Varroa count?', max_length=255, null=True)),
                ('varroa_count_result', models.IntegerField(help_text='Number of mites per 300 bees (1/2 cup)', null=True)),
                ('varroa_treatment', models.TextField(help_text='What methods of mite management do you use? Select all that apply.', null=True)),
                ('survey', models.ForeignKey(related_name='monthlies', to='beekeepers.Survey')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='monthlysurvey',
            unique_together=set([('survey', 'colony_name')]),
        ),
    ]
