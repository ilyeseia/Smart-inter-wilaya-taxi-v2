// Constants for Smart Inter-Wilaya Taxi v2

// Algeria Wilayas (58 provinces)
export const WILAYAS = [
  { code: '01', name: { ar: 'أدرار', fr: 'Adrar' } },
  { code: '02', name: { ar: 'الشلف', fr: 'Chlef' } },
  { code: '03', name: { ar: 'الأغواط', fr: 'Laghouat' } },
  { code: '04', name: { ar: 'أم البواقي', fr: 'Oum El Bouaghi' } },
  { code: '05', name: { ar: 'باتنة', fr: 'Batna' } },
  { code: '06', name: { ar: 'بجاية', fr: 'Béjaïa' } },
  { code: '07', name: { ar: 'بسكرة', fr: 'Biskra' } },
  { code: '08', name: { ar: 'بشار', fr: 'Béchar' } },
  { code: '09', name: { ar: 'البليدة', fr: 'Blida' } },
  { code: '10', name: { ar: 'البويره', fr: 'Bouira' } },
  { code: '11', name: { ar: 'تمنراست', fr: 'Tamanrasset' } },
  { code: '12', name: { ar: 'تبسه', fr: 'Tébessa' } },
  { code: '13', name: { ar: 'تلمسان', fr: 'Tlemcen' } },
  { code: '14', name: { ar: 'تيارت', fr: 'Tiaret' } },
  { code: '15', name: { ar: 'تيزي وزو', fr: 'Tizi Ouzou' } },
  { code: '16', name: { ar: 'الجزائر', fr: 'Alger' } },
  { code: '17', name: { ar: 'الجلفة', fr: 'Djelfa' } },
  { code: '18', name: { ar: 'جيجل', fr: 'Jijel' } },
  { code: '19', name: { ar: 'سطيف', fr: 'Sétif' } },
  { code: '20', name: { ar: 'سعيدة', fr: 'Saïda' } },
  { code: '21', name: { ar: 'سكيكدة', fr: 'Skikda' } },
  { code: '22', name: { ar: 'سيدي بلعباس', fr: 'Sidi Bel Abbès' } },
  { code: '23', name: { ar: 'عنابة', fr: 'Annaba' } },
  { code: '24', name: { ar: 'قالمة', fr: 'Guelma' } },
  { code: '25', name: { ar: 'قسنطينة', fr: 'Constantine' } },
  { code: '26', name: { ar: 'المدية', fr: 'Médéa' } },
  { code: '27', name: { ar: 'مستغانم', fr: 'Mostaganem' } },
  { code: '28', name: { ar: 'المسيلة', fr: 'M\'Sila' } },
  { code: '29', name: { ar: 'معسكر', fr: 'Mascara' } },
  { code: '30', name: { ar: 'ورقلة', fr: 'Ouargla' } },
  { code: '31', name: { ar: 'وهران', fr: 'Oran' } },
  { code: '32', name: { ar: 'البيض', fr: 'El Bayadh' } },
  { code: '33', name: { ar: 'إليزي', fr: 'Illizi' } },
  { code: '34', name: { ar: 'برج بوعريريج', fr: 'Bordj Bou Arreridj' } },
  { code: '35', name: { ar: 'بومرداس', fr: 'Boumerdès' } },
  { code: '36', name: { ar: 'الطارف', fr: 'El Tarf' } },
  { code: '37', name: { ar: 'تندوف', fr: 'Tindouf' } },
  { code: '38', name: { ar: 'تيسمسيلت', fr: 'Tissemsilt' } },
  { code: '39', name: { ar: 'الوادي', fr: 'El Oued' } },
  { code: '40', name: { ar: 'خنشلة', fr: 'Khenchela' } },
  { code: '41', name: { ar: 'سوق أهراس', fr: 'Souk Ahras' } },
  { code: '42', name: { ar: 'تيبازة', fr: 'Tipaza' } },
  { code: '43', name: { ar: 'ميلة', fr: 'Mila' } },
  { code: '44', name: { ar: 'عين الدفلى', fr: 'Aïn Defla' } },
  { code: '45', name: { ar: 'النعامة', fr: 'Naâma' } },
  { code: '46', name: { ar: 'عين تموشنت', fr: 'Aïn Témouchent' } },
  { code: '47', name: { ar: 'غرداية', fr: 'Ghardaïa' } },
  { code: '48', name: { ar: 'غليزان', fr: 'Relizane' } },
  { code: '49', name: { ar: 'تيميمون', fr: 'Timimoun' } },
  { code: '50', name: { ar: 'برج باجي مختار', fr: 'Bordj Badji Mokhtar' } },
  { code: '51', name: { ar: 'أولاد جلال', fr: 'Ouled Djellal' } },
  { code: '52', name: { ar: 'بن عباس', fr: 'Béni Abbès' } },
  { code: '53', name: { ar: 'عين صالح', fr: 'In Salah' } },
  { code: '54', name: { ar: 'عين قزام', fr: 'In Guezzam' } },
  { code: '55', name: { ar: 'تقرت', fr: 'Touggourt' } },
  { code: '56', name: { ar: 'الدقم', fr: 'Djanet' } },
  { code: '57', name: { ar: 'المغير', fr: 'El M\'Ghair' } },
  { code: '58', name: { ar: 'المنيعة', fr: 'El Meniaa' } },
] as const;

