'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Car, 
  Users, 
  MapPin, 
  MessageCircle, 
  TrendingUp, 
  Activity,
  Bell,
  Settings,
  Menu,
  Search,
  Plus,
  RefreshCw,
  Moon,
  Sun,
  Globe,
  BarChart3,
  Route,
  DollarSign,
  Star,
  Navigation,
  Phone,
  Send,
  ChevronRight,
  ChevronLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  Compass,
  Map,
  PhoneCall,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  MoveRight,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations, Language } from '@/lib/i18n';
import { WILAYAS, DEMO_DRIVERS, POPULAR_ROUTES, PRICE_PER_KM, BASE_FARE } from '@/lib/constants';
import { 
  User, 
  Driver, 
  Group, 
  Message, 
  DashboardStats, 
  Trip,
  Location 
} from '@/lib/types';

// Demo data generators
function generateDemoDrivers(): (User & { driverProfile: Driver; locations: Location[] })[] {
  return DEMO_DRIVERS.map((d, i) => ({
    id: d.id,
    email: `driver${i + 1}@smarttaxi.dz`,
    name: d.name,
    phone: `+213555${String(i).padStart(6, '0')}`,
    role: 'driver' as const,
    status: d.status as 'online' | 'offline' | 'busy',
    language: 'ar' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    driverProfile: {
      id: `dp-${d.id}`,
      userId: d.id,
      licenseNumber: `DZ-${String(i + 1).padStart(6, '0')}`,
      vehiclePlate: `0${i + 1}-123-16`,
      vehicleType: ['sedan', 'van', 'suv'][i % 3] as 'sedan' | 'van' | 'suv',
      vehicleColor: ['أبيض', 'أسود', 'رمادي'][i % 3],
      vehicleCapacity: [4, 8, 6][i % 3],
      wilaya: d.wilaya,
      rating: 4.5 + Math.random() * 0.5,
      totalTrips: 100 + Math.floor(Math.random() * 500),
      totalEarnings: 50000 + Math.floor(Math.random() * 100000),
      isVerified: Math.random() > 0.3,
    },
    locations: [{
      id: `loc-${d.id}`,
      userId: d.id,
      latitude: d.lat,
      longitude: d.lng,
      timestamp: new Date().toISOString(),
    }],
  }));
}

function generateDemoStats(): DashboardStats {
  return {
    totalDrivers: 156,
    activeTrips: 23,
    totalEarnings: 2450000,
    totalPassengers: 1243,
    onlineDrivers: 89,
    completedTripsToday: 156,
  };
}

