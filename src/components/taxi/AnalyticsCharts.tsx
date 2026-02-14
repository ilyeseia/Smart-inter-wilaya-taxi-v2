'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { translations, Language } from '@/lib/i18n';
import { TrendingUp, TrendingDown, DollarSign, Car, Users, MapPin, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsChartsProps {
  language?: Language;
  isLoading?: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

// Generate demo data
function generateDemoChartData() {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      trips: Math.floor(Math.random() * 50) + 20,
      earnings: Math.floor(Math.random() * 100000) + 50000,
    });
  }
  return data;
}

function generateDemoRoutes() {
  return [
    { route: 'الجزائر → وهران', count: 245, earnings: 1785000 },
    { route: 'الجزائر → قسنطينة', count: 189, earnings: 1096200 },
    { route: 'وهران → قسنطينة', count: 156, earnings: 1326000 },
    { route: 'الجزائر → سطيف', count: 134, earnings: 696800 },
    { route: 'الجزائر → باتنة', count: 98, earnings: 612500 },
  ];
}

function generateDemoDistribution() {
  return [
    { name: 'الجزائر', value: 35 },
    { name: 'وهران', value: 20 },
    { name: 'قسنطينة', value: 18 },
    { name: 'سطيف', value: 15 },
    { name: 'أخرى', value: 12 },
  ];
}

export function AnalyticsCharts({
  language = 'ar',
  isLoading,
}: AnalyticsChartsProps) {
  const t = translations[language];
  const isRTL = language === 'ar';
  
  const [chartData, setChartData] = useState(generateDemoChartData());
  const [topRoutes, setTopRoutes] = useState(generateDemoRoutes());
  const [distribution, setDistribution] = useState(generateDemoDistribution());

  useEffect(() => {
    // Simulate data refresh
    const interval = setInterval(() => {
      setChartData(generateDemoChartData());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalTrips = chartData.reduce((sum, d) => sum + d.trips, 0);
  const totalEarnings = chartData.reduce((sum, d) => sum + d.earnings, 0);
  const avgTrips = Math.round(totalTrips / chartData.length);
  const avgEarnings = Math.round(totalEarnings / chartData.length);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Car className="h-5 w-5 text-blue-500" />
              </div>
              <div className={cn(isRTL && 'text-right')}>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي الرحلات' : 'Total Trajets'}
                </p>
                <p className="text-2xl font-bold">{totalTrips.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div className={cn(isRTL && 'text-right')}>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'الأرباح الإجمالية' : 'Revenus Totaux'}
                </p>
                <p className="text-2xl font-bold">{(totalEarnings / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
              <div className={cn(isRTL && 'text-right')}>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'متوسط الرحلات' : 'Moyenne Trajets'}
                </p>
                <p className="text-2xl font-bold">{avgTrips}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <MapPin className="h-5 w-5 text-purple-500" />
              </div>
              <div className={cn(isRTL && 'text-right')}>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'الطرق النشطة' : 'Routes Actives'}
                </p>
                <p className="text-2xl font-bold">{topRoutes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t.analytics}
          </CardTitle>
          <CardDescription>
            {language === 'ar' ? 'تحليل الأداء خلال آخر 30 يوم' : 'Analyse des performances sur les 30 derniers jours'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trips" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trips">
                {language === 'ar' ? 'الرحلات' : 'Trajets'}
              </TabsTrigger>
              <TabsTrigger value="earnings">
                {language === 'ar' ? 'الأرباح' : 'Revenus'}
              </TabsTrigger>
              <TabsTrigger value="routes">
                {language === 'ar' ? 'الطرق' : 'Routes'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trips" className="mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        });
                      }}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        });
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="trips"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorTrips)"
                      name={language === 'ar' ? 'الرحلات' : 'Trajets'}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        });
                      }}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [
                        `${(value / 1000).toFixed(1)}K DZD`,
                        language === 'ar' ? 'الأرباح' : 'Revenus',
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b' }}
                      name={language === 'ar' ? 'الأرباح' : 'Revenus'}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="routes" className="mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRoutes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis
                      type="category"
                      dataKey="route"
                      className="text-xs"
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      name={language === 'ar' ? 'عدد الرحلات' : 'Nombre de trajets'}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Distribution Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'ar' ? 'توزيع الولايات' : 'Distribution par Wilaya'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {distribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'ar' ? 'أفضل الطرق' : 'Top Routes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRoutes.slice(0, 5).map((route, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg hover:bg-muted/50',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm">{route.route}</span>
                  </div>
                  <div className={cn('text-right', isRTL && 'text-left')}>
                    <p className="text-sm font-medium">{route.count} {language === 'ar' ? 'رحلة' : 'trajets'}</p>
                    <p className="text-xs text-muted-foreground">{(route.earnings / 1000).toFixed(0)}K DZD</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
