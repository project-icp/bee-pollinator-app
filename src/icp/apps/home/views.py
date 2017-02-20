# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import division

import json

from django.http import Http404
from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.template import RequestContext
from django.template.context_processors import csrf
from django.conf import settings

from apps.modeling.models import Project, Scenario


def home_page(request):
    return render_to_response('home/home.html', get_context(request))


def projects(request):
    if request.user.is_authenticated():
        return render_to_response('home/home.html', get_context(request))
    else:
        return redirect('/')


def project(request, proj_id=None, scenario_id=None):
    """
    If proj_id was specified, check that the user owns
    the project or if the project is public.
    If not, return a 404. Otherwise, just load the index
    template and the let the front-end handle the route
    and request the project through the API.

    If proj_id is not specified, then throw a 404 error.
    """

    if proj_id:
        project = get_object_or_404(Project, id=proj_id)

        if project.user != request.user and project.is_private:
            raise Http404

        return render_to_response('home/home.html', get_context(request))
    else:
        return redirect('/projects/')


def project_clone(request, proj_id=None):
    """
    If proj_id was specified, check that the user owns
    the project or if the project is public.
    If not, return a 404. Otherwise, create a new
    project and scenarios from the old one, assign to
    current user, and redirect to it.
    """

    if not proj_id or not request.user.is_authenticated():
        raise Http404

    project = get_object_or_404(Project, id=proj_id)

    if project.user != request.user and project.is_private:
        raise Http404

    project.pk = None
    project.user = request.user
    project.save()

    for scenario in Scenario.objects    \
            .filter(project_id=proj_id) \
            .order_by('created_at'):
        scenario.pk = None
        scenario.project = project
        scenario.save()

    return redirect('/project/{0}'.format(project.id))


def get_client_settings(request):
    client_settings = {
        'client_settings': json.dumps({
            'base_layers': settings.BASEMAPS,
            'overlay_layer': settings.OVERLAY,
            'draw_tools': settings.DRAW_TOOLS,
            'map_controls': settings.MAP_CONTROLS,
            'mapshed_max_area': settings.DRAW_CONFIG['MaxAoIArea']
        })
    }

    return client_settings


def get_context(request):
    context = RequestContext(request)
    context.update(csrf(request))
    context.update(get_client_settings(request))

    return context
