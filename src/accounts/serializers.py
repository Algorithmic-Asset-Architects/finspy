"""
from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'role']  


"""

"""from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'role', 'first_name', 'last_name']  # add or change as desired
"""





from rest_framework import serializers
from allauth.socialaccount.models import SocialAccount
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'role', 'first_name', 'last_name', 'profile_picture']

    def get_profile_picture(self, obj):
        try:
            social_account = SocialAccount.objects.get(user=obj, provider='google')
            return social_account.extra_data.get('picture', obj.profile_picture)
        except SocialAccount.DoesNotExist:
            return obj.profile_picture
        


from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from .models import CustomUser

class CustomRegisterSerializer(RegisterSerializer):
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, required=True)

    def save(self, request):
        user = super().save(request)
        user.role = self.validated_data["role"]
        user.save()
        return user
