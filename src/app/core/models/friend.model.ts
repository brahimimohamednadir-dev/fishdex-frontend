export interface Friend {
  userId:              number;
  username:            string;
  userTag:             string;
  captureCount:        number;
  activeToday:         boolean;
  lastCaptureId:       number | null;
  lastCaptureSpecies:  string | null;
  lastCapturePhotoUrl: string | null;
  lastCaptureAt:       string | null;
  /** ACCEPTED | PENDING_SENT | PENDING_RECEIVED | NONE */
  friendshipStatus:    FriendshipStatus;
  friendshipId:        number | null;
}

export type FriendshipStatus =
  | 'ACCEPTED'
  | 'PENDING_SENT'
  | 'PENDING_RECEIVED'
  | 'NONE';
