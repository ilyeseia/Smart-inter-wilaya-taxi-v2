'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { translations, Language } from '@/lib/i18n';
import { 
  Users, 
  Car, 
  DollarSign, 
  MapPin, 
  Activity, 
  CheckCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: 'users' | 'car' | 'dollar' | 'map' | 'activity' | 'check';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  language?: Language;
  isLoading?: boolean;
}

const iconMap = {
  users: Users,
  car: Car,
  dollar: DollarSign,
  map: MapPin,
  activity: Activity,
  check: CheckCircle,
};

const colorMap = {
  users: 'text-blue-500',
  car: 'text-green-500',
  dollar: 'text-amber-500',
  map: 'text-purple-500',
  activity: 'text-red-500',
  check: 'text-teal-500',
};

const bgColorMap = {
  users: 'bg-blue-500/10',
  car: 'bg-green-500/10',
  dollar: 'bg-amber-500/10',
  map: 'bg-purple-500/10',
  activity: 'bg-red-500/10',
  check: 'bg-teal-500/10',
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  language = 'ar',
  isLoading = false,
}: StatsCardProps) {
  const t = translations[language];
  const Icon = iconMap[icon];
  const isRTL = language === 'ar';

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', bgColorMap[icon])}>
          <Icon className={cn('h-5 w-5', colorMap[icon])} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('flex items-end gap-2', isRTL && 'flex-row-reverse')}>
          <div className="text-2xl font-bold">{value}</div>
          {trend && trendValue && (
            <span
              className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-green-500',
                trend === 'down' && 'text-red-500',
                trend === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trendValue}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Stats Grid Component
interface StatsGridProps {
  language?: Language;
  stats: {
    totalDrivers: number;
    onlineDrivers: number;
    activeTrips: number;
    totalEarnings: number;
    completedTripsToday: number;
    totalPassengers: number;
  };
  isLoading?: boolean;
}

export function StatsGrid({ language = 'ar', stats, isLoading }: StatsGridProps) {
  const t = translations[language];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatsCard
        title={t.totalDrivers}
        value={stats.totalDrivers}
        subtitle={`${stats.onlineDrivers} ${t.online}`}
        icon="car"
        language={language}
        isLoading={isLoading}
      />
      <StatsCard
        title={t.activeTrips}
        value={stats.activeTrips}
        icon="activity"
        language={language}
        isLoading={isLoading}
      />
      <StatsCard
        title={t.totalEarnings}
        value={`${stats.totalEarnings.toLocaleString()} ${t.currency}`}
        icon="dollar"
        trend="up"
        trendValue="12%"
        language={language}
        isLoading={isLoading}
      />
      <StatsCard
        title={t.totalPassengers}
        value={stats.totalPassengers}
        icon="users"
        language={language}
        isLoading={isLoading}
      />
      <StatsCard
        title={t.onlineDrivers}
        value={stats.onlineDrivers}
        icon="car"
        language={language}
        isLoading={isLoading}
      />
      <StatsCard
        title={t.completedTripsToday}
        value={stats.completedTripsToday}
        icon="check"
        language={language}
        isLoading={isLoading}
      />
    </div>
  );
}
