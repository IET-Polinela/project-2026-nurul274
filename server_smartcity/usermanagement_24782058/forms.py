from django.contrib.auth.forms import UserCreationForm
from django import forms
from .models import CustomUser

class RegisterForm(UserCreationForm):

    class Meta:
        model = CustomUser
        fields = [
            'username',
            'email',
            'password1',
            'password2'
        ]

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if username and CustomUser.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError(
                f'Username "{username}" sudah terdaftar. Silakan gunakan username lain.'
            )
        return username