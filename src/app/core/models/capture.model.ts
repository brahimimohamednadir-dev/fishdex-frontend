import { Species } from './species.model';

export interface Capture {
  id: number;
  userId: number;
  username: string;
  speciesName: string;
  weight: number;
  length: number;
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  note: string | null;
  caughtAt: string;
  createdAt: string;
  species: Species | null;
  visibility?: string;
  // Météo (optionnel — présent si la capture a des coordonnées GPS)
  weatherTemp?:     number | null;
  weatherWind?:     number | null;
  weatherPressure?: number | null;
  weatherClouds?:   number | null;
  weatherDesc?:     string | null;
  weatherIcon?:     string | null;
}

export interface CaptureRequest {
  speciesName: string;
  weight: number;
  length: number;
  latitude?: number;
  longitude?: number;
  note?: string;
  caughtAt: string;
  speciesId?: number;
  visibility?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
