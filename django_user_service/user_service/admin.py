"""User Service Admin Configuration
Django admin interface configuration
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, Vehicle, UserRole, UserVehicle


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin interface"""
    
    list_display = (
        'email',
        'first_name',
        'last_name',
        'city',
        'wilaya',
        'is_active',
        'is_verified',
        'created_at',
    )
    
    list_filter = (
        'is_active',
        'is_verified',
        'is_staff',
        'is_superuser',
        'user_roles__role',
        'city',
        'wilaya',
        'created_at',
    )
    
    search_fields = (
        'email',
        'first_name',
        'last_name',
        'license_number',
        'phone_number',
    )
    
    readonly_fields = (
        'id',
        'date_joined',
        'last_login',
        'created_at',
        'updated_at',
    )
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Smart Taxi Information', {
            'fields': (
                'phone_number',
                'address',
                'city',
                'wilaya',
                'license_number',
            )
        }),
        ('Status', {
            'fields': (
                'is_active',
                'is_verified',
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related()
    
    def get_roles(self, obj):
        """Display user roles"""
        roles = [ur.role for ur in obj.user_roles.all()]
        return ', '.join(roles)
    get_roles.short_description = 'Roles'
    
    actions = ['activate_users', 'deactivate_users', 'verify_users']
    
    def activate_users(self, request, queryset):
        """Activate selected users"""
        count = queryset.activate()
        self.message_user(request, f'{count} users activated.')
    activate_users.short_description = 'Activate selected users'
    
    def deactivate_users(self, request, queryset):
        """Deactivate selected users"""
        count = queryset.deactivate()
        self.message_user(request, f'{count} users deactivated.')
    deactivate_users.short_description = 'Deactivate selected users'
    
    def verify_users(self, request, queryset):
        """Verify selected users"""
        count = queryset.verify()
        self.message_user(request, f'{count} users verified.')
    verify_users.short_description = 'Verify selected users'


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    """Vehicle admin interface"""
    
    list_display = (
        'license_plate',
        'make',
        'model',
        'year_of_manufacture',
        'color',
        'is_active',
        'is_verified',
        'driver_count',
    )
    
    list_filter = (
        'is_active',
        'is_verified',
        'vehicle_type',
        'make',
        'year_of_manufacture',
        'created_at',
    )
    
    search_fields = (
        'license_plate',
        'make',
        'model',
        'insurance_number',
        'registration_number',
    )
    
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )
    
    fieldsets = (
        ('Vehicle Information', {
            'fields': (
                'license_plate',
                'make',
                'model',
                'year_of_manufacture',
                'vehicle_type',
                'color',
                'seats',
            )
        }),
        ('Status', {
            'fields': (
                'is_active',
                'is_verified',
            )
        }),
        ('Insurance & Registration', {
            'fields': (
                'insurance_number',
                'insurance_expiry',
                'registration_number',
                'registration_expiry',
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with prefetch_related"""
        return super().get_queryset(request).prefetch_related('drivers')
    
    def driver_count(self, obj):
        """Display number of drivers"""
        return obj.drivers.count()
    driver_count.short_description = 'Drivers'
    
    actions = ['activate_vehicles', 'deactivate_vehicles', 'verify_vehicles']
    
    def activate_vehicles(self, request, queryset):
        """Activate selected vehicles"""
        count = sum(1 for v in queryset if v.activate())
        self.message_user(request, f'{count} vehicles activated.')
    activate_vehicles.short_description = 'Activate selected vehicles'
    
    def deactivate_vehicles(self, request, queryset):
        """Deactivate selected vehicles"""
        count = sum(1 for v in queryset if v.deactivate())
        self.message_user(request, f'{count} vehicles deactivated.')
    deactivate_vehicles.short_description = 'Deactivate selected vehicles'
    
    def verify_vehicles(self, request, queryset):
        """Verify selected vehicles"""
        count = sum(1 for v in queryset if v.verify())
        self.message_user(request, f'{count} vehicles verified.')
    verify_vehicles.short_description = 'Verify selected vehicles'


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    """User Role admin interface"""
    
    list_display = (
        'user',
        'role',
        'created_at',
    )
    
    list_filter = (
        'role',
        'created_at',
    )
    
    search_fields = (
        'user__email',
        'user__first_name',
        'user__last_name',
    )
    
    readonly_fields = (
        'id',
        'created_at',
    )


@admin.register(UserVehicle)
class UserVehicleAdmin(admin.ModelAdmin):
    """User Vehicle Association admin interface"""
    
    list_display = (
        'user',
        'vehicle',
        'created_at',
    )
    
    list_filter = (
        'created_at',
        'vehicle__make',
        'vehicle__vehicle_type',
    )
    
    search_fields = (
        'user__email',
        'user__first_name',
        'user__last_name',
        'vehicle__license_plate',
        'vehicle__make',
    )
    
    readonly_fields = (
        'id',
        'created_at',
    )
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related('user', 'vehicle')


# Customize admin site header
admin.site.site_header = "Smart Inter-Wilaya Taxi - User Service"
admin.site.site_title = "Smart Taxi User Admin"
admin.site.index_title = "User Service Administration"