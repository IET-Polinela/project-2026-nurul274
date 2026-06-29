from django.urls import path
from rest_framework.routers import DefaultRouter

from .api_views import (
    ReportViewSet,
    RegisterView
)

router = DefaultRouter()

router.register(
    'report',
    ReportViewSet,
    basename='report'
)

urlpatterns = [

    path(
        'register/',
        RegisterView.as_view(),
        name='api_register'
    ),

]

urlpatterns += router.urls