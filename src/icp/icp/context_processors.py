from django.conf import settings


def google_analytics_account(request):
    return {
        'POLLINATION_GOOGLE_ANALYTICS': settings.POLLINATION_GOOGLE_ANALYTICS,
        'BEEKEEPERS_GOOGLE_ANALYTICS': settings.BEEKEEPERS_GOOGLE_ANALYTICS,
    }