function generateDemoGroups(): Group[] {
  return [
    {
      id: 'g1',
      name: 'الجزائر - وهران',
      description: 'رحلات يومية بين الجزائر العاصمة ووهران',
      wilayaFrom: 'الجزائر',
      wilayaTo: 'وهران',
      status: 'active',
      maxMembers: 8,
      createdBy: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'g2',
      name: 'قسنطينة - الجزائر',
      description: 'مجموعة سائقي قسنطينة',
      wilayaFrom: 'قسنطينة',
      wilayaTo: 'الجزائر',
      status: 'active',
      maxMembers: 6,
      createdBy: '2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'g3',
      name: 'سطيف - الجزائر',
      description: 'رحلات الصباح والمساء',
      wilayaFrom: 'سطيف',
      wilayaTo: 'الجزائر',
      status: 'active',
      maxMembers: 10,
      createdBy: '3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function generateDemoMessages(): Message[] {
  return [
    {
      id: 'm1',
      senderId: '2',
      receiverId: '1',
      content: 'مرحباً، هل هناك رحلة اليوم؟',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'm2',
      senderId: '1',
      receiverId: '2',
      content: 'نعم، سأنطلق الساعة 8 صباحاً',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: 'm3',
      senderId: '2',
      receiverId: '1',
      content: 'ممتاز! سأحجز مقعد',
      type: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 3400000).toISOString(),
    },
  ];
}

// Feature card component
function FeatureCard({ icon: Icon, title, description, delay }: { icon: LucideIcon; title: string; description: string; delay: number }) {
  return (
    <div 
      className="card-hover glass rounded-2xl p-6 text-center opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.18_45)] to-[oklch(0.7_0.14_35)] flex items-center justify-center shadow-lg">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Route card component
function RouteCard({ from, to, distance, price, duration, delay }: { from: string; to: string; distance: string; price: string; duration: string; delay: number }) {
  return (
    <div 
      className="card-hover bg-card border rounded-xl p-4 opacity-0 animate-in fade-in slide-in-from-right-4 duration-500"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[oklch(0.55_0.18_45)]" />
          <span className="font-medium">{from}</span>
        </div>
        <div className="flex-1 mx-3 h-px relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.55_0.18_45)] via-[oklch(0.6_0.15_180)] to-[oklch(0.55_0.18_45)] opacity-30" />
          <div className="absolute inset-0 animate-route-line" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{to}</span>
          <div className="w-2 h-2 rounded-full bg-[oklch(0.6_0.15_180)]" />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{distance}</span>
        <Badge variant="secondary" className="font-semibold">{price}</Badge>
        <span>{duration}</span>
      </div>
    </div>
  );
}

// Stats card with gradient
function GradientStatsCard({ title, value, change, icon: Icon, gradient, delay }: { 
  title: string; 
  value: string | number; 
  change: string;
  icon: LucideIcon;
  gradient: string;
  delay: number;
}) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 opacity-0 animate-in fade-in zoom-in-95 duration-500",
        gradient
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-white/70 text-xs flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {change} هذا الشهر
        </p>
      </div>
    </div>
  );
}

// Driver card with warm styling
function WarmDriverCard({ driver, language, onAction, delay }: { 
  driver: User & { driverProfile: Driver; locations: Location[] }; 
  language: Language;
  onAction: (action: string) => void;
  delay: number;
}) {
  const isRTL = language === 'ar';
  
  return (
    <div 
      className="card-hover bg-card border rounded-2xl overflow-hidden opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="relative h-20 bg-gradient-to-r from-[oklch(0.55_0.18_45)] via-[oklch(0.6_0.16_40)] to-[oklch(0.6_0.15_180)]" />
      <div className="relative px-5 pb-5">
        <div className="absolute -top-10 flex items-end gap-3">
          <div className="w-20 h-20 rounded-xl border-4 border-card bg-muted flex items-center justify-center text-2xl font-bold text-[oklch(0.55_0.18_45)]">
            {driver.name.charAt(0)}
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold", isRTL && "arabic-text")}>{driver.name}</span>
              {driver.driverProfile.isVerified && (
                <div className="w-5 h-5 rounded-full bg-[oklch(0.6_0.15_180)] flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{driver.driverProfile.wilaya}</p>
          </div>
        </div>
        
        <div className="pt-12">
          <div className={cn("flex items-center gap-4 mb-4 text-sm", isRTL && "flex-row-reverse")}>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-medium">{driver.driverProfile.rating.toFixed(1)}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-muted-foreground">
              {driver.driverProfile.totalTrips} {isRTL ? 'رحلة' : 'trips'}
            </span>
            <Separator orientation="vertical" className="h-4" />
            <Badge variant="outline" className={cn(
              driver.status === 'online' && 'border-green-500 text-green-600 dark:text-green-400',
              driver.status === 'busy' && 'border-amber-500 text-amber-600 dark:text-amber-400',
              driver.status === 'offline' && 'border-gray-400 text-gray-500'
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full mr-1",
                driver.status === 'online' && 'bg-green-500',
                driver.status === 'busy' && 'bg-amber-500',
                driver.status === 'offline' && 'bg-gray-400'
              )} />
              {driver.status === 'online' ? (isRTL ? 'متصل' : 'Online') : 
               driver.status === 'busy' ? (isRTL ? 'مشغول' : 'Busy') : 
               (isRTL ? 'غير متصل' : 'Offline')}
            </Badge>
          </div>
          
          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            <Button 
              className="flex-1 bg-gradient-to-r from-[oklch(0.55_0.18_45)] to-[oklch(0.6_0.16_40)] hover:opacity-90"
              onClick={() => onAction('book')}
            >
              {isRTL ? 'احجز الآن' : 'Book Now'}
            </Button>
            <Button variant="outline" size="icon" onClick={() => onAction('message')}>
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onAction('call')}>
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // State
  const [language, setLanguage] = useState<Language>('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [drivers, setDrivers] = useState<(User & { driverProfile: Driver; locations: Location[] })[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [showLanding, setShowLanding] = useState(true);

  const t = translations[language];
  const isRTL = language === 'ar';

  // Initialize demo data
  useEffect(() => {
    const timer = setTimeout(() => {
      setDrivers(generateDemoDrivers());
      setStats(generateDemoStats());
      setGroups(generateDemoGroups());
      setMessages(generateDemoMessages());
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (isLoading) return;
    
    const interval = setInterval(() => {
      setDrivers(prev => prev.map(driver => ({
        ...driver,
        locations: [{
          ...driver.locations[0],
          latitude: driver.locations[0].latitude + (Math.random() - 0.5) * 0.01,
          longitude: driver.locations[0].longitude + (Math.random() - 0.5) * 0.01,
          timestamp: new Date().toISOString(),
        }],
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Filter drivers
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.driverProfile.wilaya.includes(searchQuery);
    const matchesWilaya = selectedWilaya === 'all' || 
      driver.driverProfile.wilaya === WILAYAS.find(w => w.code === selectedWilaya)?.name[language];
    return matchesSearch && matchesWilaya;
  });

  // Handlers
  const handleViewLocation = useCallback((driverId: string) => {
    setActiveTab('map');
  }, []);

  const handleSendMessage = useCallback((content: string, receiverId?: string, groupId?: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: '1',
      receiverId,
      content,
      type: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleCreateGroup = useCallback((data: { name: string; wilayaFrom: string; wilayaTo: string; maxMembers: number }) => {
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: data.name,
      wilayaFrom: data.wilayaFrom,
      wilayaTo: data.wilayaTo,
      status: 'active',
      maxMembers: data.maxMembers,
      createdBy: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGroups(prev => [...prev, newGroup]);
    setIsGroupModalOpen(false);
  }, []);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Landing Page
  if (showLanding) {
    return (
      <div className={cn("min-h-screen bg-background pattern-dunes", isRTL && "rtl")}>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.985_0.008_75)] via-[oklch(0.95_0.03_60)] to-[oklch(0.9_0.04_180)]" />
          
          {/* Floating decorative elements */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-[oklch(0.55_0.18_45/0.1)] rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-[oklch(0.6_0.15_180/0.1)] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-6 py-20">
            {/* Navigation */}
            <nav className="absolute top-0 left-0 right-0 px-6 py-4">
              <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.18_45)] to-[oklch(0.7_0.14_35)] flex items-center justify-center shadow-lg animate-pulse-glow">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className={cn("text-xl font-bold", isRTL && "arabic-text")}>
                      Smart Taxi
                    </h1>
                    <p className="text-xs text-muted-foreground">Inter-Wilaya v2</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
                  >
                    <Globe className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 w-5" />}
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-[oklch(0.55_0.18_45)] to-[oklch(0.6_0.16_40)] text-white"
                    onClick={() => setShowLanding(false)}
                  >
                    {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                    {isRTL ? <ChevronLeft className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </nav>
            
            {/* Hero Content */}
            <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
              <div className="space-y-8 opacity-0 animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-forwards">
                <Badge className="px-4 py-2 bg-[oklch(0.55_0.18_45/0.1)] text-[oklch(0.55_0.18_45)] border-[oklch(0.55_0.18_45/0.2)]">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isRTL ? 'الجيل الجديد من النقل' : 'Next Generation Transport'}
                </Badge>
                
                <h1 className={cn("text-5xl lg:text-7xl font-bold leading-tight", isRTL && "arabic-text")}>
                  {isRTL ? (
                    <>
                      <span className="text-gradient-warm">رحلات ذكية</span>
                      <br />
                      بين الولايات
                    </>
                  ) : (
                    <>
                      <span className="text-gradient-warm">Smart Travel</span>
                      <br />
                      Between Cities
                    </>
                  )}
                </h1>
                
                <p className={cn("text-xl text-muted-foreground max-w-lg leading-relaxed", isRTL && "arabic-text")}>
                  {isRTL 
                    ? 'منصة متكاملة لربط السائقين بالركاب في رحلات بين الولايات الجزائرية. حجز سهل، تتبع في الوقت الحقيقي، وأمان مضمون.'
                    : 'Complete platform connecting drivers with passengers for inter-city travel across Algeria. Easy booking, real-time tracking, and guaranteed safety.'
                  }
                </p>
                
                <div className={cn("flex flex-wrap gap-4", isRTL && "flex-row-reverse")}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-[oklch(0.55_0.18_45)] to-[oklch(0.6_0.16_40)] text-white px-8 h-14 text-lg shadow-xl hover:shadow-2xl transition-all"
                    onClick={() => setShowLanding(false)}
                  >
                    {isRTL ? 'ابدأ الآن' : 'Get Started'}
                    {isRTL ? <ChevronLeft className="w-5 h-5 mr-2" /> : <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                  <Button size="lg" variant="outline" className="px-8 h-14 text-lg">
                    <Play className={cn("w-5 h-5", isRTL ? "ml-2" : "mr-2")} />
                    {isRTL ? 'شاهد الفيديو' : 'Watch Demo'}
                  </Button>
                </div>
                
                {/* Stats mini */}
                <div className={cn("flex items-center gap-8 pt-4", isRTL && "flex-row-reverse")}>
                  {[
                    { value: '156+', label: isRTL ? 'سائق نشط' : 'Active Drivers' },
                    { value: '48', label: isRTL ? 'ولاية' : 'Wilayas' },
                    { value: '2.4M', label: isRTL ? 'دينار/شهر' : 'DZD/Month' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-2xl font-bold text-gradient-warm">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Hero Image/Illustration */}
              <div className="relative opacity-0 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 fill-mode-forwards">
                <div className="relative w-full aspect-square max-w-lg mx-auto">
                  {/* Animated circles */}
                  <div className="absolute inset-0 animate-float">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border-2 border-dashed border-[oklch(0.55_0.18_45/0.3)] rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-[oklch(0.6_0.15_180/0.3)] rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                  </div>
                  
                  {/* Center card */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 glass rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.18_45)] to-[oklch(0.7_0.14_35)] flex items-center justify-center">
                        <Navigation className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className={cn("font-semibold", isRTL && "arabic-text")}>{isRTL ? 'الجزائر → وهران' : 'Alger → Oran'}</p>
                        <p className="text-sm text-muted-foreground">{isRTL ? '٤٠٠ كم' : '400 km'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'السعر' : 'Price'}</span>
                        <span className="font-semibold text-[oklch(0.55_0.18_45)]">2,500 DZD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'المدة' : 'Duration'}</span>
                        <span>{isRTL ? '٤ ساعات' : '4 hours'}</span>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-[oklch(0.55_0.18_45)] to-[oklch(0.6_0.16_40)]">
                        {isRTL ? 'احجز الآن' : 'Book Now'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Floating driver cards */}
                  <div className="absolute top-10 right-0 glass rounded-xl p-3 shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[oklch(0.6_0.15_180)] flex items-center justify-center">
                        <Car className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{isRTL ? 'أحمد' : 'Ahmed'}</p>
                        <p className="text-xs text-muted-foreground">⭐ 4.9</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-20 left-0 glass rounded-xl p-3 shadow-lg animate-float" style={{ animationDelay: '1.5s' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[oklch(0.55_0.18_45)] flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{isRTL ? 'موثق' : 'Verified'}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'آمن ١٠٠٪' : '100% Safe'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-24 bg-card/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <Badge className="mb-4" variant="outline">
                <Zap className="w-3 h-3 mr-1" />
                {isRTL ? 'المميزات' : 'Features'}
              </Badge>
              <h2 className={cn("text-4xl font-bold mb-4", isRTL && "arabic-text")}>
                {isRTL ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isRTL 
                  ? 'نقدم تجربة نقل فريدة تجمع بين الراحة والأمان والسرعة'
                  : 'We offer a unique transportation experience combining comfort, safety, and speed'
                }
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={Navigation}
                title={isRTL ? 'تتبع مباشر' : 'Live Tracking'}
                description={isRTL ? 'تتبع موقع السائق في الوقت الحقيقي' : 'Track your driver\'s location in real-time'}
                delay={100}
              />
              <FeatureCard 
                icon={Shield}
                title={isRTL ? 'آمن وموثوق' : 'Safe & Trusted'}
                description={isRTL ? 'جميع السائقين موثقون ومعتمدون' : 'All drivers are verified and certified'}
                delay={200}
              />
              <FeatureCard 
                icon={DollarSign}
                title={isRTL ? 'أسعار منافسة' : 'Competitive Prices'}
                description={isRTL ? 'أفضل الأسعار مع شفافية كاملة' : 'Best prices with full transparency'}
                delay={300}
              />
              <FeatureCard 
                icon={Users}
                title={isRTL ? 'مجموعات السفر' : 'Travel Groups'}
                description={isRTL ? 'انضم إلى مجموعات ووفر في التكاليف' : 'Join groups and save on costs'}
                delay={400}
              />
            </div>
          </div>
        </section>
        
        {/* Popular Routes Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="mb-4" variant="outline">
                  <Route className="w-3 h-3 mr-1" />
                  {isRTL ? 'الطرق الشائعة' : 'Popular Routes'}
                </Badge>
                <h2 className={cn("text-4xl font-bold mb-6", isRTL && "arabic-text")}>
                  {isRTL ? 'أكثر الوجهات طلباً' : 'Most Requested Destinations'}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {isRTL 
                    ? 'اكتشف الطرق الأكثر شعبية بين الولايات الجزائرية واحجز رحلتك بكل سهولة'
                    : 'Discover the most popular routes between Algerian cities and book your trip easily'
                  }
                </p>
                
                <div className="space-y-4">
                  {[
                    { from: isRTL ? 'الجزائر' : 'Alger', to: isRTL ? 'وهران' : 'Oran', distance: '400 km', price: '2,500 DZD', duration: isRTL ? '٤ ساعات' : '4h' },
                    { from: isRTL ? 'قسنطينة' : 'Constantine', to: isRTL ? 'الجزائر' : 'Alger', distance: '320 km', price: '2,000 DZD', duration: isRTL ? '٣ ساعات' : '3h' },
                    { from: isRTL ? 'سطيف' : 'Sétif', to: isRTL ? 'الجزائر' : 'Alger', distance: '280 km', price: '1,800 DZD', duration: isRTL ? '٣ ساعات' : '3h' },
                    { from: isRTL ? 'عنابة' : 'Annaba', to: isRTL ? 'الجزائر' : 'Alger', distance: '450 km', price: '3,000 DZD', duration: isRTL ? '٥ ساعات' : '5h' },
                  ].map((route, i) => (
                    <RouteCard key={i} {...route} delay={i * 100} />
                  ))}
                </div>
              </div>
              
              {/* Map illustration */}
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-[oklch(0.55_0.18_45/0.1)] to-[oklch(0.6_0.15_180/0.1)] flex items-center justify-center">
                  <div className="w-full h-full relative">
                    {/* Map dots */}
                    {[
                      { x: 50, y: 40, label: isRTL ? 'الجزائر' : 'Alger', primary: true },
                      { x: 20, y: 45, label: isRTL ? 'وهران' : 'Oran', primary: false },
                      { x: 80, y: 25, label: isRTL ? 'قسنطينة' : 'Constantine', primary: false },
                      { x: 60, y: 60, label: isRTL ? 'سطيف' : 'Sétif', primary: false },
                      { x: 90, y: 20, label: isRTL ? 'عنابة' : 'Annaba', primary: false },
                    ].map((city, i) => (
                      <div 
                        key={i} 
                        className="absolute"
                        style={{ left: `${city.x}%`, top: `${city.y}%` }}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-full animate-pulse",
                          city.primary ? "bg-[oklch(0.55_0.18_45)]" : "bg-[oklch(0.6_0.15_180)]"
                        )} />
                        <p className="text-xs font-medium mt-1 whitespace-nowrap">{city.label}</p>
                      </div>
                    ))}
                    
                    {/* Route lines */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path
                        d="M50,40 L20,45"
                        stroke="oklch(0.55 0.18 45 / 0.3)"
                        strokeWidth="0.5"
                        fill="none"
                        strokeDasharray="2,2"
                        className="animate-pulse"
                      />
                      <path
                        d="M50,40 L80,25"
                        stroke="oklch(0.6 0.15 180 / 0.3)"
                        strokeWidth="0.5"
                        fill="none"
                        strokeDasharray="2,2"
                      />
                      <path
                        d="M50,40 L60,60"
                        stroke="oklch(0.55 0.18 45 / 0.3)"
                        strokeWidth="0.5"
                        fill="none"
                        strokeDasharray="2,2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[oklch(0.55_0.18_45)] via-[oklch(0.6_0.16_40)] to-[oklch(0.6_0.15_180)] p-12 lg:p-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 text-center">
                <h2 className={cn("text-4xl lg:text-5xl font-bold text-white mb-6", isRTL && "arabic-text")}>
                  {isRTL ? 'جاهز للبدء؟' : 'Ready to Get Started?'}
                </h2>
                <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
                  {isRTL 
                    ? 'انضم إلى آلاف السائقين والركاب الذين يثقون بمنصتنا يومياً'
                    : 'Join thousands of drivers and passengers who trust our platform daily'
                  }
                </p>
                <div className={cn("flex flex-wrap justify-center gap-4", isRTL && "flex-row-reverse")}>
                  <Button 
                    size="lg" 
                    className="bg-white text-[oklch(0.55_0.18_45)] hover:bg-white/90 px-8 h-14"
                    onClick={() => setShowLanding(false)}
                  >
                    {isRTL ? 'افتح لوحة التحكم' : 'Open Dashboard'}
                    {isRTL ? <ChevronLeft className="w-5 h-5 mr-2" /> : <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 px-8 h-14">
                    <PhoneCall className={cn("w-5 h-5", isRTL ? "ml-2" : "mr-2")} />
                    {isRTL ? 'اتصل بنا' : 'Contact Us'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-12 border-t">
          <div className="container mx-auto px-6">
            <div className={cn("flex flex-col md:flex-row items-center justify-between gap-6", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[oklch(0.55_0.18_45)] to-[oklch(0.7_0.14_35)] flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <p className="font-semibold">Smart Inter-Wilaya Taxi</p>
                  <p className="text-xs text-muted-foreground">© 2025 All rights reserved</p>
                </div>
              </div>
              
              <div className={cn("flex items-center gap-6", isRTL && "flex-row-reverse")}>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Dashboard
  return (
    <div className={cn(
      'min-h-screen bg-background transition-colors duration-300 pattern-dunes',
      isRTL && 'rtl'
    )}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b glass">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? 'right' : 'left'} className="w-64">
                <SheetHeader>
                  <SheetTitle className={cn(isRTL && 'text-right arabic-text')}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[oklch(0.55_0.18_45)] to-[oklch(0.7_0.14_35)] flex items-center justify-center">
                        <Car className="h-5 w-5 text-white" />
                      </div>
                      Smart Taxi
                    </div>
                  </SheetTitle>
                  <SheetDescription className={cn(isRTL && 'text-right arabic-text')}>
                    {language === 'ar' ? 'لوحة التحكم الرئيسية' : 'Tableau de bord principal'}
                  </SheetDescription>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  {['overview', 'drivers', 'map', 'groups', 'analytics', 'admin'].map((tab) => (
                    <Button
                      key={tab}
                      variant={activeTab === tab ? 'secondary' : 'ghost'}
                      className={cn('w-full justify-start', isRTL && 'flex-row-reverse justify-end arabic-text')}
                      onClick={() => {
                        setActiveTab(tab);
                        setIsSidebarOpen(false);
                      }}
                    >
                      {t[tab as keyof typeof t] || tab}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <button 
              onClick={() => setShowLanding(true)}
              className={cn('flex items-center gap-2 hover:opacity-80 transition-opacity', isRTL && 'flex-row-reverse')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.18_45)] to-[oklch(0.7_0.14_35)] flex items-center justify-center shadow-md">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className={cn('text-lg font-bold', isRTL && 'text-right arabic-text')}>
                  Smart Inter-Wilaya Taxi
                </h1>
                <p className={cn('text-xs text-muted-foreground', isRTL && 'text-right')}>
                  {language === 'ar' ? 'الإصدار 2.0' : 'Version 2.0'}
                </p>
              </div>
            </button>
          </div>

          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            {/* Search */}
            <div className={cn('relative hidden md:block', isRTL && 'direction-ltr')}>
              <Search className={cn(
                'absolute h-4 w-4 text-muted-foreground top-1/2 -translate-y-1/2',
                isRTL ? 'right-3' : 'left-3'
              )} />
              <Input
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-64',
                  isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                )}
              />
            </div>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
            >
              <Globe className="h-5 w-5" />
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-[oklch(0.55_0.18_45)]">
                3
              </Badge>
            </Button>

            {/* Chat Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="relative"
            >
              <MessageCircle className="h-5 w-5" />
              {messages.filter(m => !m.isRead).length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-[oklch(0.6_0.15_180)]">
                  {messages.filter(m => !m.isRead).length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tab Navigation */}
          <TabsList className={cn('hidden md:flex', isRTL && 'flex-row-reverse')}>
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              {t.overview}
            </TabsTrigger>
            <TabsTrigger value="drivers" className="gap-2">
              <Car className="h-4 w-4" />
              {t.drivers}
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <MapPin className="h-4 w-4" />
              {t.map}
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <Users className="h-4 w-4" />
              {t.groups}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {t.analytics}
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Settings className="h-4 w-4" />
              {t.admin}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                [
                  { title: t.totalDrivers, value: stats?.totalDrivers || 0, change: '+12%', icon: Car, gradient: 'bg-gradient-to-br from-[oklch(0.55_0.18_45)] to-[oklch(0.6_0.16_40)]' },
                  { title: t.activeTrips, value: stats?.activeTrips || 0, change: '+5%', icon: Navigation, gradient: 'bg-gradient-to-br from-[oklch(0.6_0.15_180)] to-[oklch(0.55_0.14_175)]' },
                  { title: t.onlineDrivers, value: stats?.onlineDrivers || 0, change: '+8%', icon: Activity, gradient: 'bg-gradient-to-br from-[oklch(0.7_0.14_35)] to-[oklch(0.75_0.12_40)]' },
                  { title: t.totalEarnings, value: `${((stats?.totalEarnings || 0) / 1000).toFixed(0)}K`, change: '+15%', icon: DollarSign, gradient: 'bg-gradient-to-br from-[oklch(0.5_0.15_270)] to-[oklch(0.55_0.14_265)]' },
                ].map((stat, i) => (
                  <GradientStatsCard key={i} {...stat} delay={i * 100} />
                ))
              )}
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Drivers Section */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                      <CardTitle className={cn("text-xl", isRTL && "arabic-text")}>
                        {isRTL ? 'السائقون المتاحون' : 'Available Drivers'}
                      </CardTitle>
                      <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        {isRTL ? 'تحديث' : 'Refresh'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-48 w-full rounded-xl" />
                        ))
                      ) : (
                        filteredDrivers.slice(0, 4).map((driver, i) => (
                          <WarmDriverCard 
                            key={driver.id}
                            driver={driver}
                            language={language}
                            onAction={(action) => {
                              if (action === 'book') setActiveTab('map');
                              if (action === 'message') setIsChatOpen(true);
                            }}
                            delay={i * 100}
                          />
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-4">
                {/* Active Groups */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                      <CardTitle className={cn("text-lg", isRTL && "arabic-text")}>{t.activeGroups}</CardTitle>
                      <Button size="sm" onClick={() => setIsGroupModalOpen(true)} className="bg-[oklch(0.55_0.18_45)] hover:bg-[oklch(0.5_0.16_45)]">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))
                    ) : (
                      groups.slice(0, 3).map((group) => (
                        <div
                          key={group.id}
                          className={cn(
                            'p-3 rounded-xl border bg-card hover:bg-muted/50 cursor-pointer transition-all card-hover',
                            isRTL && 'text-right'
                          )}
                        >
                          <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                            <div>
                              <p className={cn("font-medium", isRTL && "arabic-text")}>{group.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {group.wilayaFrom} → {group.wilayaTo}
                              </p>
                            </div>
                            <ChevronRight className={cn(
                              'h-4 w-4 text-muted-foreground',
                              isRTL && 'rotate-180'
                            )} />
                          </div>
                          <div className={cn('flex items-center gap-2 mt-2', isRTL && 'flex-row-reverse')}>
                            <Badge variant="secondary" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {group.maxMembers}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                'text-xs',
                                group.status === 'active' && 'text-green-500 border-green-500'
                              )}
                            >
                              {group.status === 'active' && (language === 'ar' ? 'نشط' : 'Actif')}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Popular Routes */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "arabic-text flex-row-reverse")}>
                      <Route className="h-5 w-5 text-[oklch(0.55_0.18_45)]" />
                      {language === 'ar' ? 'الطرق الشائعة' : 'Routes Populaires'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {POPULAR_ROUTES.slice(0, 3).map((route, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors',
                          isRTL && 'flex-row-reverse text-right'
                        )}
                      >
                        <div className={cn(isRTL && 'text-right arabic-text')}>
                          <p className="text-sm font-medium">{route.from} → {route.to}</p>
                          <p className="text-xs text-muted-foreground">{route.distance} km</p>
                        </div>
                        <Badge className="bg-[oklch(0.55_0.18_45)]">
                          {route.avgPrice.toLocaleString()} DZD
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "arabic-text flex-row-reverse")}>
                      <Clock className="h-5 w-5 text-[oklch(0.6_0.15_180)]" />
                      {language === 'ar' ? 'النشاط الأخير' : 'Activité Récente'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="space-y-3">
                        {[
                          { type: 'trip', text: language === 'ar' ? 'رحلة جديدة: الجزائر → وهران' : 'Nouveau trajet: Alger → Oran', time: '2 min' },
                          { type: 'driver', text: language === 'ar' ? 'سائق جديد انضم' : 'Nouveau chauffeur inscrit', time: '15 min' },
                          { type: 'group', text: language === 'ar' ? 'مجموعة جديدة تم إنشاؤها' : 'Nouveau groupe créé', time: '1h' },
                          { type: 'payment', text: language === 'ar' ? 'دفعة مستلمة: 2,500 DZD' : 'Paiement reçu: 2,500 DZD', time: '2h' },
                        ].map((activity, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex items-start gap-2 text-sm',
                              isRTL && 'flex-row-reverse text-right'
                            )}
                          >
                            {activity.type === 'trip' && <Navigation className="h-4 w-4 text-[oklch(0.55_0.18_45)] flex-shrink-0" />}
                            {activity.type === 'driver' && <Car className="h-4 w-4 text-[oklch(0.6_0.15_180)] flex-shrink-0" />}
                            {activity.type === 'group' && <Users className="h-4 w-4 text-[oklch(0.7_0.14_35)] flex-shrink-0" />}
                            {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-[oklch(0.5_0.15_270)] flex-shrink-0" />}
                            <div className={cn('flex-1', isRTL && 'text-right arabic-text')}>
                              <p>{activity.text}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-6">
            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
              <div>
                <h2 className={cn("text-2xl font-bold", isRTL && "arabic-text")}>{t.drivers}</h2>
                <p className="text-muted-foreground">
                  {language === 'ar' ? `${filteredDrivers.length} سائق متاح` : `${filteredDrivers.length} chauffeurs disponibles`}
                </p>
              </div>
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={language === 'ar' ? 'الولاية' : 'Wilaya'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'ar' ? 'الكل' : 'Tous'}</SelectItem>
                    {WILAYAS.slice(0, 10).map((w) => (
                      <SelectItem key={w.code} value={w.code}>
                        {w.name[language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))
              ) : (
                filteredDrivers.map((driver, i) => (
                  <WarmDriverCard 
                    key={driver.id}
                    driver={driver}
                    language={language}
                    onAction={(action) => {
                      if (action === 'book') setActiveTab('map');
                      if (action === 'message') setIsChatOpen(true);
                    }}
                    delay={i * 50}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="aspect-[16/9] bg-gradient-to-br from-[oklch(0.55_0.18_45/0.05)] to-[oklch(0.6_0.15_180/0.05)] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[oklch(0.55_0.18_45)] to-[oklch(0.6_0.16_40)] flex items-center justify-center">
                    <Map className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className={cn("text-xl font-semibold", isRTL && "arabic-text")}>
                      {isRTL ? 'خريطة تفاعلية' : 'Interactive Map'}
                    </h3>
                    <p className="text-muted-foreground">
                      {isRTL ? 'تتبع السائقين في الوقت الحقيقي' : 'Track drivers in real-time'}
                    </p>
                  </div>
                  <div className={cn("flex justify-center gap-4", isRTL && "flex-row-reverse")}>
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                      {stats?.onlineDrivers || 0} {isRTL ? 'متصل' : 'Online'}
                    </Badge>
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                      {stats?.activeTrips || 0} {isRTL ? 'رحلة نشطة' : 'Active Trips'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
              <div>
                <h2 className={cn("text-2xl font-bold", isRTL && "arabic-text")}>{t.groups}</h2>
                <p className="text-muted-foreground">
                  {language === 'ar' ? `${groups.length} مجموعة نشطة` : `${groups.length} groupes actifs`}
                </p>
              </div>
              <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[oklch(0.55_0.18_45)] to-[oklch(0.6_0.16_40)]">
                    <Plus className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'مجموعة جديدة' : 'Nouveau Groupe'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className={isRTL && 'arabic-text'}>{language === 'ar' ? 'إنشاء مجموعة جديدة' : 'Créer un Groupe'}</DialogTitle>
                    <DialogDescription className={isRTL && 'arabic-text'}>
                      {language === 'ar' 
                        ? 'أنشئ مجموعة جديدة لتنظيم الرحلات بين الولايات'
                        : 'Créez un groupe pour organiser les trajets inter-wilayas'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label className={isRTL && 'arabic-text'} htmlFor="name">{language === 'ar' ? 'اسم المجموعة' : 'Nom du Groupe'}</Label>
                      <Input id="name" placeholder={language === 'ar' ? 'مثال: الجزائر - وهران' : 'Ex: Alger - Oran'} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className={isRTL && 'arabic-text'}>{language === 'ar' ? 'من' : 'De'}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'ar' ? 'اختر الولاية' : 'Choisir Wilaya'} />
                          </SelectTrigger>
                          <SelectContent>
                            {WILAYAS.map((w) => (
                              <SelectItem key={w.code} value={w.code}>{w.name[language]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className={isRTL && 'arabic-text'}>{language === 'ar' ? 'إلى' : 'Vers'}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'ar' ? 'اختر الولاية' : 'Choisir Wilaya'} />
                          </SelectTrigger>
                          <SelectContent>
                            {WILAYAS.map((w) => (
                              <SelectItem key={w.code} value={w.code}>{w.name[language]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className={isRTL && 'arabic-text'}>{language === 'ar' ? 'الحد الأقصى للأعضاء' : 'Membres Maximum'}</Label>
                      <Input type="number" defaultValue="8" min={2} max={20} />
                    </div>
                  </div>
                  <DialogFooter className={isRTL && 'flex-row-reverse'}>
                    <Button variant="outline" onClick={() => setIsGroupModalOpen(false)}>
                      {language === 'ar' ? 'إلغاء' : 'Annuler'}
                    </Button>
                    <Button className="bg-[oklch(0.55_0.18_45)] hover:bg-[oklch(0.5_0.16_45)]" onClick={() => handleCreateGroup({ name: 'Test', wilayaFrom: 'Alger', wilayaTo: 'Oran', maxMembers: 8 })}>
                      {language === 'ar' ? 'إنشاء' : 'Créer'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group, i) => (
                <Card key={group.id} className="card-hover border-0 shadow-lg overflow-hidden opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}>
                  <div className="h-16 bg-gradient-to-r from-[oklch(0.55_0.18_45)] via-[oklch(0.6_0.16_40)] to-[oklch(0.6_0.15_180)]" />
                  <CardHeader>
                    <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                      <CardTitle className={cn("text-lg", isRTL && "arabic-text")}>{group.name}</CardTitle>
                      <Badge variant={group.status === 'active' ? 'default' : 'secondary'} className="bg-[oklch(0.6_0.15_180)]">
                        {group.status}
                      </Badge>
                    </div>
                    <CardDescription className={isRTL && 'arabic-text'}>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={cn('flex items-center gap-4 text-sm', isRTL && 'flex-row-reverse')}>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {group.wilayaFrom} → {group.wilayaTo}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {group.maxMembers}
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-gradient-to-r from-[oklch(0.55_0.18_45)] to-[oklch(0.6_0.16_40)]">
                      {language === 'ar' ? 'انضمام' : 'Rejoindre'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className={isRTL && 'arabic-text'}>{isRTL ? 'التحليلات والإحصائيات' : 'Analytics & Statistics'}</CardTitle>
                <CardDescription className={isRTL && 'arabic-text'}>
                  {isRTL ? 'نظرة شاملة على أداء المنصة' : 'Comprehensive platform performance overview'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: isRTL ? 'إجمالي الرحلات' : 'Total Trips', value: '1,245', change: '+23%' },
                    { label: isRTL ? 'متوسط التقييم' : 'Avg Rating', value: '4.8', change: '+0.2' },
                    { label: isRTL ? 'السائقون الجدد' : 'New Drivers', value: '34', change: '+12%' },
                    { label: isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue', value: '2.4M DZD', change: '+18%' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <Badge variant="outline" className="mt-2 text-green-500 border-green-500">
                        {stat.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className={isRTL && 'arabic-text'}>{isRTL ? 'إعدادات المسؤول' : 'Admin Settings'}</CardTitle>
                <CardDescription className={isRTL && 'arabic-text'}>
                  {isRTL ? 'إدارة النظام والإعدادات' : 'System management and settings'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: isRTL ? 'وضع الصيانة' : 'Maintenance Mode', desc: isRTL ? 'تعطيل الوصول للمستخدمين' : 'Disable user access' },
                  { label: isRTL ? 'إشعارات النظام' : 'System Notifications', desc: isRTL ? 'إرسال إشعارات للجميع' : 'Send notifications to all' },
                  { label: isRTL ? 'النسخ الاحتياطي' : 'Backup', desc: isRTL ? 'إنشاء نسخة احتياطية' : 'Create a backup' },
                ].map((setting, i) => (
                  <div key={i} className={cn('flex items-center justify-between p-4 rounded-xl bg-muted/50', isRTL && 'flex-row-reverse')}>
                    <div className={cn(isRTL && 'text-right')}>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.desc}</p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t py-4 mt-8">
        <div className="container px-4">
          <div className={cn('flex items-center justify-between text-sm text-muted-foreground', isRTL && 'flex-row-reverse')}>
            <p className={isRTL && 'arabic-text'}>© 2025 Smart Inter-Wilaya Taxi v2</p>
            <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
              <span className={cn('flex items-center gap-1', isRTL && 'arabic-text')}>
                <Zap className="h-4 w-4 text-green-500" />
                {language === 'ar' ? 'النظام نشط' : 'Système Actif'}
              </span>
              <Badge variant="outline" className="text-xs">
                v2.0.0
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
