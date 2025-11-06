"""Gateway Service Application Configuration"""

from django.apps import AppConfig

class GatewayServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gateway_service'
    verbose_name = 'Smart Taxi API Gateway'