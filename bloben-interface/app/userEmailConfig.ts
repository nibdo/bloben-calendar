export interface SmtpData {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEmail: string;
}

export interface ImapData {
  imapHost: string;
  imapPort: number;
  imapUsername: string;
  imapPassword: string;
}

export interface UserEmailConfigDecryptedData {
  smtp?: SmtpData;
  imap?: ImapData;
}

export interface UpdateUserEmailConfigRequest
  extends UserEmailConfigDecryptedData {
  imapSyncingInterval?: number;
}

export interface GetUserEmailConfigResponse {
  hasSystemConfig: boolean;
  hasCustomConfig: boolean;
  mailto: string | null;
  smtp: SmtpData | null;
  imap: ImapData | null;
}

export type UserEmailConfigData = UpdateUserEmailConfigRequest;

export interface ImapAuth {
  user: string;
  pass: string;
}

export interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: ImapAuth;
}
