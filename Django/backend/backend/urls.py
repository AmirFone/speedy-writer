# In backend/backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse
import os

# Define a function to serve the index.html file directly
def serve_index(request):
    index_path = os.path.join(settings.FRONTEND_DIR, 'index.html')
    return FileResponse(open(index_path, 'rb'))

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', serve_index),  # Use the direct file serving function
] + static(settings.STATIC_URL, document_root=settings.FRONTEND_DIR)