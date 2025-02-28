# backend/api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('assemblyai/token/', views.get_temporary_token, name='get_temporary_token'),
]