"""
URL configuration for smartcity_app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

# drf-spectacular
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

# django-scalar (function-based view)
from django_scalar.views import scalar_viewer

urlpatterns = [

    path(
        'admin/',
        admin.site.urls
    ),

    path(
        '',
        include('usermanagement_24782058.urls')
    ),

    path(
        '',
        include('main_app.urls')
    ),

    path(
        'dashboard/',
        include('dashboard_24782058.urls')
    ),

    path(
        'api/',
        include('main_app.api_urls')
    ),

    path(
        'api/token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),

    # =====================
    # OpenAPI Documentation (Lab 14)
    # =====================
    path(
        'api/schema/',
        SpectacularAPIView.as_view(),
        name='schema'
    ),

    path(
        'api/docs/swagger/',
        SpectacularSwaggerView.as_view(
            url_name='schema'
        ),
        name='swagger-ui'
    ),

    path(
        'api/docs/scalar/',
        scalar_viewer,
        {
            'openapi_url': '/api/schema/',
            'title': 'Smart City API - Scalar UI',
            'scalar_theme': 'purple',
        },
        name='scalar-ui'
    ),

]