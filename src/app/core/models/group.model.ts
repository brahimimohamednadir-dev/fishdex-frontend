export interface Group {
  id: number;
  name: string;
  description: string | null;
  type: 'CLUB' | 'ASSOCIATION';
  isPro: boolean;
  memberCount: number;
  creatorUsername: string;
  createdAt: string;
}

export interface FeedItem {
  captureId: number;
  userId: number;
  username: string;
  speciesName: string;
  weight: number;
  length: number;
  photoUrl: string | null;
  caughtAt: string;
  createdAt: string;
}

export interface GroupRequest {
  name: string;
  description?: string;
  type: 'CLUB' | 'ASSOCIATION';
}
