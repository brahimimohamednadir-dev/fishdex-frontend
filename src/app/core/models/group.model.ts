export type GroupVisibility = 'PUBLIC' | 'PRIVATE' | 'SECRET';
export type GroupCategory  = 'CLUB' | 'ASSOCIATION' | 'FRIENDS' | 'COMPETITION';
export type GroupRole      = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
export type MemberStatus   = 'MEMBER' | 'PENDING' | 'REJECTED' | 'BANNED';

export interface Group {
  id: number;
  name: string;
  description: string | null;
  coverPhotoUrl: string | null;
  visibility: GroupVisibility;
  category: GroupCategory;
  rules: string | null;
  memberCount: number;
  postCount: number;
  unreadCount: number;
  isPro: boolean;
  creatorUsername: string;
  createdAt: string;
  myRole: GroupRole | null;      // null if not member
  myStatus: MemberStatus | null; // null if never requested
}

export interface GroupRequest {
  name: string;
  description?: string;
  visibility: GroupVisibility;
  category: GroupCategory;
  rules?: string;
}

export interface JoinRequest {
  id: number;
  userId: number;
  username: string;
  message: string | null;
  requestedAt: string;
}

export interface GroupMember {
  userId: number;
  username: string;
  role: GroupRole;
  joinedAt: string;
  captureCount: number;
}

// Legacy FeedItem kept for backwards compat — new feed uses Post
export interface FeedItem {
  captureId: number; userId: number; username: string;
  speciesName: string; weight: number; length: number;
  photoUrl: string | null; caughtAt: string; createdAt: string;
}