// Vehicle types
export const VEHICLE_TYPES = [
  { value: 'sedan', label: { ar: 'سيدان', fr: 'Sedan' }, capacity: 4 },
  { value: 'van', label: { ar: 'فان', fr: 'Van' }, capacity: 8 },
  { value: 'suv', label: { ar: 'دفع رباعي', fr: 'SUV' }, capacity: 6 },
] as const;

// Trip status colors
export const TRIP_STATUS_COLORS = {
  scheduled: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
} as const;

// User status colors
export const USER_STATUS_COLORS = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  busy: 'bg-yellow-500',
} as const;

// Algeria center coordinates for map
export const ALGERIA_CENTER = {
  lat: 28.0339,
  lng: 1.6596,
} as const;

// Algeria bounds for map
export const ALGERIA_BOUNDS = {
  north: 37.5,
  south: 18.0,
  east: 12.0,
  west: -9.0,
} as const;

// Price per km (in DZD)
export const PRICE_PER_KM = 15;

// Base fare (in DZD)
export const BASE_FARE = 100;

// Demo driver locations for initial display
export const DEMO_DRIVERS = [
  { id: '1', name: 'أحمد بن علي', lat: 36.7538, lng: 3.0588, wilaya: 'الجزائر', status: 'online' },
  { id: '2', name: 'محمد بوزيد', lat: 36.3650, lng: 6.6147, wilaya: 'قسنطينة', status: 'busy' },
  { id: '3', name: 'عمر حمادي', lat: 35.6911, lng: -0.6417, wilaya: 'وهران', status: 'online' },
  { id: '4', name: 'يوسف خليفي', lat: 36.1900, lng: 5.4100, wilaya: 'سطيف', status: 'offline' },
  { id: '5', name: 'كريم بلقاسم', lat: 36.8381, lng: 7.7658, wilaya: 'عنابة', status: 'online' },
] as const;

// Popular routes (Wilaya pairs)
export const POPULAR_ROUTES = [
  { from: 'الجزائر', to: 'وهران', distance: 420, avgPrice: 7300 },
  { from: 'الجزائر', to: 'قسنطينة', distance: 320, avgPrice: 5800 },
  { from: 'وهران', to: 'قسنطينة', distance: 500, avgPrice: 8500 },
  { from: 'الجزائر', to: 'سطيف', distance: 280, avgPrice: 5200 },
  { from: 'الجزائر', to: 'باتنة', distance: 350, avgPrice: 6250 },
] as const;
