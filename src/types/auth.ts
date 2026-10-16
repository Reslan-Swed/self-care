export type AuthUserType = 'TENANT_USER' | 'PLATFORM_ADMIN';

export type ClinicStaffRole = 'DOCTOR' | 'RECEPTIONIST' | 'CLINIC_ADMIN';
export type PlatformRole = 'SUPER_ADMIN';
export type UserRole = ClinicStaffRole | PlatformRole;

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  userType: AuthUserType;
  authorities: string[];
  phone?: string | null;
  specialty?: string | null;
  licenseNumber?: string | null;
  tenantId?: string | null;
  tenantSlug?: string | null;
  tenantName?: string | null;
  isActive: boolean;
}

export interface TenantSummaryDto {
  id: string;
  name: string;
  slug: string;
  status: string;
  specialty?: string | null;
  subscriptionTier?: string | null;
  phone?: string | null;
  createdAt?: string | null;
}

export interface AuthResponseDto {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfileDto;
  tenant?: TenantSummaryDto | null;
}

export interface LoginRequestDto {
  email: string;
  password: string;
  tenantSlug?: string | null;
}
