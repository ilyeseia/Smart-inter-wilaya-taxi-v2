"""
Gateway Service Views
Django REST Framework views for API Gateway functionality
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.core.cache import cache
import requests
import logging
import time
from urllib.parse import urljoin

logger = logging.getLogger(__name__)


class ServiceProxyView(APIView):
    """Generic proxy view for routing requests to microservices"""
    
    permission_classes = [AllowAny]
    
    def __init__(self):
        self.service_urls = {
            'user': settings.USER_SERVICE_URL,
        }
    
    def proxy_request(self, service_name, path, method, data=None, headers=None):
        """Proxy request to a microservice"""
        if service_name not in self.service_urls:
            return Response({
                'error': f'Service {service_name} not found',
                'available_services': list(self.service_urls.keys())
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Build service URL
        service_url = self.service_urls[service_name]
        full_url = urljoin(f"{service_url}/", path.lstrip('/'))
        
        # Default headers
        default_headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'SmartTaxi-API-Gateway/1.0',
        }
        
        if headers:
            default_headers.update(headers)
        
        try:
            start_time = time.time()
            
            # Make request to service
            response = requests.request(
                method=method,
                url=full_url,
                json=data if method in ['POST', 'PUT', 'PATCH'] else None,
                params=data if method == 'GET' else None,
                headers=default_headers,
                timeout=30
            )
            
            # Log request
            duration = time.time() - start_time
            logger.info(f"Proxy {method} {full_url} - {response.status_code} - {duration:.3f}s")
            
            # Prepare response
            content_type = response.headers.get('content-type', 'application/json')
            
            if 'application/json' in content_type:
                response_data = response.json()
            else:
                response_data = {'raw_response': response.text}
            
            return Response(
                response_data,
                status=response.status_code,
                headers=dict(response.headers)
            )
            
        except requests.exceptions.Timeout:
            logger.error(f"Timeout proxying {method} {full_url}")
            return Response({
                'error': 'Service timeout',
                'message': 'The requested service is taking too long to respond'
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)
            
        except requests.exceptions.ConnectionError:
            logger.error(f"Connection error proxying {method} {full_url}")
            return Response({
                'error': 'Service unavailable',
                'message': 'Cannot connect to the requested service'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        except Exception as e:
            logger.error(f"Error proxying {method} {full_url}: {str(e)}")
            return Response({
                'error': 'Proxy error',
                'message': 'An error occurred while processing your request'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request, service_name, path=''):
        """Proxy GET requests"""
        return self.proxy_request(service_name, path, 'GET', data=request.GET.dict())
    
    def post(self, request, service_name, path=''):
        """Proxy POST requests"""
        return self.proxy_request(service_name, path, 'POST', data=request.data)
    
    def put(self, request, service_name, path=''):
        """Proxy PUT requests"""
        return self.proxy_request(service_name, path, 'PUT', data=request.data)
    
    def patch(self, request, service_name, path=''):
        """Proxy PATCH requests"""
        return self.proxy_request(service_name, path, 'PATCH', data=request.data)
    
    def delete(self, request, service_name, path=''):
        """Proxy DELETE requests"""
        return self.proxy_request(service_name, path, 'DELETE', data=request.data)


class ServiceStatusView(APIView):
    """Check status of all microservices"""
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get status of all services"""
        services = {
            'user-service': settings.USER_SERVICE_URL,
        }
        
        status_info = {}
        
        for service_name, service_url in services.items():
            try:
                # Try to connect to service health endpoint
                health_url = f"{service_url}/api/health/"
                response = requests.get(health_url, timeout=5)
                
                if response.status_code == 200:
                    status_info[service_name] = {
                        'status': 'healthy',
                        'url': service_url,
                        'response_time': 'fast',
                        'data': response.json()
                    }
                else:
                    status_info[service_name] = {
                        'status': 'unhealthy',
                        'url': service_url,
                        'status_code': response.status_code
                    }
            except requests.exceptions.Timeout:
                status_info[service_name] = {
                    'status': 'timeout',
                    'url': service_url,
                    'error': 'Request timeout'
                }
            except requests.exceptions.ConnectionError:
                status_info[service_name] = {
                    'status': 'unreachable',
                    'url': service_url,
                    'error': 'Connection failed'
                }
            except Exception as e:
                status_info[service_name] = {
                    'status': 'error',
                    'url': service_url,
                    'error': str(e)
                }
        
        return Response({
            'gateway_status': 'healthy',
            'services': status_info,
            'timestamp': time.time()
        })


class HealthCheckView(APIView):
    """Gateway health check endpoint"""
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Return gateway health status"""
        return Response({
            'status': 'healthy',
            'service': 'api-gateway',
            'version': '1.0.0',
            'timestamp': time.time(),
            'uptime': 'running'
        })


class ServiceListView(APIView):
    """List available microservices"""
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Return list of available services"""
        return Response({
            'services': {
                'user-service': {
                    'name': 'User Service',
                    'url': settings.USER_SERVICE_URL,
                    'endpoints': [
                        'POST /api/auth/register',
                        'POST /api/auth/login',
                        'GET /api/users/me',
                        'GET /api/users/list',
                        'GET /api/users/{id}',
                        'GET /api/vehicles',
                        'GET /api/vehicles/{id}',
                        'GET /api/health',
                    ]
                }
            },
            'gateway_info': {
                'version': '1.0.0',
                'endpoints': [
                    'GET /api/services/status - Check all services',
                    'GET /api/services/list - List available services',
                    'GET /api/health - Gateway health check',
                    'PROXY /api/{service}/{path} - Proxy to services',
                ]
            }
        })