// types.tsx - Make sure all types are properly exported

export interface AttendanceRecord {
  _id: string;
  checkIn: {
    dateTime: string;
    city: string;
    state?: string;
    country: string;
    lat: number;
    lon: number;
    ip?: string;
  };
  checkOut: {
    dateTime: string;
    city: string;
    state?: string;
    country: string;
    lat: number;
    lon: number;
    ip?: string;
  } | null;
}

export interface CurrentSession {
  checkInTime: string;
  duration: number;
  location: {
    city: string;
    state?: string;
    country: string;
    lat: number;
    lon: number;
  };
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface User {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
}

export interface Location {
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  ip?: string;
}