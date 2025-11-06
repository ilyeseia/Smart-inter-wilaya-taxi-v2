"""User Service Serializers
Django REST Framework serializers for the Smart Inter-Wilaya Taxi Platform
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, Vehicle, UserRole, UserVehicle
from datetime import datetime


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration requests"""
    
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        help_text="User's password (minimum 8 characters)"
    )
    
    password_confirm = serializers.CharField(
        write_only=True,
        help_text="Password confirmation"
    )
    
    class Meta:
        model = User
        fields = [
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'phone_number',
            'address',
            'city',
            'wilaya',
            'license_number',
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password confirmation does not match password.")
        return attrs
    
    def validate_email(self, value):
        """Ensure email is unique and valid"""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate_license_number(self, value):
        """Ensure license number is unique if provided"""
        if value and User.objects.filter(license_number=value).exists():
            raise serializers.ValidationError("This license number is already registered.")
        return value
    
    def create(self, validated_data):
        """Create a new user with default role"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Assign default user role
        UserRole.objects.create(user=user, role='ROLE_USER')
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login requests"""
    
    email = serializers.EmailField(help_text="User's email address")
    password = serializers.CharField(help_text="User's password")
    
    def validate(self, attrs):
        """Validate login credentials"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")
        
        # Case-insensitive email lookup
        try:
            user = User.objects.get(email=email.lower())
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
        
        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile responses"""
    
    full_name = serializers.ReadOnlyField()
    roles = serializers.SerializerMethodField()
    vehicles = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'address',
            'city',
            'wilaya',
            'license_number',
            'is_active',
            'is_verified',
            'created_at',
            'updated_at',
            'roles',
            'vehicles',
        ]
        read_only_fields = [
            'id',
            'email',
            'is_active',
            'is_verified',
            'created_at',
            'updated_at',
        ]
    
    def get_roles(self, obj):
        """Get user's roles"""
        return [role.role for role in obj.user_roles.all()]
    
    def get_vehicles(self, obj):
        """Get user's vehicles"""
        vehicles = obj.vehicles.filter(is_active=True)
        return [
            {
                'id': vehicle.id,
                'license_plate': vehicle.license_plate,
                'make': vehicle.make,
                'model': vehicle.model,
                'color': vehicle.color,
                'is_verified': vehicle.is_verified,
            }
            for vehicle in vehicles
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'phone_number',
            'address',
            'city',
            'wilaya',
        ]
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if value:
            import re
            phone_regex = r'^\+?1?\d{9,15}$'
            if not re.match(phone_regex, value):
                raise serializers.ValidationError("Invalid phone number format.")
        return value


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for user list responses"""
    
    full_name = serializers.ReadOnlyField()
    role = serializers.SerializerMethodField()
    vehicle_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'city',
            'wilaya',
            'is_active',
            'is_verified',
            'created_at',
            'role',
            'vehicle_count',
        ]
    
    def get_role(self, obj):
        """Get user's primary role"""
        user_role = obj.user_roles.first()
        return user_role.role if user_role else None
    
    def get_vehicle_count(self, obj):
        """Get count of active vehicles"""
        return obj.vehicles.filter(is_active=True).count()


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for vehicle responses"""
    
    drivers = UserProfileSerializer(many=True, read_only=True)
    full_name = serializers.ReadOnlyField()
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicle
        fields = [
            'id',
            'license_plate',
            'make',
            'model',
            'year_of_manufacture',
            'vehicle_type',
            'color',
            'seats',
            'is_active',
            'is_verified',
            'insurance_number',
            'insurance_expiry',
            'registration_number',
            'registration_expiry',
            'created_at',
            'updated_at',
            'drivers',
            'full_name',
            'is_expired',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]
    
    def get_is_expired(self, obj):
        """Check if vehicle documents are expired"""
        from django.utils import timezone
        now = timezone.now()
        
        insurance_expired = (
            obj.insurance_expiry and 
            now > obj.insurance_expiry
        )
        
        registration_expired = (
            obj.registration_expiry and 
            now > obj.registration_expiry
        )
        
        return {
            'insurance': insurance_expired,
            'registration': registration_expired,
        }


class VehicleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vehicles"""
    
    class Meta:
        model = Vehicle
        fields = [
            'license_plate',
            'make',
            'model',
            'year_of_manufacture',
            'vehicle_type',
            'color',
            'seats',
            'insurance_number',
            'insurance_expiry',
            'registration_number',
            'registration_expiry',
        ]
    
    def validate_license_plate(self, value):
        """Ensure license plate is unique"""
        if Vehicle.objects.filter(license_plate=value).exists():
            raise serializers.ValidationError("A vehicle with this license plate already exists.")
        return value


class UserVehicleAssociationSerializer(serializers.Serializer):
    """Serializer for user-vehicle associations"""
    
    user_id = serializers.IntegerField()
    vehicle_id = serializers.IntegerField()
    
    def validate_user_id(self, value):
        """Validate user exists"""
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("User does not exist.")
        return value
    
    def validate_vehicle_id(self, value):
        """Validate vehicle exists"""
        if not Vehicle.objects.filter(id=value).exists():
            raise serializers.ValidationError("Vehicle does not exist.")
        return value
    
    def validate(self, attrs):
        """Ensure association doesn't already exist"""
        user_id = attrs.get('user_id')
        vehicle_id = attrs.get('vehicle_id')
        
        if UserVehicle.objects.filter(user_id=user_id, vehicle_id=vehicle_id).exists():
            raise serializers.ValidationError("This user is already associated with this vehicle.")
        
        return attrs
    
    def create(self, validated_data):
        """Create user-vehicle association"""
        user_id = validated_data.get('user_id')
        vehicle_id = validated_data.get('vehicle_id')
        
        user = User.objects.get(id=user_id)
        vehicle = Vehicle.objects.get(id=vehicle_id)
        
        association = UserVehicle.objects.create(user=user, vehicle=vehicle)
        return association


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Password confirmation does not match password.")
        return attrs
    
    def save(self):
        """Update user's password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserRoleUpdateSerializer(serializers.Serializer):
    """Serializer for updating user roles"""
    
    role = serializers.ChoiceField(choices=[
        ('ROLE_USER', 'User'),
        ('ROLE_ADMIN', 'Administrator'),
        ('ROLE_DRIVER', 'Driver'),
        ('ROLE_MODERATOR', 'Moderator'),
    ])


class HealthCheckSerializer(serializers.Serializer):
    """Serializer for health check responses"""
    
    status = serializers.CharField()
    service = serializers.CharField()
    version = serializers.CharField()
    timestamp = serializers.DateTimeField()
    database = serializers.CharField()
    cache = serializers.CharField()