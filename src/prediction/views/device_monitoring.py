from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from prediction.utils.device_monitoring import predict_fraud
from prediction.models import DeviceMonitoringTransaction
from prediction.serializers import DeviceMonitoringSerializer

from rest_framework.permissions import AllowAny


from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')  # ✅ Exempt CSRF for API calls


class DeviceMonitoringPredictionAPIView(APIView):
    permission_classes = [AllowAny]  # ✅ Allow access to all users

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            prediction = predict_fraud(data)

            # ✅ Save result to the database
            DeviceMonitoringTransaction.objects.create(
                income=data.get("income", 0),
                name_email_similarity=data.get("name_email_similarity", 0),
                prev_address_months_count=data.get("prev_address_months_count", 0),
                current_address_months_count=data.get("current_address_months_count", 0),
                customer_age=data.get("customer_age", 0),
                days_since_request=data.get("days_since_request", 0),
                intended_balcon_amount=data.get("intended_balcon_amount", 0),
                payment_type=data.get("payment_type", "Unknown"),
                zip_count_4w=data.get("zip_count_4w", 0),
                velocity_6h=data.get("velocity_6h", 0),
                velocity_24h=data.get("velocity_24h", 0),
                velocity_4w=data.get("velocity_4w", 0),
                bank_branch_count_8w=data.get("bank_branch_count_8w", 0),
                date_of_birth_distinct_emails_4w=data.get("date_of_birth_distinct_emails_4w", 0),
                employment_status=data.get("employment_status", "Unknown"),
                credit_risk_score=data.get("credit_risk_score", 0),
                email_is_free=data.get("email_is_free", 0),
                housing_status=data.get("housing_status", "Unknown"),
                phone_home_valid=data.get("phone_home_valid", 0),
                phone_mobile_valid=data.get("phone_mobile_valid", 0),
                bank_months_count=data.get("bank_months_count", 0),
                has_other_cards=data.get("has_other_cards", 0),
                proposed_credit_limit=data.get("proposed_credit_limit", 0),
                foreign_request=data.get("foreign_request", 0),
                source=data.get("source", "Unknown"),
                session_length_in_minutes=data.get("session_length_in_minutes", 0),
                device_os=data.get("device_os", "Unknown"),
                keep_alive_session=data.get("keep_alive_session", 0),
                device_distinct_emails_8w=data.get("device_distinct_emails_8w", 0),
                device_fraud_count=data.get("device_fraud_count", 0),
                cr_month=data.get("cr_month", 0),
                fraud_probability=prediction["fraud_probability"],
                is_fraud=prediction["is_fraud"]
            )

            return Response(prediction, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class DeviceMonitoringPredictionAPIView(APIView):
    permission_classes = [AllowAny]  # ✅ Allow access to all users
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            prediction = predict_fraud(data)

            # ✅ Save result to the database
            DeviceMonitoringTransaction.objects.create(
                income=data.get("income", None),
                name_email_similarity=data.get("name_email_similarity", None),
                customer_age=data.get("customer_age", None),
                days_since_request=data.get("days_since_request", None),
                credit_risk_score=data.get("credit_risk_score", None),
                payment_type=data.get("payment_type", None),
                velocity_6h=data.get("velocity_6h", None),
                velocity_24h=data.get("velocity_24h", None),
                velocity_4w=data.get("velocity_4w", None),
                bank_branch_count_8w=data.get("bank_branch_count_8w", None),
                proposed_credit_limit=data.get("proposed_credit_limit", None),
                source=data.get("source", None),
                device_os=data.get("device_os", None),
                device_fraud_count=data.get("device_fraud_count", None),
                fraud_probability=prediction["fraud_probability"],
                is_fraud=prediction["is_fraud"]
            )

            return Response(prediction, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
