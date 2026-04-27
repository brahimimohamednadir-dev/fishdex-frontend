export type NotificationType =
  | 'JOIN_REQUEST_ACCEPTED' | 'JOIN_REQUEST_REJECTED'
  | 'POST_REACTION' | 'POST_COMMENT' | 'COMMENT_REPLY'
  | 'GROUP_KICKED' | 'POST_PINNED'
  | 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED'
  | 'CAPTURE_LIKED' | 'CAPTURE_COMMENTED';

export interface AppNotification {
  id: number;
  type: NotificationType;
  read: boolean;
  actorUsername: string;
  groupName: string | null;
  groupId: number | null;
  postId: number | null;
  createdAt: string;
}
