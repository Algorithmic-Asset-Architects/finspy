from django.contrib import admin
from .models import APIRequestLog, DatabasePerformance, ActiveUser, ModelPerformance

@admin.register(APIRequestLog)
class APIRequestLogAdmin(admin.ModelAdmin):
    list_display = ('endpoint', 'method', 'status_code', 'response_time', 'timestamp')
    search_fields = ('endpoint', 'method', 'status_code')

@admin.register(DatabasePerformance)
class DatabasePerformanceAdmin(admin.ModelAdmin):
    list_display = ('query_type', 'execution_time', 'timestamp')
    search_fields = ('query_type',)

@admin.register(ActiveUser)
class ActiveUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'last_active')
    search_fields = ('email',)

@admin.register(ModelPerformance)
class ModelPerformanceAdmin(admin.ModelAdmin):
    list_display = ('model_name', 'accuracy', 'precision', 'recall', 'f1_score', 'last_updated')
    search_fields = ('model_name',)
