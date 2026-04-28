from django.urls import path
from .views import CustomLoginView, CustomLogoutView, register_view

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', CustomLogoutView, name='logout'), 
    path('register/', register_view, name='register'),
]