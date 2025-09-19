from django.contrib import admin
from django.urls import path, include , re_path
from django.views.generic import TemplateView

from accounts.views import CurrentUserAPIView
from accounts.views import UserListAPIView

from .views import about_page_view

from .views import (
    DeviceMonitoringListView, 
    DeviceMonitoringDetailView, 
    DeviceMonitoringFilteredView
)
from .views import (
    BankTransactionListView, 
    BankTransactionDetailView, 
    BankTransactionFilteredView
)

from .views import CreditCardTransactionListView, CreditCardTransactionDetailView
from .views import DepositFraudTransactionListView, DepositFraudTransactionDetailView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('processing/', include('processing.urls')),
    path('', include('prediction.urls')),
    path('', include('admin_dashboard.urls')),


    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),


    path('about/', about_page_view),

    # user related APIs
    path('api/users/', UserListAPIView.as_view(), name='api-users'),
    path('api/current_user/', CurrentUserAPIView.as_view(), name='current-user'),

    # display misc apis
    # device monitoring apis
    path('api/device-monitoring/', DeviceMonitoringListView.as_view(), name='device-monitoring-list'),
    path('api/device-monitoring/<int:trn_id>/', DeviceMonitoringDetailView.as_view(), name='device-monitoring-detail'),
    path('api/device-monitoring/filter/', DeviceMonitoringFilteredView.as_view(), name='device-monitoring-filtered'),

    # bank transaction apis
    path('api/bank-trans/', BankTransactionListView.as_view(), name='bank-trans-list'),
    path('api/bank-trans/<int:trn_id>/', BankTransactionDetailView.as_view(), name='bank-trans-detail'),
    path('api/bank-trans/filter/', BankTransactionFilteredView.as_view(), name='bank-trans-filter'),

    # credit card transaction apis
    path('api/cred-card/', CreditCardTransactionListView.as_view(), name='cred-card-list'),
    path('api/cred-card/<int:tr_id>/', CreditCardTransactionDetailView.as_view(), name='cred-card-detail'),

    # deposit fraud transaction apis
    path('api/dep-fraud/', DepositFraudTransactionListView.as_view(), name='dep-fraud-list'),
    path('api/dep-fraud/<int:tr_id>/', DepositFraudTransactionDetailView.as_view(), name='dep-fraud-detail'),

    


    # catch-all route ---- any URL not matched above will give index.html
    re_path(r'^(?:.*)/?$', TemplateView.as_view(template_name='index.html'), name='react-app'),
]

"""
# Get all device monitoring transactions curl -X GET http://127.0.0.1:8000/api/device-monitoring/
# Get a specific transaction by `trn_id` curl -X GET http://127.0.0.1:8000/api/device-monitoring/1001/
# Get transactions filtered by `device_os` curl -X GET "http://127.0.0.1:8000/api/device-monitoring/filter/?device_os=Windows"
# Get transactions filtered by `is_fraud` curl -X GET "http://127.0.0.1:8000/api/device-monitoring/filter/?is_fraud=true"


curl -X GET http://127.0.0.1:8000/api/bank-trans/
curl -X GET http://127.0.0.1:8000/api/bank-trans/123/
curl -X GET "http://127.0.0.1:8000/api/bank-trans/filter/?is_fraud=true"

"""
#Y7lvsxa
