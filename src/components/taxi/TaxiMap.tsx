'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { translations, Language } from '@/lib/i18n';
import { ALGERIA_CENTER, DEMO_DRIVERS } from '@/lib/constants';
import { MapMarker } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MapPin, Users, Navigation, RefreshCw, Layers } from 'lucide-react';

// Since Leaflet can't be used in SSR, we'll create a simulated map
interface TaxiMapProps {
  drivers: Array<{
    id: string;
    name: string;
    status: string;
    driverProfile?: {
      wilaya: string;
      vehicleType: string;
    } | null;
    locations?: Array<{
      latitude: number;
      longitude: number;
    }>;
  }>;
  language?: Language;
  isLoading?: boolean;
  onDriverClick?: (driverId: string) => void;
}

export function TaxiMap({
  drivers,
  language = 'ar',
  isLoading,
  onDriverClick,
}: TaxiMapProps) {
  const t = translations[language];
  const isRTL = language === 'ar';
  const [showOffline, setShowOffline] = useState(false);
  const [mapStyle, setMapStyle] = useState<'light' | 'dark'>('light');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  // Filter drivers based on showOffline toggle
  const displayedDrivers = drivers.filter((d) => 
    showOffline || d.status !== 'offline'
  );

  // Generate marker positions for the map visualization
  const markers: MapMarker[] = displayedDrivers.map((driver) => {
    const loc = driver.locations?.[0];
    return {
      id: driver.id,
      lat: loc?.latitude || ALGERIA_CENTER.lat + (Math.random() - 0.5) * 10,
      lng: loc?.longitude || ALGERIA_CENTER.lng + (Math.random() - 0.5) * 10,
      label: driver.name,
      type: 'driver',
      status: driver.status,
    };
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t.liveTracking}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              {t.refresh}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Map Visualization */}
        <div 
          className={cn(
            'relative h-[400px] overflow-hidden',
            mapStyle === 'dark' ? 'bg-slate-900' : 'bg-slate-100'
          )}
        >
          {/* Grid Lines for Map Effect */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Algeria Shape Placeholder */}
          <div 
            className={cn(
              'absolute inset-8 rounded-lg border-2 border-dashed',
              mapStyle === 'dark' ? 'border-slate-700' : 'border-slate-300'
            )}
          >
            <div className="absolute top-2 left-2 text-xs text-muted-foreground">
              {language === 'ar' ? 'الجزائر' : 'Algérie'}
            </div>
          </div>

          {/* Driver Markers */}
          {markers.map((marker, index) => (
            <div
              key={marker.id}
              className={cn(
                'absolute cursor-pointer transition-all duration-200 transform hover:scale-110',
                selectedDriver === marker.id && 'scale-125 z-10'
              )}
              style={{
                left: `${20 + (index % 5) * 15}%`,
                top: `${15 + Math.floor(index / 5) * 20}%`,
              }}
              onClick={() => {
                setSelectedDriver(marker.id);
                onDriverClick?.(marker.id);
              }}
            >
              {/* Marker Dot */}
              <div className="relative">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shadow-lg',
                    marker.status === 'online' && 'bg-green-500',
                    marker.status === 'busy' && 'bg-yellow-500',
                    marker.status === 'offline' && 'bg-gray-500'
                  )}
                >
                  <Navigation className="h-4 w-4 text-white" />
                </div>
                
                {/* Pulse Animation for Online Drivers */}
                {marker.status === 'online' && (
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
                )}
              </div>

              {/* Tooltip */}
              {selectedDriver === marker.id && (
                <div
                  className={cn(
                    'absolute top-10 left-1/2 -translate-x-1/2 bg-background border rounded-lg p-2 shadow-lg whitespace-nowrap z-20',
                    mapStyle === 'dark' && 'bg-slate-800 border-slate-700'
                  )}
                >
                  <p className="text-sm font-medium">{marker.label}</p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'mt-1 text-xs',
                      marker.status === 'online' && 'bg-green-500/10 text-green-600',
                      marker.status === 'busy' && 'bg-yellow-500/10 text-yellow-600'
                    )}
                  >
                    {marker.status === 'online' && (language === 'ar' ? 'متصل' : 'En ligne')}
                    {marker.status === 'busy' && (language === 'ar' ? 'مشغول' : 'Occupé')}
                    {marker.status === 'offline' && (language === 'ar' ? 'غير متصل' : 'Hors ligne')}
                  </Badge>
                </div>
              )}
            </div>
          ))}

          {/* Map Legend */}
          <div
            className={cn(
              'absolute bottom-4 left-4 p-3 rounded-lg shadow-lg',
              mapStyle === 'dark' ? 'bg-slate-800' : 'bg-background'
            )}
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>{language === 'ar' ? 'متصل' : 'En ligne'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>{language === 'ar' ? 'مشغول' : 'Occupé'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span>{language === 'ar' ? 'غير متصل' : 'Hors ligne'}</span>
              </div>
            </div>
          </div>

          {/* Driver Count */}
          <div
            className={cn(
              'absolute top-4 right-4 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2',
              mapStyle === 'dark' ? 'bg-slate-800' : 'bg-background'
            )}
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {markers.filter((m) => m.status === 'online').length} / {markers.length}
            </span>
          </div>
        </div>

        {/* Map Controls */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="show-offline"
                checked={showOffline}
                onCheckedChange={setShowOffline}
              />
              <Label htmlFor="show-offline" className="text-sm">
                {t.hideOffline}
              </Label>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapStyle(mapStyle === 'dark' ? 'light' : 'dark')}
          >
            <Layers className="h-4 w-4 mr-1" />
            {mapStyle === 'dark' 
              ? (language === 'ar' ? 'فاتح' : 'Clair')
              : (language === 'ar' ? 'داكن' : 'Sombre')
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
