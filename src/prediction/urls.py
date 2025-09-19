# prediction/urls.py
from django.urls import path
from prediction.views.bank_transactions import BankTransactionPredictionAPIView
from prediction.views.credit_card import CreditCardPredictionAPIView
from .views.device_monitoring import DeviceMonitoringPredictionAPIView
from .views.deposit_fraud import DepositFraudPredictionAPIView


urlpatterns = [
    path('api/predict/bank_transaction/', BankTransactionPredictionAPIView.as_view(), name='bank_transaction_prediction'),
    path('api/predict/credit_card/', CreditCardPredictionAPIView.as_view(), name='credit_card_prediction'),
    path('api/predict/device_monitoring/', DeviceMonitoringPredictionAPIView.as_view(), name='device_monitoring_prediction'),
    path('api/predict/deposit_fraud/', DepositFraudPredictionAPIView.as_view(), name='deposit_fraud_prediction'),


]

"""
"""
