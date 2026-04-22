export type ReactionType = 'LIKE' | 'FIRE' | 'TROPHY' | 'WOW';

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  LIKE: '👍', FIRE: '🔥', TROPHY: '🏆', WOW: '😮',
};

export interface Reaction {
  type: ReactionType;
  count: number;
  reacted: boolean;
}

export interface Comment {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
  editedAt: string | null;
  likeCount: number;
  liked: boolean;
  replies: Comment[];
  canEdit: boolean;
  canDelete: boolean;
}

export interface PostCapture {
  id: number;
  speciesName: string;
  weight: number;
  length: number;
  photoUrl: string | null;
  caughtAt: string;
}

export interface Post {
  id: number;
  groupId: number;
  userId: number;
  username: string;
  content: string;
  photoUrls: string[];
  capture: PostCapture | null;
  reactions: Reaction[];
  totalReactions: number;
  commentCount: number;
  comments: Comment[];
  pinned: boolean;
  createdAt: string;
  editedAt: string | null;
  canEdit: boolean;
  canDelete: boolean;
  canPin: boolean;
  reported: boolean;
}

export interface CreatePostRequest {
  content: string;
  captureId?: number;
}

export interface Report {
  id: number;
  reporterId: number;
  reporterUsername: string;
  targetType: 'POST' | 'COMMENT';
  targetId: number;
  contentPreview: string;
  reason: string | null;
  createdAt: string;
}
