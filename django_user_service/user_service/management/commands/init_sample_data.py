"""User Service Management Commands
Custom Django management commands
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from user_service.models import UserRole, Vehicle
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class Command(BaseCommand):
    help = 'Initialize database with sample data for Smart Taxi platform'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreation of sample data',
        )
    
    def handle(self, *args, **options):
        """Initialize database with sample data"""
        
        if options['force']:
            self.stdout.write(self.style.WARNING('Forcing recreation of sample data...'))
            # Clear existing data
            User.objects.all().delete()
            Vehicle.objects.all().delete()
        
        # Create sample users
        self.create_sample_users()
        
        # Create sample vehicles
        self.create_sample_vehicles()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully initialized sample data')
        )
    
    def create_sample_users(self):
        """Create sample users"""
        
        # Admin user
        admin_user, created = User.objects.get_or_create(
            email='admin@smarttaxi.dz',
            defaults={
                'first_name': 'System',
                'last_name': 'Administrator',
                'phone_number': '+213555000000',
                'city': 'Algiers',
                'wilaya': 'Algiers',
                'license_number': 'ADMIN001',
                'is_active': True,
                'is_verified': True,
            }
        )
        
        if created:
            admin_user.set_password('password')
            admin_user.save()
            UserRole.objects.get_or_create(user=admin_user, role='ROLE_ADMIN')
            self.stdout.write(self.style.SUCCESS(f'Created admin user: {admin_user.email}'))
        else:
            self.stdout.write(self.style.WARNING(f'Admin user already exists: {admin_user.email}'))
        
        # Sample driver
        driver_user, created = User.objects.get_or_create(
            email='driver1@smarttaxi.dz',
            defaults={
                'first_name': 'Ahmed',
                'last_name': 'Benali',
                'phone_number': '+213555123456',
                'city': 'Algiers',
                'wilaya': 'Algiers',
                'license_number': 'D123456',
                'is_active': True,
                'is_verified': True,
            }
        )
        
        if created:
            driver_user.set_password('password')
            driver_user.save()
            UserRole.objects.get_or_create(user=driver_user, role='ROLE_USER')
            self.stdout.write(self.style.SUCCESS(f'Created driver user: {driver_user.email}'))
        else:
            self.stdout.write(self.style.WARNING(f'Driver user already exists: {driver_user.email}'))
    
    def create_sample_vehicles(self):
        """Create sample vehicles"""
        
        vehicle_data = [
            {
                'license_plate': '12345-Algiers-16',
                'make': 'Renault',
                'model': 'Symbol',
                'year_of_manufacture': 2018,
                'vehicle_type': 'sedan',
                'color': 'White',
                'seats': 4,
                'insurance_number': 'INS123456',
                'registration_number': 'REG789012',
                'is_verified': True,
            },
            {
                'license_plate': '67890-Oran-31',
                'make': 'Peugeot',
                'model': '208',
                'year_of_manufacture': 2020,
                'vehicle_type': 'hatchback',
                'color': 'Blue',
                'seats': 5,
                'insurance_number': 'INS789012',
                'registration_number': 'REG345678',
                'is_verified': False,
            },
        ]
        
        for data in vehicle_data:
            vehicle, created = Vehicle.objects.get_or_create(
                license_plate=data['license_plate'],
                defaults=data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created vehicle: {vehicle.license_plate}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Vehicle already exists: {vehicle.license_plate}')
                )
        
        # Associate vehicles with users
        try:
            driver1 = User.objects.get(email='driver1@smarttaxi.dz')
            vehicle1 = Vehicle.objects.get(license_plate='12345-Algiers-16')
            vehicle1.drivers.add(driver1)
            self.stdout.write(
                self.style.SUCCESS(f'Associated {driver1.email} with {vehicle1.license_plate}')
            )
        except (User.DoesNotExist, Vehicle.DoesNotExist) as e:
            self.stdout.write(
                self.style.ERROR(f'Could not associate user with vehicle: {e}')
            )