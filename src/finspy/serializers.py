from rest_framework import serializers
from processing.models import DeviceMonitoringTransaction

class DeviceMonitoringTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceMonitoringTransaction
        fields = '__all__' # or give explicitptptly 

# processing/serializers.py

from processing.models import BankTransaction

class BankTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankTransaction
        fields = '__all__'  



from processing.models import CreditCardTransaction

class CreditCardTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCardTransaction
        fields = '__all__'


from processing.models import DepositFraudTransaction

class DepositFraudTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepositFraudTransaction
        fields = '__all__'
