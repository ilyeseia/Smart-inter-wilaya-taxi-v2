// Type definitions for Smart Inter-Wilaya Taxi v2

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'driver' | 'passenger';
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  language: 'ar' | 'fr';
  createdAt: string;
  updatedAt: string;
  driverProfile?: Driver;
}

export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  vehiclePlate: string;
  vehicleType: 'sedan' | 'van' | 'suv';
  vehicleColor?: string;
  vehicleCapacity: number;
  wilaya: string;
  rating: number;
  totalTrips: number;
  totalEarnings: number;
  isVerified: boolean;
  user?: User;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  wilayaFrom: string;
  wilayaTo: string;
  status: 'active' | 'completed' | 'cancelled';
  maxMembers: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'leader' | 'member';
  joinedAt: string;
  user?: User;
}

export interface Location {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  user?: User;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  type: 'text' | 'location' | 'image';
  isRead: boolean;
  createdAt: string;
  sender?: User;
}

export interface Trip {
  id: string;
  driverId: string;
  userId?: string;
  groupId?: string;
  wilayaFrom: string;
  wilayaTo: string;
  distance: number;
  duration: number;
  price: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  passengers: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  driver?: User;
  user?: User;
  group?: Group;
}

export interface Analytics {
  id: string;
  date: string;
  totalTrips: number;
  activeDrivers: number;
  totalEarnings: number;
  avgRating: number;
  wilayaFrom: string;
  wilayaTo: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalDrivers: number;
  activeTrips: number;
  totalEarnings: number;
  totalPassengers: number;
  onlineDrivers: number;
  completedTripsToday: number;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

export interface TripChartData {
  date: string;
  trips: number;
  earnings: number;
}

// Map types
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: 'driver' | 'passenger' | 'destination';
  status?: string;
}

// WebSocket events
export interface WebSocketEvent {
  type: 'location_update' | 'new_message' | 'trip_update' | 'driver_status';
  payload: unknown;
  timestamp: string;
}

// Form types
export interface CreateGroupForm {
  name: string;
  description?: string;
  wilayaFrom: string;
  wilayaTo: string;
  maxMembers: number;
}

export interface SendMessageForm {
  receiverId?: string;
  groupId?: string;
  content: string;
  type: 'text' | 'location' | 'image';
}
