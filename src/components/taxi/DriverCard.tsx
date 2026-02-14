'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MapPin, 
  Car, 
  Phone, 
  MessageCircle,
  MoreVertical 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Driver, User } from '@/lib/types';
import { translations, Language } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DriverCardProps {
  driver: User & { driverProfile: Driver | null };
  language?: Language;
  onViewLocation?: (driverId: string) => void;
  onMessage?: (driverId: string) => void;
  onCall?: (driverId: string) => void;
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  busy: 'bg-yellow-500',
};

const statusLabels = {
  ar: { online: 'متصل', offline: 'غير متصل', busy: 'مشغول' },
  fr: { online: 'En ligne', offline: 'Hors ligne', busy: 'Occupé' },
};

const vehicleTypeLabels = {
  ar: { sedan: 'سيدان', van: 'فان', suv: 'دفع رباعي' },
  fr: { sedan: 'Sedan', van: 'Van', suv: 'SUV' },
};

export function DriverCard({
  driver,
  language = 'ar',
  onViewLocation,
  onMessage,
  onCall,
}: DriverCardProps) {
  const t = translations[language];
  const statusText = statusLabels[language];
  const vehicleText = vehicleTypeLabels[language];
  const isRTL = language === 'ar';
  const profile = driver.driverProfile;

  const initials = driver.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-background">
                <AvatarImage src={driver.avatar} alt={driver.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                  statusColors[driver.status as keyof typeof statusColors]
                )}
              />
            </div>
            <div className={cn(isRTL && 'text-right')}>
              <CardTitle className="text-base font-semibold">
                {driver.name}
              </CardTitle>
              {profile && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {profile.wilaya}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
              <DropdownMenuItem onClick={() => onViewLocation?.(driver.id)}>
                <MapPin className="h-4 w-4 mr-2" />
                {t.view}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMessage?.(driver.id)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                {t.chat}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCall?.(driver.id)}>
                <Phone className="h-4 w-4 mr-2" />
                {t.phone || 'اتصال'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Badge */}
        <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
          <Badge
            variant="secondary"
            className={cn(
              'font-medium',
              driver.status === 'online' && 'bg-green-500/10 text-green-600 hover:bg-green-500/20',
              driver.status === 'busy' && 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20',
              driver.status === 'offline' && 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20'
            )}
          >
            {statusText[driver.status as keyof typeof statusText]}
          </Badge>
          {profile?.isVerified && (
            <Badge variant="outline" className="text-xs">
              ✓ {language === 'ar' ? 'موثق' : 'Vérifié'}
            </Badge>
          )}
        </div>

        {/* Vehicle Info */}
        {profile && (
          <div className={cn(
            'flex items-center gap-4 text-sm text-muted-foreground',
            isRTL && 'flex-row-reverse'
          )}>
            <div className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              <span>{vehicleText[profile.vehicleType as keyof typeof vehicleText]}</span>
            </div>
            <div className="text-xs bg-muted px-2 py-0.5 rounded">
              {profile.vehiclePlate}
            </div>
          </div>
        )}

        {/* Stats Row */}
        {profile && (
          <div className={cn(
            'flex items-center justify-between pt-2 border-t',
            isRTL && 'flex-row-reverse'
          )}>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="font-medium">{profile.rating.toFixed(1)}</span>
            </div>
            <div className={cn('text-sm text-muted-foreground', isRTL && 'text-right')}>
              {profile.totalTrips} {t.totalTrips}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Driver Card Grid
interface DriverGridProps {
  drivers: (User & { driverProfile: Driver | null })[];
  language?: Language;
  isLoading?: boolean;
  onViewLocation?: (driverId: string) => void;
  onMessage?: (driverId: string) => void;
}

function DriverSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export function DriverGrid({
  drivers,
  language = 'ar',
  isLoading,
  onViewLocation,
  onMessage,
}: DriverGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <DriverSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {drivers.map((driver) => (
        <DriverCard
          key={driver.id}
          driver={driver}
          language={language}
          onViewLocation={onViewLocation}
          onMessage={onMessage}
        />
      ))}
    </div>
  );
}
