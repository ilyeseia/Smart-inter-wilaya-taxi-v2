'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { translations, Language } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  Settings,
  User,
  Bell,
  Globe,
  Moon,
  Sun,
  Shield,
  Database,
  HelpCircle,
  Plus,
  Car,
  DollarSign,
  Activity,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface AdminPanelProps {
  language?: Language;
}

// Demo data for admin
const demoUsers = [
  { id: '1', name: 'أحمد بن علي', email: 'ahmed@smarttaxi.dz', role: 'driver', status: 'active', joinedAt: '2024-01-15' },
  { id: '2', name: 'محمد بوزيد', email: 'mohamed@smarttaxi.dz', role: 'driver', status: 'active', joinedAt: '2024-02-20' },
  { id: '3', name: 'فاطمة الزهراء', email: 'fatima@smarttaxi.dz', role: 'admin', status: 'active', joinedAt: '2024-01-01' },
  { id: '4', name: 'يوسف خليفي', email: 'youcef@smarttaxi.dz', role: 'driver', status: 'pending', joinedAt: '2024-03-10' },
];

const demoAlerts = [
  { id: '1', type: 'warning', message: '5 drivers pending verification', time: '2 hours ago' },
  { id: '2', type: 'error', message: 'Payment gateway timeout', time: '4 hours ago' },
  { id: '3', type: 'success', message: 'System backup completed', time: '6 hours ago' },
  { id: '4', type: 'info', message: 'New feature deployment', time: '1 day ago' },
];

export function AdminPanel({ language = 'ar' }: AdminPanelProps) {
  const t = translations[language];
  const isRTL = language === 'ar';
  
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const alertColors = {
    warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-600 border-red-500/20',
    success: 'bg-green-500/10 text-green-600 border-green-500/20',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  };

  const alertIcons = {
    warning: AlertTriangle,
    error: AlertTriangle,
    success: CheckCircle2,
    info: Activity,
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div className={cn(isRTL && 'text-right')}>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'المستخدمين' : 'Utilisateurs'}
                </p>
                <p className="text-2xl font-bold">1,243</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Car className="h-5 w-5 text-green-500" />
              </div>
              <div className={cn(isRTL && 'text-right')}>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'السائقين' : 'Chauffeurs'}
                </p>
                <p className="text-2xl font-bold">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div className={cn(isRTL && 'text-right')}>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'الإيرادات' : 'Revenus'}
                </p>
                <p className="text-2xl font-bold">2.4M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div className={cn(isRTL && 'text-right')}>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'النمو' : 'Croissance'}
                </p>
                <p className="text-2xl font-bold">+15%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={cn('text-lg flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <Settings className="h-5 w-5" />
                {language === 'ar' ? 'إعدادات النظام' : 'Paramètres Système'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                <Label htmlFor="notifications">
                  {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                </Label>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                <Label htmlFor="email">
                  {language === 'ar' ? 'تنبيهات البريد' : 'Alertes Email'}
                </Label>
                <Switch
                  id="email"
                  checked={emailAlerts}
                  onCheckedChange={setEmailAlerts}
                />
              </div>
              <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                <Label htmlFor="sms">
                  {language === 'ar' ? 'تنبيهات SMS' : 'Alertes SMS'}
                </Label>
                <Switch
                  id="sms"
                  checked={smsAlerts}
                  onCheckedChange={setSmsAlerts}
                />
              </div>
              <Separator />
              <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                <div>
                  <Label htmlFor="maintenance">
                    {language === 'ar' ? 'وضع الصيانة' : 'Mode Maintenance'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'تعطيل الوصول للمستخدمين' : 'Désactiver l\'accès utilisateurs'}
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={cn('text-lg flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <Database className="h-5 w-5" />
                {language === 'ar' ? 'البيانات' : 'Données'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className={cn('w-full justify-start', isRTL && 'flex-row-reverse')}>
                <Database className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {language === 'ar' ? 'تصدير البيانات' : 'Exporter les données'}
              </Button>
              <Button variant="outline" className={cn('w-full justify-start', isRTL && 'flex-row-reverse')}>
                <Database className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {language === 'ar' ? 'استيراد البيانات' : 'Importer les données'}
              </Button>
              <Button variant="outline" className={cn('w-full justify-start', isRTL && 'flex-row-reverse')}>
                <Database className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {language === 'ar' ? 'نسخ احتياطي' : 'Sauvegarde'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Users */}
        <Card>
          <CardHeader>
            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                {language === 'ar' ? 'إدارة المستخدمين' : 'Gestion Utilisateurs'}
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {demoUsers.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <div className={cn(isRTL && 'text-right')}>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className={cn('flex flex-col items-end gap-1', isRTL && 'items-start')}>
                      <Badge
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {user.status === 'active' 
                          ? (language === 'ar' ? 'نشط' : 'Actif')
                          : (language === 'ar' ? 'قيد الانتظار' : 'En attente')
                        }
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {user.role === 'admin' 
                          ? (language === 'ar' ? 'مدير' : 'Admin')
                          : (language === 'ar' ? 'سائق' : 'Chauffeur')
                        }
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column - Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className={cn('text-lg flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <Bell className="h-5 w-5" />
              {language === 'ar' ? 'التنبيهات' : 'Alertes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {demoAlerts.map((alert) => {
                  const Icon = alertIcons[alert.type as keyof typeof alertIcons];
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'p-3 rounded-lg border',
                        alertColors[alert.type as keyof typeof alertColors]
                      )}
                    >
                      <div className={cn('flex items-start gap-2', isRTL && 'flex-row-reverse')}>
                        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className={cn('flex-1', isRTL && 'text-right')}>
                          <p className="text-sm">{alert.message}</p>
                          <p className={cn('text-xs mt-1 opacity-70', isRTL && 'text-right')}>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {alert.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className={cn('text-lg', isRTL && 'text-right')}>
            {language === 'ar' ? 'إجراءات سريعة' : 'Actions Rapides'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className={cn('h-auto py-4 flex flex-col gap-2', isRTL && 'flex-row-reverse')}>
              <User className="h-5 w-5" />
              <span>{language === 'ar' ? 'إضافة مستخدم' : 'Ajouter Utilisateur'}</span>
            </Button>
            <Button variant="outline" className={cn('h-auto py-4 flex flex-col gap-2', isRTL && 'flex-row-reverse')}>
              <Car className="h-5 w-5" />
              <span>{language === 'ar' ? 'إضافة سائق' : 'Ajouter Chauffeur'}</span>
            </Button>
            <Button variant="outline" className={cn('h-auto py-4 flex flex-col gap-2', isRTL && 'flex-row-reverse')}>
              <Shield className="h-5 w-5" />
              <span>{language === 'ar' ? 'فحص الأمان' : 'Vérification Sécurité'}</span>
            </Button>
            <Button variant="outline" className={cn('h-auto py-4 flex flex-col gap-2', isRTL && 'flex-row-reverse')}>
              <HelpCircle className="h-5 w-5" />
              <span>{language === 'ar' ? 'الدعم الفني' : 'Support Technique'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className={cn('text-center text-xs text-muted-foreground py-4', isRTL && 'text-right')}>
        <p>Smart Inter-Wilaya Taxi v2.0.0</p>
        <p>© 2025 {language === 'ar' ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}</p>
      </div>
    </div>
  );
}
