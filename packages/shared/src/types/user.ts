export enum UserRole {
  DEVELOPER = "developer",
  RESEARCHER = "researcher",
  ADMIN = "admin",
}

export interface User {
  id: string;
  address: string;
  role: UserRole;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  twitter: string | null;
  github: string | null;
  website: string | null;
  totalAudits: number;
  totalReports: number;
  reputation: number;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthChallenge {
  message: string;
  nonce: string;
  expiresAt: string;
}

export interface AuthVerifyRequest {
  address: string;
  signature: string;
  nonce: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}
