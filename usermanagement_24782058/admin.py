from django.contrib import admin
from .models import CustomUser

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'is_admin', 'is_member', 'is_staff')

admin.site.register(CustomUser, CustomUserAdmin)