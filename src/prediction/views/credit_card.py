import json
import numpy as np
import pandas as pd
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from prediction.utils.credit_card import predict_fraud
from processing.models import CreditCardTransaction
from prediction.serializers import CreditCardTransactionSerializer

from rest_framework.permissions import AllowAny


from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')  # ✅ Exempt CSRF for API calls



class CreditCardPredictionAPIView(APIView):
    permission_classes = [AllowAny]  # ✅ Allow access to all users

    def post(self, request, *args, **kwargs):
        try:
            # Parse incoming JSON data
            transaction_data = request.data

            # Make a prediction using the ML and ANN models
            prediction_result = predict_fraud(transaction_data)

            # Add prediction results to the transaction data
            transaction_data.update(prediction_result)

            # Save the transaction with prediction to the database
            serializer = CreditCardTransactionSerializer(data=transaction_data)
            if serializer.is_valid():
                serializer.save()
                return Response(prediction_result, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
