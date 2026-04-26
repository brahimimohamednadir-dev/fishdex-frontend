import { Capture } from './capture.model';

export interface User {
  id: number;
  email: string;
  username: string;
  userTag: string;
  isPremium: boolean;
  captureCount: number;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface UserStats {
  totalCaptures: number;
  totalWeight: number;
  biggestCatch: Capture | null;
  capturesBySpecies: Record<string, number>;
  mostActiveMonth: string;
  joinedGroupsCount: number;
}
