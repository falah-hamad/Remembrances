export interface Zikr {
  id: string;
  category: string;
  text: string;
  count: number;
  reference?: string;
  benefit?: string;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  favorites: string[]; // IDs of Azkar
  tasbihCount: number;
  settings?: {
    language: 'ar' | 'en';
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    notifications: boolean;
    locationAccuracy: 'low' | 'high';
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
