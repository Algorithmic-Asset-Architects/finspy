from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from processing.credit_card.utils import predict_credit_card_fraud

class CreditCardFraudAPIView(APIView):
    def post(self, request, format=None):
        transaction = request.data
        try:
            prediction = predict_credit_card_fraud(transaction)
            return Response(prediction, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
