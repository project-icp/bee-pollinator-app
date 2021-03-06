"""
Django settings for model_my_watershed project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

import os

from boto.utils import get_instance_metadata

from base import *  # NOQA


instance_metadata = get_instance_metadata(timeout=5)

if not instance_metadata:
    raise ImproperlyConfigured('Unable to access the instance metadata')


# HOST CONFIGURATION
# See: https://docs.djangoproject.com/en/1.5/releases/1.5/#allowed-hosts-required-in-production  # NOQA
ALLOWED_HOSTS = [
    'app.pollinationmapper.org',
    'staging.app.pollinationmapper.org',
    'app.beescape.org',
    'staging.app.beescape.org',
    '.elb.amazonaws.com',
    'localhost'
]

# ELBs use the instance IP in the Host header and ALLOWED_HOSTS checks against
# the Host header.
ALLOWED_HOSTS.append(instance_metadata['local-ipv4'])
# END HOST CONFIGURATION


# EMAIL CONFIGURATION
EMAIL_BACKEND = 'django_amazon_ses.backends.boto.EmailBackend'
DEFAULT_FROM_EMAIL = 'noreply@pollinationmapper.org'
# END EMAIL CONFIGURATION

# MIDDLEWARE CONFIGURATION
MIDDLEWARE_CLASSES += (
    'rollbar.contrib.django.middleware.RollbarNotifierMiddleware',
)
# END MIDDLEWARE CONFIGURATION

# ROLLBAR CONFIGURATION
ROLLBAR = {
    'access_token': get_env_setting('ROLLBAR_SERVER_SIDE_ACCESS_TOKEN'),
    'environment': get_env_setting('ICP_STACK_TYPE'),
    'root': os.getcwd(),
}
# END ROLLBAR CONFIGURATION

# Turn off DRF GUI
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    )
}

# Django Storages CONFIGURATION
mac_metadata = instance_metadata['network']['interfaces']['macs']
vpc_id = mac_metadata.values()[0]['vpc-id']

# The VPC id should stay the same for all app servers in a particular
# environment and remain the same after a new deploy, but differ between
# environments.  This makes it a suitable S3 bucket name
AWS_STORAGE_BUCKET_NAME = 'django-storages-{}'.format(vpc_id)

AWS_AUTO_CREATE_BUCKET = True
DEFAULT_FILE_STORAGE = 'libs.custom_storages.PublicS3BotoStorage'

# The PRIVATE_AWS_STORAGE_* settings configure the S3 bucket
# used for files only accessible by census admins (e.g. data dumps)
PRIVATE_AWS_STORAGE_BUCKET_NAME = 'django-storages-private-{}'.format(vpc_id)
PRIVATE_AWS_STORAGE_AUTO_CREATE_BUCKET = True
# The number of seconds that a generated link to a file in the private
# bucket is active.
PRIVATE_AWS_STORAGE_QUERYSTRING_EXPIRE = 30
PRIVATE_AWS_STORAGE_DEFAULT_ACL = 'private'
PRIVATE_AWS_STORAGE_URL_PROTOCOL = 'https:'

# There is no need to specify access key or secret key
# They are pulled from the instance metadata by Boto

# END Django Storages CONFIGURATION

# UI CONFIGURATION

DRAW_TOOLS = [
    'Draw',         # Custom Area or 1 Sq Km stamp
    'ResetDraw',
]

MAP_CONTROLS = [
    'LayerAttribution',
    'LocateMeButton',
    'LayerSelector',
    'ZoomControl',
    'SidebarToggle'
]

DISABLED_MODEL_PACKAGES = []

# END UI CONFIGURATION

# ICP account
POLLINATION_GOOGLE_ANALYTICS = 'UA-92733102-1'
BEEKEEPERS_GOOGLE_ANALYTICS = 'UA-20902288-2'
