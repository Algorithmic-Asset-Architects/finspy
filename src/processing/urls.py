from django.urls import path
from processing.views import CreditCardFraudAPIView

urlpatterns = [
    path('api/predict/credit_card2/', CreditCardFraudAPIView.as_view(), name='predict-credit-card-fraud'),
]
