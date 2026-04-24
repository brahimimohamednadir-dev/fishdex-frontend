export type WaterType       = 'FRESHWATER' | 'SALTWATER' | 'BRACKISH';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type SeasonStatus    = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'DIFFICULT' | 'CLOSED';
export type BaitType        = 'NATURAL' | 'LURE' | 'FLY' | 'GROUND';
export type BudgetTier      = 'BUDGET' | 'MID' | 'PRO';

export interface MonthActivity {
  month:        number;        // 1-12
  status:       SeasonStatus;
  legalClosure: boolean;
}

export interface HourlyActivity {
  hour:          number;       // 0-23
  activityLevel: number;       // 0-100
}

export interface SpeciesBait {
  id:          number;
  name:        string;
  type:        BaitType;
  effectiveness: number;       // 1-5
  seasons:     string[];
  conditions:  string | null;
  imageUrl:    string | null;
}

export interface SpeciesTechnique {
  id:            number;
  name:          string;
  description:   string;
  difficulty:    DifficultyLevel;
  bestSeasons:   string[];
  proTip:        string | null;
  commonMistake: string | null;
}

export interface EquipmentItem {
  name:        string;
  description: string;
  budget:      BudgetTier;
  essential:   boolean;
}

export interface CommunityTip {
  id:             number;
  content:        string;
  authorUsername: string;
  upvotes:        number;
  hasUpvoted:     boolean;
  createdAt:      string;
}

export interface SpeciesRecord {
  weight:   number;
  length:   number;
  username: string;
  date:     string;
}

export interface SpeciesPersonalStats {
  totalCatches:   number;
  personalRecord: { weight: number; length: number; date: string } | null;
  averageWeight:  number | null;
  lastCatch:      string | null;
  caughtThisYear: number;
}

export interface Species {
  id:          number;
  commonName:  string;
  latinName:   string;
  family:      string | null;
  description: string;
  imageUrl:    string | null;

  // Physical
  minWeightKg: number | null;
  maxWeightKg: number | null;
  minLengthCm: number | null;
  maxLengthCm: number | null;

  // Classification
  waterTypes:         WaterType[];
  difficulty:         DifficultyLevel | null;
  conservationStatus: string | null;

  // Habitat
  habitat:        string | null;
  habitatDetail:  string | null;
  preferredDepth: string | null;
  temperature:    string | null;

  // Calendar & activity
  monthlyActivity: MonthActivity[];
  hourlyActivity:  HourlyActivity[];

  // Techniques & gear
  baits:      SpeciesBait[];
  techniques: SpeciesTechnique[];
  equipment:  EquipmentItem[];

  // Community
  communityTips: CommunityTip[];
  totalCaptures: number;
  fishDexRecord: SpeciesRecord | null;

  // Auth-dependent
  isCaught:      boolean;
  personalStats: SpeciesPersonalStats | null;
}
