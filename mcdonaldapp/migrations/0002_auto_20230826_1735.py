# Generated by Django 3.1.2 on 2023-08-26 08:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mcdonaldapp', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='menu',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]