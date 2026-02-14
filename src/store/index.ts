import { create } from 'zustand';
import { 
  User, 
  Driver, 
  Group, 
  Message, 
  Location, 
  Trip, 
  DashboardStats 
} from '@/lib/types';

// App state interface
interface AppState {
  // Language
  language: 'ar' | 'fr';
  setLanguage: (lang: 'ar' | 'fr') => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Users
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Drivers
  drivers: (User & { driverProfile: Driver | null })[];
  setDrivers: (drivers: (User & { driverProfile: Driver | null })[]) => void;
  onlineDriversCount: number;
  setOnlineDriversCount: (count: number) => void;

  // Groups
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;

  // Locations
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  updateDriverLocation: (userId: string, location: Location) => void;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  // Trips
  trips: Trip[];
  setTrips: (trips: Trip[]) => void;
  activeTrips: Trip[];
  setActiveTrips: (trips: Trip[]) => void;

  // Dashboard stats
  stats: DashboardStats;
  setStats: (stats: DashboardStats) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  chatPanelOpen: boolean;
  setChatPanelOpen: (open: boolean) => void;
  groupModalOpen: boolean;
  setGroupModalOpen: (open: boolean) => void;
  adminPanelOpen: boolean;
  setAdminPanelOpen: (open: boolean) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

// Default stats
const defaultStats: DashboardStats = {
  totalDrivers: 0,
  activeTrips: 0,
  totalEarnings: 0,
  totalPassengers: 0,
  onlineDrivers: 0,
  completedTripsToday: 0,
};

// Create store
export const useAppStore = create<AppState>((set) => ({
  // Language
  language: 'ar',
  setLanguage: (language) => set({ language }),

  // Theme
  theme: 'light',
  setTheme: (theme) => set({ theme }),

  // Users
  users: [],
  setUsers: (users) => set({ users }),
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),

  // Drivers
  drivers: [],
  setDrivers: (drivers) => set({ drivers }),
  onlineDriversCount: 0,
  setOnlineDriversCount: (onlineDriversCount) => set({ onlineDriversCount }),

  // Groups
  groups: [],
  setGroups: (groups) => set({ groups }),
  selectedGroup: null,
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),

  // Locations
  locations: [],
  setLocations: (locations) => set({ locations }),
  updateDriverLocation: (userId, location) =>
    set((state) => {
      const existingIndex = state.locations.findIndex(
        (loc) => loc.userId === userId
      );
      if (existingIndex >= 0) {
        const updated = [...state.locations];
        updated[existingIndex] = location;
        return { locations: updated };
      }
      return { locations: [...state.locations, location] };
    }),

  // Messages
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  // Trips
  trips: [],
  setTrips: (trips) => set({ trips }),
  activeTrips: [],
  setActiveTrips: (activeTrips) => set({ activeTrips }),

  // Dashboard stats
  stats: defaultStats,
  setStats: (stats) => set({ stats }),

  // UI State
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  chatPanelOpen: false,
  setChatPanelOpen: (chatPanelOpen) => set({ chatPanelOpen }),
  groupModalOpen: false,
  setGroupModalOpen: (groupModalOpen) => set({ groupModalOpen }),
  adminPanelOpen: false,
  setAdminPanelOpen: (adminPanelOpen) => set({ adminPanelOpen }),

  // Loading states
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
}));

// Selectors for optimized re-renders
export const useLanguage = () => useAppStore((state) => state.language);
export const useTheme = () => useAppStore((state) => state.theme);
export const useDrivers = () => useAppStore((state) => state.drivers);
export const useGroups = () => useAppStore((state) => state.groups);
export const useLocations = () => useAppStore((state) => state.locations);
export const useMessages = () => useAppStore((state) => state.messages);
export const useStats = () => useAppStore((state) => state.stats);
export const useUI = () =>
  useAppStore((state) => ({
    sidebarOpen: state.sidebarOpen,
    chatPanelOpen: state.chatPanelOpen,
    groupModalOpen: state.groupModalOpen,
    adminPanelOpen: state.adminPanelOpen,
  }));
