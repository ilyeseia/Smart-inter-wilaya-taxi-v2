"""User Service Views
Django REST Framework views for the Smart Inter-Wilaya Taxi Platform
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django.db import connection
from django.db.models import Q
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
from django.http import JsonResponse
import redis
import logging

from .models import User, Vehicle, UserRole, UserVehicle
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
    UserListSerializer,
    VehicleSerializer,
    VehicleCreateSerializer,
    UserVehicleAssociationSerializer,
    PasswordChangeSerializer,
    HealthCheckSerializer,
)

# Configure logging
logger = logging.getLogger(__name__)

User = get_user_model()


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for list endpoints"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class HealthCheckView(APIView):
    """Health check endpoint for service monitoring"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Return health status of the service"""
        try:
            # Check database connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                db_status = "healthy"
            
            # Check Redis connection
            try:
                cache.set('health_check', 'ok', 10)
                cache_status = "healthy"
            except redis.ConnectionError:
                cache_status = "unhealthy"
            
            health_data = {
                'status': 'healthy',
                'service': 'user-service',
                'version': '1.0.0',
                'timestamp': timezone.now().isoformat(),
                'database': db_status,
                'cache': cache_status,
            }
            
            return Response(health_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return Response({
                'status': 'unhealthy',
                'service': 'user-service',
                'error': str(e),
                'timestamp': timezone.now().isoformat(),
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class UserRegistrationView(APIView):
    """User registration endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Register a new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.info(f"User registered successfully: {user.email}")
            
            return Response({
                'message': 'User registered successfully',
                'user_id': user.id,
                'email': user.email,
            }, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"User registration failed: {serializer.errors}")
            return Response({
                'error': 'Registration failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """User profile management endpoints"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user profile"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update current user profile"""
        serializer = UserUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User profile updated: {request.user.email}")
            return Response({
                'message': 'Profile updated successfully',
                'user': UserProfileSerializer(request.user).data
            })
        else:
            return Response({
                'error': 'Update failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
    """User listing endpoint with filtering and pagination"""
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        """Get paginated list of users"""
        # Query parameters for filtering
        city = request.query_params.get('city')
        wilaya = request.query_params.get('wilaya')
        is_active = request.query_params.get('is_active')
        is_verified = request.query_params.get('is_verified')
        search = request.query_params.get('search')
        
        # Build query
        queryset = User.objects.all()
        
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        if wilaya:
            queryset = queryset.filter(wilaya__icontains=wilaya)
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
        
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(license_number__icontains=search)
            )
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = UserListSerializer(page, many=True)
        
        return paginator.get_paginated_response(serializer.data)


class UserDetailView(APIView):
    """User detail endpoint"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        """Get user details by ID"""
        try:
            user = User.objects.get(id=user_id)
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, user_id):
        """Update user (admin only)"""
        if not request.user.user_roles.filter(role='ROLE_ADMIN').exists():
            return Response({
                'error': 'Insufficient permissions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(id=user_id)
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Admin updated user profile: {user.email}")
                return Response({
                    'message': 'User updated successfully',
                    'user': UserProfileSerializer(user).data
                })
            else:
                return Response({
                    'error': 'Update failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, user_id):
        """Delete/Deactivate user (admin only)"""
        if not request.user.user_roles.filter(role='ROLE_ADMIN').exists():
            return Response({
                'error': 'Insufficient permissions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(id=user_id)
            user.deactivate()
            logger.info(f"Admin deactivated user: {user.email}")
            return Response({
                'message': 'User deactivated successfully'
            })
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class VehicleViewSet(viewsets.ModelViewSet):
    """Vehicle management ViewSet"""
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Get vehicles based on user permissions"""
        if self.request.user.user_roles.filter(role='ROLE_ADMIN').exists():
            # Admin can see all vehicles
            return Vehicle.objects.all()
        else:
            # Regular users can only see their own vehicles
            return Vehicle.objects.filter(drivers=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return VehicleCreateSerializer
        return VehicleSerializer
    
    @action(detail=True, methods=['post'])
    def associate_driver(self, request, pk=None):
        """Associate a driver with a vehicle (admin only)"""
        if not request.user.user_roles.filter(role='ROLE_ADMIN').exists():
            return Response({
                'error': 'Insufficient permissions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        vehicle = self.get_object()
        serializer = UserVehicleAssociationSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                user = User.objects.get(id=serializer.validated_data['user_id'])
                association = UserVehicle.objects.create(
                    user=user, 
                    vehicle=vehicle
                )
                logger.info(f"Admin associated user {user.email} with vehicle {vehicle.license_plate}")
                return Response({
                    'message': 'Driver associated successfully',
                    'association_id': association.id
                })
            except User.DoesNotExist:
                return Response({
                    'error': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'])
    def remove_driver(self, request, pk=None):
        """Remove driver association (admin only)"""
        if not request.user.user_roles.filter(role='ROLE_ADMIN').exists():
            return Response({
                'error': 'Insufficient permissions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        vehicle = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            association = UserVehicle.objects.get(user=user, vehicle=vehicle)
            association.delete()
            logger.info(f"Admin removed user {user.email} from vehicle {vehicle.license_plate}")
            return Response({
                'message': 'Driver association removed successfully'
            })
        except (User.DoesNotExist, UserVehicle.DoesNotExist):
            return Response({
                'error': 'Association not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a vehicle (admin only)"""
        if not request.user.user_roles.filter(role='ROLE_ADMIN').exists():
            return Response({
                'error': 'Insufficient permissions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        vehicle = self.get_object()
        vehicle.verify()
        logger.info(f"Admin verified vehicle: {vehicle.license_plate}")
        return Response({
            'message': 'Vehicle verified successfully'
        })
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a vehicle"""
        vehicle = self.get_object()
        vehicle.activate()
        logger.info(f"Vehicle activated: {vehicle.license_plate}")
        return Response({
            'message': 'Vehicle activated successfully'
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a vehicle"""
        vehicle = self.get_object()
        vehicle.deactivate()
        logger.info(f"Vehicle deactivated: {vehicle.license_plate}")
        return Response({
            'message': 'Vehicle deactivated successfully'
        })


# Error handlers
def bad_request(request, exception):
    """Handle 400 Bad Request errors"""
    return JsonResponse({
        'error': 'Bad Request',
        'message': 'The request could not be understood or was missing required parameters.',
        'status_code': 400
    }, status=400)


def permission_denied(request, exception):
    """Handle 403 Permission Denied errors"""
    return JsonResponse({
        'error': 'Permission Denied',
        'message': 'You do not have permission to access this resource.',
        'status_code': 403
    }, status=403)


def not_found(request, exception):
    """Handle 404 Not Found errors"""
    return JsonResponse({
        'error': 'Not Found',
        'message': 'The requested resource could not be found.',
        'status_code': 404
    }, status=404)


def server_error(request):
    """Handle 500 Server Error"""
    return JsonResponse({
        'error': 'Internal Server Error',
        'message': 'An internal server error occurred.',
        'status_code': 500
    }, status=500)