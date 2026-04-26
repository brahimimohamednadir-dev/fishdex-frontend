import { Capture } from './capture.model';
import { Badge } from './badge.model';
import { FriendshipStatus } from './friend.model';

export interface PublicProfile {
  userId:               number;
  username:             string;
  memberSince:          string;
  totalCaptures:        number;
  distinctSpecies:      number;
  heaviestCatchKg:      number | null;
  heaviestCatchSpecies: string | null;
  recentCaptures:       Capture[];
  badges:               Badge[];
  friendshipStatus:     FriendshipStatus | null;
  friendshipId:         number | null;
}

export interface PersonalStats {
  totalCaptures:        number;
  thisYear:             number;
  thisMonth:            number;
  distinctSpecies:      number;
  heaviestCatchKg:      number | null;
  heaviestCatchSpecies: string | null;
  longestCatchCm:       number | null;
  longestCatchSpecies:  string | null;
  monthlyCaptures:      MonthStat[];
  topSpecies:           SpeciesRecord[];
  favoriteSpots:        SpotStat[];
}

export interface MonthStat {
  month: number;
  label: string;
  count: number;
}

export interface SpeciesRecord {
  speciesName:   string;
  count:         number;
  recordWeight:  number | null;
  recordLength:  number | null;
}

export interface SpotStat {
  lat:   number;
  lng:   number;
  count: number;
  label: string;
}
