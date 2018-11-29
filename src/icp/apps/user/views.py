from uuid import uuid1

from django.contrib.auth import (authenticate,
                                 logout as auth_logout,
                                 login as auth_login)
from django.shortcuts import redirect
from django.contrib.auth.forms import PasswordResetForm
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.sites.shortcuts import get_current_site

from registration.models import RegistrationProfile
from registration.forms import RegistrationFormUniqueEmail
from registration.backends.default.views import RegistrationView

from rest_framework import decorators, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from apps.user.models import UserProfile


@decorators.api_view(['POST', 'GET'])
@decorators.permission_classes((AllowAny, ))
def login(request):
    response_data = {}
    status_code = status.HTTP_200_OK

    if request.method == 'POST':
        user = authenticate(username=request.REQUEST.get('username'),
                            password=request.REQUEST.get('password'))

        if user is not None:
            if user.is_active:
                auth_login(request, user)
                response_data = {
                    'result': 'success',
                    'username': user.username,
                    'guest': False,
                    'id': user.id
                }
            else:
                response_data = {
                    'errors': ['Please activate your account'],
                    'guest': True,
                    'id': 0
                }
                status_code = status.HTTP_400_BAD_REQUEST
        else:
            response_data = {
                'errors': ['Invalid username or password'],
                'guest': True,
                'id': 0
            }
            status_code = status.HTTP_400_BAD_REQUEST

    elif request.method == 'GET':
        user = request.user

        if user.is_authenticated() and user.is_active:
            response_data = {
                'result': 'success',
                'username': user.username,
                'guest': False,
                'id': user.id
            }
        else:
            response_data = {
                'result': 'success',
                'guest': True,
                'id': 0
            }

        status_code = status.HTTP_200_OK

    return Response(data=response_data, status=status_code)


@decorators.api_view(['GET'])
@decorators.permission_classes((AllowAny, ))
def logout(request):
    auth_logout(request)

    if request.is_ajax():
        response_data = {
            'result': 'success',
            'guest': True,
            'id': 0
        }
        return Response(data=response_data)
    else:
        return redirect('/')


def trim_to_valid_length(basename, suffix):
    """Django auth model prevents usernames from being greater
       than 30 chars. Take a chunk out of long names and make an
       attempt at having the new name be unique
    """

    max_len = 30
    unique_len = 7
    username = basename + suffix

    if len(username) > max_len:
        unique = uuid1().hex[:unique_len]

        # Strip out characters so that name + unique + suffix is <= max_len
        diff = (len(username) - max_len) + unique_len
        username = basename[:-diff] + unique + suffix

    return username


@decorators.api_view(['POST'])
@decorators.permission_classes((AllowAny, ))
def sign_up(request):
    view = RegistrationView()
    form = RegistrationFormUniqueEmail(request.POST)

    if form.is_valid():
        user = view.register(request, form)

        # Create a user profile with correct origin app
        # TODO: Correct the check for the beekeepers app
        if request.META['HTTP_REFERER'] is 'http://localhost:8000/?beekeepers':
            UserProfile.objects.create(
                user=user,
                origin_app=UserProfile.BEEKEEPERS
            )
        else:
            UserProfile.objects.create(
                user=user,
                origin_app=UserProfile.POLLINATION
            )

        response_data = {'result': 'success',
                         'username': user.username,
                         'guest': False}
        return Response(data=response_data,
                        status=status.HTTP_200_OK)
    else:
        errors = []
        if 'username' not in form.cleaned_data:
            errors.append("Username is invalid or already in use")
        if 'password1' not in form.cleaned_data:
            errors.append("Password must be specified")
        if 'password2' not in form.cleaned_data or \
           form.cleaned_data['password1'] != form.cleaned_data['password2']:
            errors.append("Passwords do not match")
        if 'email' not in form.cleaned_data:
            errors.append("Email is invalid or already in use")

        if len(errors) == 0:
            errors.append("Invalid data submitted")

        response_data = {"errors": errors}
        return Response(data=response_data,
                        status=status.HTTP_400_BAD_REQUEST)


@decorators.api_view(['POST'])
@decorators.permission_classes((AllowAny, ))
def resend(request):
    # Resend activation email if the key hasn't expired.
    form = PasswordResetForm(request.POST)
    if form.is_valid():
        email = form.cleaned_data['email']
        try:
            registration_profile = RegistrationProfile.objects.get(
                user__email=email)
            if registration_profile.activation_key_expired():
                response_data = {'errors': ["Activation key expired"]}
                status_code = status.HTTP_400_BAD_REQUEST
            else:
                registration_profile.send_activation_email(
                    get_current_site(request))
                response_data = {'result': 'success'}
                status_code = status.HTTP_200_OK
        except ObjectDoesNotExist:
            response_data = {'errors': ["Email cannot be found"]}
            status_code = status.HTTP_400_BAD_REQUEST
    else:
        response_data = {'errors': ["Email is invalid"]}
        status_code = status.HTTP_400_BAD_REQUEST

    return Response(data=response_data, status=status_code)


@decorators.api_view(['POST'])
@decorators.permission_classes((AllowAny, ))
def forgot(request):
    form = PasswordResetForm(request.POST)

    if form.is_valid():
        email = form.cleaned_data['email']
        try:
            # If there are active user(s) that match email
            next(form.get_users(email))
            form.save(request=request)
            response_data = {'result': 'success',
                             'guest': True}
            status_code = status.HTTP_200_OK
        except StopIteration:
            response_data = {'errors': ["Email cannot be found"]}
            status_code = status.HTTP_400_BAD_REQUEST
    else:
        response_data = {'errors': ["Email is invalid"]}
        status_code = status.HTTP_400_BAD_REQUEST

    return Response(data=response_data, status=status_code)
