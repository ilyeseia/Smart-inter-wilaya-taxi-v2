"""User Service Application Configuration"""

from django.apps import AppConfig

class UserServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_service'
    verbose_name = 'Smart Taxi User Service'
    
    def ready(self):
        """Import signal handlers when app is ready."""
        import user_service.signals