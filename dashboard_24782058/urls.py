from django.urls import path
from .views import DashboardView, report_stats
from .views import DashboardView, report_stats, latest_reports, search_reports
from .views import *

urlpatterns = [
    path('', DashboardView.as_view(), name='dashboard'),

    path('api/stats/', report_stats, name='report_stats'),
    path('api/latest/', latest_reports, name='latest_reports'),
    path('api/search/', search_reports, name='search_reports'),
    path('api/detail/<int:id>/', report_detail, name='report_detail'),
]
 
   