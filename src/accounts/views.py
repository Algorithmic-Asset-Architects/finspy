"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from .serializers import CustomUserSerializer

from rest_framework.permissions import IsAuthenticated

class UserListAPIView(APIView):
    def get(self, request, format=None):
        users = CustomUser.objects.all()
        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)
"""


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from allauth.socialaccount.models import SocialAccount
from .models import CustomUser
from .serializers import CustomUserSerializer
from .serializers import CustomRegisterSerializer


class UserListAPIView(APIView):
    # get all users list
    def get(self, request, format=None):
        users = CustomUser.objects.all()
        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CurrentUserAPIView(APIView):
	# get all current logged in 
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        #serializer = CustomUserSerializer(user)
        serializer = CustomRegisterSerializer(user)

        
        return Response(serializer.data, status=status.HTTP_200_OK)
