export interface FeedCapture {
  id:               number;
  userId:           number;
  username:         string;
  speciesName:      string;
  weight:           number;
  length:           number;
  photoUrl:         string | null;
  latitude:         number | null;
  longitude:        number | null;
  note:             string | null;
  caughtAt:         string;
  createdAt:        string;
  visibility:       'PUBLIC' | 'FRIENDS' | 'PRIVATE';

  // Espèce catalogue
  speciesId:        number | null;
  speciesLatinName: string | null;
  speciesImageUrl:  string | null;

  // Social
  likeCount:        number;
  hasLiked:         boolean;
  commentCount:     number;
  recentComments:   FeedComment[];
}

export interface FeedComment {
  id:        number;
  userId:    number;
  username:  string;
  content:   string;
  createdAt: string;
}

export type FeedVisibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

export const VISIBILITY_OPTIONS: { value: FeedVisibility; label: string; icon: string; desc: string }[] = [
  { value: 'PUBLIC',  label: 'Public',        icon: '🌍', desc: 'Visible par tous' },
  { value: 'FRIENDS', label: 'Amis',          icon: '👥', desc: 'Visible par tes amis uniquement' },
  { value: 'PRIVATE', label: 'Privé',         icon: '🔒', desc: 'Visible uniquement par toi' },
];
