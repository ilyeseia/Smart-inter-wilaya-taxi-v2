"""User Service Signals
Django signal handlers for the user service
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import User, Vehicle, UserRole, UserVehicle
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create user profile and default role when user is created"""
    if created:
        # Create default user role if it doesn't exist
        if not UserRole.objects.filter(user=instance).exists():
            UserRole.objects.create(user=instance, role='ROLE_USER')
            logger.info(f"Created default role for user: {instance.email}")


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Handle user profile updates"""
    logger.debug(f"User profile updated: {instance.email}")


@receiver(post_save, sender=Vehicle)
def handle_vehicle_update(sender, instance, created, **kwargs):
    """Handle vehicle creation and updates"""
    if created:
        logger.info(f"New vehicle created: {instance.license_plate}")
    else:
        logger.debug(f"Vehicle updated: {instance.license_plate}")


@receiver(post_delete, sender=Vehicle)
def handle_vehicle_delete(sender, instance, **kwargs):
    """Handle vehicle deletion"""
    logger.info(f"Vehicle deleted: {instance.license_plate}")


@receiver(post_save, sender=UserRole)
def handle_user_role_change(sender, instance, created, **kwargs):
    """Handle user role changes"""
    if created:
        logger.info(f"Role '{instance.role}' assigned to user: {instance.user.email}")
    else:
        logger.info(f"Role '{instance.role}' updated for user: {instance.user.email}")


@receiver(post_delete, sender=UserRole)
def handle_user_role_deletion(sender, instance, **kwargs):
    """Handle user role deletion"""
    logger.info(f"Role '{instance.role}' removed from user: {instance.user.email}")


@receiver(post_save, sender=UserVehicle)
def handle_user_vehicle_association(sender, instance, created, **kwargs):
    """Handle user-vehicle association changes"""
    if created:
        logger.info(f"User {instance.user.email} associated with vehicle {instance.vehicle.license_plate}")
    else:
        logger.info(f"User-vehicle association updated: {instance.user.email} - {instance.vehicle.license_plate}")


@receiver(post_delete, sender=UserVehicle)
def handle_user_vehicle_dissociation(sender, instance, **kwargs):
    """Handle user-vehicle dissociation"""
    logger.info(f"User {instance.user.email} dissociated from vehicle {instance.vehicle.license_plate}")