# prediction/serializers.py
from rest_framework import serializers
from processing.models import (
    BankTransaction, 
    CreditCardTransaction, 
    DeviceMonitoringTransaction, 
    DepositFraudTransaction
)

# 🟢 Bank Transactions Serializer
class BankTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankTransaction
        fields = '__all__'

# 🟢 Credit Card Transactions Serializer
class CreditCardTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCardTransaction
        fields = '__all__'

# 🟢 Device Monitoring Serializer
class DeviceMonitoringSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceMonitoringTransaction
        fields = '__all__'

# 🟢 Deposit Fraud Serializer
class DepositFraudTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepositFraudTransaction
        fields = '__all__'

#-----------------------------------------------------------------


class DepositFraudSerializer(serializers.ModelSerializer):
    step = serializers.IntegerField(required=True)
    transactiontype = serializers.CharField(required=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    startingclient = serializers.CharField(required=True)
    oldbalstartingclient = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    newbalstartingclient = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    destinationclient = serializers.CharField(required=True)
    oldbaldestclient = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    newbaldestclient = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)

    class Meta:
        model = DepositFraudTransaction
        fields = '__all__'
