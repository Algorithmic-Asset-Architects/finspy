from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class APIRequestLog(models.Model):
    # log all api requests 
    endpoint = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    response_time = models.FloatField(help_text="Time taken in milliseconds")
    status_code = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.endpoint} - {self.status_code}"

class DatabasePerformance(models.Model):
    # db performance tracking
    query_type = models.CharField(max_length=50)
    execution_time = models.FloatField(help_text="Time taken in milliseconds")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.query_type} - {self.execution_time}ms"

class ActiveUser(models.Model):
    # current active uers - maybe redundant - but meh
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField()
    last_active = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.email} - Last Active: {self.last_active}"

class ModelPerformance(models.Model):
    # ML model performace api
    model_name = models.CharField(max_length=100)
    accuracy = models.FloatField()
    precision = models.FloatField()
    recall = models.FloatField()
    f1_score = models.FloatField()
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.model_name} - Accuracy: {self.accuracy:.2f}"
