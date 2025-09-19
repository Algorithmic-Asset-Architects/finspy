from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from prediction.utils.deposit_fraud import predict_fraud
from prediction.models import DepositFraudTransaction
from prediction.serializers import DepositFraudSerializer

from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')  # ✅ Exempt CSRF for API calls
#     permission_classes = [AllowAny]  # ✅ Allow access to all users


class DepositFraudPredictionAPIView(APIView):
    """API Endpoint for Deposit Fraud Prediction"""
    permission_classes = [AllowAny]  # ✅ Allow access to all users

    def post(self, request):
        try:
            data = request.data  # Incoming JSON data

            # 🔹 Convert camelCase JSON field names to match the database table fields
            mapped_data = {
                "step": data.get("Step"),
                "transactiontype": data.get("transactionType"),
                "amount": data.get("Amount"),
                "startingclient": data.get("startingClient"),
                "oldbalstartingclient": data.get("oldBalStartingClient"),
                "newbalstartingclient": data.get("newBalStartingClient"),
                "destinationclient": data.get("destinationClient"),
                "oldbaldestclient": data.get("oldBalDestClient"),
                "newbaldestclient": data.get("newBalDestClient"),
            }

            # 🔹 Validate data using Django Serializer
            serializer = DepositFraudSerializer(data=mapped_data)
            if not serializer.is_valid():
                return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            # 🔹 Predict fraud probability
            prediction_result = predict_fraud(mapped_data)

            # 🔹 Save to database
            db_data = mapped_data.copy()
            db_data.update({
                "fraud_probability": prediction_result["fraud_probability"],
                "is_fraud": prediction_result["is_fraud"]
            })
            DepositFraudTransaction.objects.create(**db_data)

            return Response(prediction_result, status=status.HTTP_201_CREATED)

        except KeyError as e:
            return Response({"error": f"Missing field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
