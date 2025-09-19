import time
from django.utils.deprecation import MiddlewareMixin
from .models import APIRequestLog

class APILoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()

    def process_response(self, request, response):
        if request.path.startswith("/api/"):
            APIRequestLog.objects.create(
                endpoint=request.path,
                method=request.method,
                response_time=(time.time() - request.start_time) * 1000,  # conv to ms
                status_code=response.status_code
            )
        return response
