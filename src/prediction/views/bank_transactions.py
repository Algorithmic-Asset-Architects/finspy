# prediction/views/bank_transactions.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from prediction.utils.bank_transactions import predict_fraud
from processing.models import BankTransaction
from rest_framework.permissions import AllowAny


@method_decorator(csrf_exempt, name='dispatch')  # ✅ Exempt CSRF for API calls

class BankTransactionPredictionAPIView(APIView):
    permission_classes = [AllowAny]  # ✅ Allow access to all users

    def post(self, request, *args, **kwargs):
        transaction_data = request.data

        try:
            # 🟢 Run fraud detection
            prediction = predict_fraud(transaction_data)
            transaction_data.update(prediction)

            # 🟢 Remove fields not in the database table
            transaction_data.pop("isFlaggedFraud", None)  # Ignore missing fields
            transaction_data.pop("isFraud", None)  # Ignore missing fields

            # 🟢 Save the transaction into the BankTransaction table
            BankTransaction.objects.create(**transaction_data)

            return Response(prediction, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



















"""

$ curl -X POST http://127.0.0.1:8000/api/predict/bank_transaction/ -H "Content-Type: application/json" -d '{
    "step": 666,
    "t_type": "TRANSFER",
    "amount": 10.50,
    "nameorig": "C663598789",
    "oldbalanceorg": 50.00,
    "newbalanceorg": 40.50,
    "namedest": "M967645421",
    "oldbalancedest": 20.00,
    "newbalancedest": 3.50,
    "isFlaggedFraud": 0,
    "isFraud": 0
}'
{"fraud_probability":1.0,"is_fraud":true}



$ curl -X POST http://127.0.0.1:8000/api/predict/bank_transaction/ -H "Content-Type: application/json" -d '{
    "step": 1,
    "t_type": "TRANSFER",
    "amount": 10000.50,
    "nameorig": "C123456789",
    "oldbalanceorg": 50000.00,
    "newbalanceorg": 40000.50,
    "namedest": "M987654321",
    "oldbalancedest": 20000.00,
    "newbalancedest": 30000.50,
    "isFlaggedFraud": 0,
    "isFraud": 0
}'
{"fraud_probability":0.0,"is_fraud":false}



class BankTransactionPredictionAPIView(APIView):
    permission_classes = [AllowAny]  # ✅ Allow access to all users

    def post(self, request, *args, **kwargs):
        transaction_data = request.data
        try:
            prediction = predict_fraud(transaction_data)
            transaction_data.update(prediction)
            BankTransaction.objects.create(**transaction_data)
            return Response(prediction, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

"""
