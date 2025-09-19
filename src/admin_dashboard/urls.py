from django.urls import path
from .views import APIRequestLogListView, DatabasePerformanceListView, ActiveUserListView, ModelPerformanceListView
from .views import RDSMetricsAPIView
from .views import ServerLogsAPIView

urlpatterns = [
    path('api/admin/api_logs/', APIRequestLogListView.as_view(), name='api_logs'),
    path('api/admin/db_performance/', DatabasePerformanceListView.as_view(), name='db_performance'),
    path('api/admin/active_users/', ActiveUserListView.as_view(), name='active_users'),
    path('api/admin/model_performance/', ModelPerformanceListView.as_view(), name='model_performance'),

    path("rds_metrics/", RDSMetricsAPIView.as_view(), name="rds_metrics"),
    path("server_logs/", ServerLogsAPIView.as_view(), name="server_logs"),
]
