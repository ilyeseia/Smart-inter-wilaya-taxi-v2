"""
User Service URL Configuration
Django URL configuration for the user service
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# Import views
from user_service.views import (
    UserRegistrationView,
    UserProfileView,
    VehicleViewSet,
    UserListView,
    HealthCheckView,
    UserDetailView,
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Health check
    path('api/health/', HealthCheckView.as_view(), name='health'),
    
    # Authentication endpoints
    path('api/auth/', include([
        path('register/', UserRegistrationView.as_view(), name='register'),
        path('login/', TokenObtainPairView.as_view(), name='login'),
        path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('verify/', TokenVerifyView.as_view(), name='token_verify'),
    ])),
    
    # User management endpoints
    path('api/users/', include([
        path('me/', UserProfileView.as_view(), name='current_user'),
        path('list/', UserListView.as_view(), name='user_list'),
        path('<int:user_id>/', UserDetailView.as_view(), name='user_detail'),
    ])),
    
    # Vehicle management (nested under users)
    path('api/users/<int:user_id>/vehicles/', include([
        '',  # This will be handled by the VehicleViewSet
    ])),
    
    # Vehicle standalone endpoints
    path('api/', include(router.urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Add custom error handlers
handler400 = 'user_service.views.bad_request'
handler403 = 'user_service.views.permission_denied'
handler404 = 'user_service.views.not_found'
handler500 = 'user_service.views.server_error'