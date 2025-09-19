from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from .models import APIRequestLog, DatabasePerformance, ActiveUser, ModelPerformance
from .serializers import APIRequestLogSerializer, DatabasePerformanceSerializer, ActiveUserSerializer, ModelPerformanceSerializer
from rest_framework.permissions import AllowAny


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils.rds_metrics import get_rds_metrics


import os
from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser

class APIRequestLogListView(generics.ListAPIView):
    # get API logs stored
    permission_classes = [AllowAny]

    queryset = APIRequestLog.objects.all().order_by('-timestamp')[:100]  # limit 100, todo count
    serializer_class = APIRequestLogSerializer
    #permission_classes = [IsAdminUser]

class DatabasePerformanceListView(generics.ListAPIView):
    #get DB logs 
    permission_classes = [AllowAny]
    
    queryset = DatabasePerformance.objects.all().order_by('-timestamp')[:50]
    serializer_class = DatabasePerformanceSerializer
    #permission_classes = [IsAdminUser]

class ActiveUserListView(generics.ListAPIView):
    #get active users api
    permission_classes = [AllowAny]
    
    queryset = ActiveUser.objects.all().order_by('-last_active')[:50]
    serializer_class = ActiveUserSerializer
    #permission_classes = [IsAdminUser]

class ModelPerformanceListView(generics.ListAPIView):
    #ML model performce api
    permission_classes = [AllowAny]
    
    queryset = ModelPerformance.objects.all().order_by('-last_updated')[:10]
    serializer_class = ModelPerformanceSerializer
    #permission_classes = [IsAdminUser]



class RDSMetricsAPIView(APIView):
    def get(self, request, format=None):
        metrics = {
            "CPU Utilization (%)": get_rds_metrics("CPUUtilization"),
            "Free Memory (MB)": get_rds_metrics("FreeableMemory"),
            "Read IOPS": get_rds_metrics("ReadIOPS"),
            "Write IOPS": get_rds_metrics("WriteIOPS"),
            "Database Connections": get_rds_metrics("DatabaseConnections"),
        }
        return Response(metrics, status=status.HTTP_200_OK)




class ServerLogsAPIView(APIView):
    #permission_classes = [IsAdminUser]  
    permission_classes = [AllowAny]


    def get(self, request):
        log_file = os.path.join(settings.BASE_DIR, "logs", "server.log")

        
        if not os.path.exists(log_file):
            return Response({"error": "Log file not found"}, status=404)


        with open(log_file, "r") as f:
            logs = f.readlines()[-100:]  # todo - limit change - custom
        return Response({"logs": logs})
