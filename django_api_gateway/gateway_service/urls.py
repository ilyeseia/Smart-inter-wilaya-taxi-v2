"""
Gateway Service URL Configuration
Django URL configuration for the API Gateway
"""

from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static

from gateway_service.views import (
    ServiceProxyView,
    ServiceStatusView,
    HealthCheckView,
    ServiceListView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Health check
    path('api/health/', HealthCheckView.as_view(), name='gateway_health'),
    
    # Service management
    path('api/services/status/', ServiceStatusView.as_view(), name='services_status'),
    path('api/services/list/', ServiceListView.as_view(), name='services_list'),
    
    # Service proxy - match any service and path
    re_path(r'^api/(?P<service_name>[a-zA-Z0-9_-]+)/(?P<path>.*)$', ServiceProxyView.as_view(), name='service_proxy'),
    re_path(r'^api/(?P<service_name>[a-zA-Z0-9_-]+)/$', ServiceProxyView.as_view(), name='service_proxy_root'),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)