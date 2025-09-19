"""

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('framework_admin', 'Framework Admin'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # username remains required for now

    def __str__(self):
        return self.email
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from allauth.socialaccount.models import SocialAccount

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('framework_admin', 'Framework Admin'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    #role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='framework_admin')

    profile_picture = models.URLField(blank=True, null=True)  # todo profile pic

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def get_google_profile_picture(self):
        """get google DP from."""
        try:
            social_account = SocialAccount.objects.get(user=self, provider='google')
            return social_account.extra_data.get('picture')
        except SocialAccount.DoesNotExist:
            return None
