export interface UserSession {
  id: number;
  deviceInfo: string;
  ip: string;
  lastActive: string;
  trusted: boolean;
  current: boolean;
}

export interface TotpSetupResponse {
  secret: string;
  qrCodeUri: string;
  backupCodes: string[];
}
