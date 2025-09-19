from rest_framework import serializers
from .models import APIRequestLog, DatabasePerformance, ActiveUser, ModelPerformance

class APIRequestLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIRequestLog
        fields = '__all__' # or specify 

class DatabasePerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabasePerformance
        fields = '__all__'

class ActiveUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActiveUser
        fields = '__all__'

class ModelPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelPerformance
        fields = '__all__'
