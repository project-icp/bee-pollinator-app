import os

from base import *  # NOQA

# TEST SETTINGS
ALLOWED_HOSTS = ['localhost']

PASSWORD_HASHERS = (
    'django.contrib.auth.hashers.MD5PasswordHasher',
)

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

SELENIUM_DEFAULT_BROWSER = 'firefox'
SELENIUM_TEST_COMMAND_OPTIONS = {'pattern': 'uitest*.py'}

DJANGO_LIVE_TEST_SERVER_ADDRESS = os.environ.get(
    'DJANGO_LIVE_TEST_SERVER_ADDRESS', 'localhost:9001')

# Turn off DRF GUI
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    )
}

# azaveadev@azavea.com account
POLLINATION_GOOGLE_ANALYTICS = 'UA-67319750-1'
BEEKEEPERS_GOOGLE_ANALYTICS = 'UA-67319750-1'
