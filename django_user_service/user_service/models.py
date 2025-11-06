"""User Service Models
Django models for the Smart Inter-Wilaya Taxi Platform
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator, EmailValidator
from django.utils import timezone


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser for smart taxi drivers"""
    
    # Phone number validation
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    
    # Core user information
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()],
        help_text="User's unique email address"
    )
    
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[phone_regex],
        help_text="User's phone number"
    )
    
    address = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="User's physical address"
    )
    
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="User's city"
    )
    
    wilaya = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="User's wilaya (Algerian province)"
    )
    
    license_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        help_text="Driver's license number"
    )
    
    # Status fields
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this user should be treated as active"
    )
    
    is_verified = models.BooleanField(
        default=False,
        help_text="Designates whether the user's identity has been verified"
    )
    
    # Audit fields
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date and time when the user was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Date and time when the user was last updated"
    )
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['city', 'wilaya']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['license_number']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.email})"
    
    @property
    def full_name(self):
        """Get user's full name"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def save(self, *args, **kwargs):
        """Override save to ensure email is lowercase and handle username"""
        self.email = self.email.lower()
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)
    
    def activate(self):
        """Activate the user account"""
        self.is_active = True
        self.save(update_fields=['is_active'])
    
    def deactivate(self):
        """Deactivate the user account"""
        self.is_active = False
        self.save(update_fields=['is_active'])
    
    def verify(self):
        """Verify the user account"""
        self.is_verified = True
        self.save(update_fields=['is_verified'])


class Vehicle(models.Model):
    """Vehicle model for taxi fleet management"""
    
    VEHICLE_TYPES = [
        ('sedan', 'Sedan'),
        ('hatchback', 'Hatchback'),
        ('suv', 'SUV'),
        ('van', 'Van'),
        ('pickup', 'Pickup Truck'),
        ('other', 'Other'),
    ]
    
    # License plate (unique identifier)
    license_plate = models.CharField(
        max_length=20,
        unique=True,
        help_text="Vehicle's license plate number"
    )
    
    # Vehicle details
    make = models.CharField(
        max_length=100,
        help_text="Vehicle manufacturer (e.g., Renault, Peugeot)"
    )
    
    model = models.CharField(
        max_length=100,
        help_text="Vehicle model (e.g., Symbol, 206)"
    )
    
    year_of_manufacture = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Year the vehicle was manufactured"
    )
    
    vehicle_type = models.CharField(
        max_length=50,
        choices=VEHICLE_TYPES,
        default='sedan',
        help_text="Type of vehicle"
    )
    
    color = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Vehicle color"
    )
    
    seats = models.PositiveIntegerField(
        default=4,
        help_text="Number of seats in the vehicle"
    )
    
    # Status fields
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this vehicle is active in the fleet"
    )
    
    is_verified = models.BooleanField(
        default=False,
        help_text="Designates whether this vehicle has been verified"
    )
    
    # Insurance and registration
    insurance_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Insurance policy number"
    )
    
    insurance_expiry = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Insurance policy expiry date"
    )
    
    registration_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Vehicle registration number"
    )
    
    registration_expiry = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Vehicle registration expiry date"
    )
    
    # Audit fields
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date and time when the vehicle was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Date and time when the vehicle was last updated"
    )
    
    # Relationships
    drivers = models.ManyToManyField(
        User,
        through='UserVehicle',
        related_name='vehicles',
        blank=True,
        help_text="Users who are associated with this vehicle"
    )
    
    class Meta:
        db_table = 'vehicles'
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'
        indexes = [
            models.Index(fields=['license_plate']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['vehicle_type']),
        ]
    
    def __str__(self):
        return f"{self.make} {self.model} ({self.license_plate})"
    
    @property
    def full_name(self):
        """Get vehicle's full description"""
        return f"{self.make} {self.model} - {self.license_plate}"
    
    def activate(self):
        """Activate the vehicle"""
        self.is_active = True
        self.save(update_fields=['is_active'])
    
    def deactivate(self):
        """Deactivate the vehicle"""
        self.is_active = False
        self.save(update_fields=['is_active'])
    
    def verify(self):
        """Verify the vehicle"""
        self.is_verified = True
        self.save(update_fields=['is_verified'])
    
    def is_insurance_expired(self):
        """Check if insurance is expired"""
        if not self.insurance_expiry:
            return True
        return timezone.now() > self.insurance_expiry
    
    def is_registration_expired(self):
        """Check if registration is expired"""
        if not self.registration_expiry:
            return True
        return timezone.now() > self.registration_expiry


class UserRole(models.Model):
    """User role assignment model for role-based access control"""
    
    ROLE_CHOICES = [
        ('ROLE_USER', 'User'),
        ('ROLE_ADMIN', 'Administrator'),
        ('ROLE_DRIVER', 'Driver'),
        ('ROLE_MODERATOR', 'Moderator'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_roles',
        help_text="User assigned this role"
    )
    
    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        help_text="Role assigned to the user"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date and time when the role was assigned"
    )
    
    class Meta:
        db_table = 'user_roles'
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'
        unique_together = ('user', 'role')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"


class UserVehicle(models.Model):
    """Junction table for User-Vehicle many-to-many relationship"""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_vehicles',
        help_text="User associated with the vehicle"
    )
    
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='user_vehicles',
        help_text="Vehicle associated with the user"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date and time when the association was created"
    )
    
    class Meta:
        db_table = 'user_vehicles'
        verbose_name = 'User Vehicle Association'
        verbose_name_plural = 'User Vehicle Associations'
        unique_together = ('user', 'vehicle')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['vehicle']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.vehicle.license_plate}"