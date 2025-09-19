import os
from django.views.generic import TemplateView
from django.conf import settings
from django.http import Http404
from django.http import HttpResponse

from rest_framework import generics
from processing.models import DeviceMonitoringTransaction
from .serializers import DeviceMonitoringTransactionSerializer

from processing.models import BankTransaction
from .serializers import BankTransactionSerializer

from processing.models import CreditCardTransaction
from .serializers import CreditCardTransactionSerializer

from processing.models import DepositFraudTransaction
from .serializers import DepositFraudTransactionSerializer

def about_page_view(request,*args,**kwargs):
    return HttpResponse("About FinSpy")

# --------------------------------------------------------------

# list all device mon trx
class DeviceMonitoringListView(generics.ListAPIView):
    queryset = DeviceMonitoringTransaction.objects.all()
    serializer_class = DeviceMonitoringTransactionSerializer

# retrieve by trx
class DeviceMonitoringDetailView(generics.RetrieveAPIView):
    queryset = DeviceMonitoringTransaction.objects.all()
    serializer_class = DeviceMonitoringTransactionSerializer
    lookup_field = 'trn_id'

# filter
class DeviceMonitoringFilteredView(generics.ListAPIView):
    serializer_class = DeviceMonitoringTransactionSerializer

    def get_queryset(self):
        queryset = DeviceMonitoringTransaction.objects.all()
        device_os = self.request.query_params.get('device_os', None)
        employment_status = self.request.query_params.get('employment_status', None)
        is_fraud = self.request.query_params.get('is_fraud', None)
        
        if device_os:
            queryset = queryset.filter(device_os__icontains=device_os)
        
        if employment_status:
            queryset = queryset.filter(employment_status__icontains=employment_status)
        
        if is_fraud is not None:
            queryset = queryset.filter(is_fraud=(is_fraud.lower() == 'true'))
        
        return queryset

#------------------------------------------------------------------------------

# processing/views.py


# list all bank trx
class BankTransactionListView(generics.ListAPIView):
    queryset = BankTransaction.objects.all()
    serializer_class = BankTransactionSerializer

# retrieve by id
class BankTransactionDetailView(generics.RetrieveAPIView):
    queryset = BankTransaction.objects.all()
    serializer_class = BankTransactionSerializer
    lookup_field = 'trn_id'

# filtere
class BankTransactionFilteredView(generics.ListAPIView):
    serializer_class = BankTransactionSerializer

    def get_queryset(self):
        queryset = BankTransaction.objects.all()
        t_type = self.request.query_params.get('t_type', None)
        is_fraud = self.request.query_params.get('is_fraud', None)
        
        if t_type:
            queryset = queryset.filter(t_type__icontains=t_type)
        if is_fraud is not None:
            # conv is_fraud to bool
            queryset = queryset.filter(is_fraud=(is_fraud.toLowerCase() == 'true'))
        
        return queryset


#--------------------------------------------------------------------


# list all cred trx
class CreditCardTransactionListView(generics.ListAPIView):
    queryset = CreditCardTransaction.objects.all()
    serializer_class = CreditCardTransactionSerializer

# reteive by trx id
class CreditCardTransactionDetailView(generics.RetrieveAPIView):
    queryset = CreditCardTransaction.objects.all()
    serializer_class = CreditCardTransactionSerializer
    lookup_field = 'tr_id'


#----------------------------------------------------------------------



# list all dep 
class DepositFraudTransactionListView(generics.ListAPIView):
    queryset = DepositFraudTransaction.objects.all()
    serializer_class = DepositFraudTransactionSerializer

# retrieve by trx id
class DepositFraudTransactionDetailView(generics.RetrieveAPIView):
    queryset = DepositFraudTransaction.objects.all()
    serializer_class = DepositFraudTransactionSerializer
    lookup_field = 'tr_id'
