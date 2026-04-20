export interface Group {
  id: number;
  name: string;
  memberCount: number;
  createdAt: string;
}

export interface FeedItem {
  id: number;
  username: string;
  speciesName: string;
  weight: number;
  photoUrl: string | null;
  caughtAt: string;
}
