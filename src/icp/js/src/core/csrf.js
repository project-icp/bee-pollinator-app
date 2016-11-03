"use strict";

// Cross-site forgery protection
// From https://docs.djangoproject.com/en/dev/ref/contrib/csrf/

var $ = require('jquery');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = $.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Internal requests are relative.
function isExternal(url) {
    var domainRegExp = /^http/i;

    return domainRegExp.exec(url) !== null;
}

exports.jqueryAjaxSetupOptions = {
    beforeSend: function(xhr, settings) {
        var csrftoken = getCookie('csrftoken');
        if (!csrfSafeMethod(settings.type) && !isExternal(settings.url)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
};

exports.getToken = function() {
    return getCookie('csrftoken');
};
