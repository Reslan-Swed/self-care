import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfileDto, TenantSummaryDto, UserRole, AuthUserType } from '../types/auth';
import { getAuthToken, setAuthToken, setTenantSlug, subscribeToUnauthorized } from '../services/apiClient';

interface AuthContextValue {
  user: UserProfileDto | null;
  tenant: TenantSummaryDto | null;
  token: string | null;
  isAuthenticated: boolean;
  userType: AuthUserType | null;
  role: UserRole | null;
  authorities: string[];
  hasAuthority: (authority: string) => boolean;
  hasAnyAuthority: (authorities: string[]) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchTenant: (tenant: TenantSummaryDto) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Predefined demo profiles for the Micro-PMS multi-tenant workspace
export const DEMO_PROFILES: Record<UserRole, { user: UserProfileDto; tenant: TenantSummaryDto | null }> = {
  RECEPTIONIST: {
    user: {
      id: '8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
      email: 'emily.reception@metrohealth.internal',
      fullName: 'Emily Watson',
      role: 'RECEPTIONIST',
      userType: 'TENANT_USER',
      authorities: [
        'ROLE_RECEPTIONIST',
        'appointment:read',
        'appointment:create',
        'appointment:cancel',
        'queue:status:update',
        'patient:basic:read',
        'patient:basic:write',
        'billing:invoice:create',
        'billing:payment:collect',
        'billing:shift:close',
        'notification:dispatch'
      ],
      phone: '+1 (555) 234-5678',
      tenantId: 'a3b84180-2d6f-42a1-9c8e-5b1f81d94101',
      tenantSlug: 'metro-health',
      tenantName: 'Metro Health Medical Center',
      isActive: true
    },
    tenant: {
      id: 'a3b84180-2d6f-42a1-9c8e-5b1f81d94101',
      name: 'Metro Health Medical Center',
      slug: 'metro-health',
      status: 'ACTIVE',
      specialty: 'PEDIATRICS',
      subscriptionTier: 'GROWTH',
      phone: '+1-555-019-2831',
      createdAt: '2026-01-15T09:00:00Z'
    }
  },
  DOCTOR: {
    user: {
      id: '5f8a2c1b-9d4e-4f3a-8c7b-1a2b3c4d5e6f',
      email: 'dr.sarah@metrohealth.internal',
      fullName: 'Dr. Sarah Jenkins, MD',
      role: 'DOCTOR',
      userType: 'TENANT_USER',
      authorities: [
        'ROLE_DOCTOR',
        'encounter:clinical:read',
        'encounter:clinical:write',
        'patient:basic:read',
        'patient:basic:write',
        'appointment:read',
        'appointment:create',
        'queue:status:update',
        'prescription:write'
      ],
      phone: '+1 (555) 345-6789',
      specialty: 'Pediatrics',
      licenseNumber: 'MED-98412-CA',
      tenantId: 'a3b84180-2d6f-42a1-9c8e-5b1f81d94101',
      tenantSlug: 'metro-health',
      tenantName: 'Metro Health Medical Center',
      isActive: true
    },
    tenant: {
      id: 'a3b84180-2d6f-42a1-9c8e-5b1f81d94101',
      name: 'Metro Health Medical Center',
      slug: 'metro-health',
      status: 'ACTIVE',
      specialty: 'PEDIATRICS',
      subscriptionTier: 'GROWTH',
      phone: '+1-555-019-2831',
      createdAt: '2026-01-15T09:00:00Z'
    }
  },
  CLINIC_ADMIN: {
    user: {
      id: '2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
      email: 'admin.mark@metrohealth.internal',
      fullName: 'Mark Henderson (Practice Admin)',
      role: 'CLINIC_ADMIN',
      userType: 'TENANT_USER',
      authorities: [
        'ROLE_CLINIC_ADMIN',
        'clinic:users:manage',
        'clinic:settings:manage',
        'clinic:schema:eav',
        'billing:reports:financial',
        'billing:invoice:create',
        'billing:payment:collect',
        'appointment:read',
        'appointment:create',
        'appointment:cancel',
        'patient:basic:read',
        'patient:basic:write',
        'queue:status:update'
      ],
      phone: '+1 (555) 456-7890',
      tenantId: 'a3b84180-2d6f-42a1-9c8e-5b1f81d94101',
      tenantSlug: 'metro-health',
      tenantName: 'Metro Health Medical Center',
      isActive: true
    },
    tenant: {
      id: 'a3b84180-2d6f-42a1-9c8e-5b1f81d94101',
      name: 'Metro Health Medical Center',
      slug: 'metro-health',
      status: 'ACTIVE',
      specialty: 'PEDIATRICS',
      subscriptionTier: 'GROWTH',
      phone: '+1-555-019-2831',
      createdAt: '2026-01-15T09:00:00Z'
    }
  },
  SUPER_ADMIN: {
    user: {
      id: '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
      email: 'superadmin@micropms.io',
      fullName: 'Global Platform Administrator',
      role: 'SUPER_ADMIN',
      userType: 'PLATFORM_ADMIN',
      authorities: [
        'ROLE_SUPER_ADMIN',
        'platform:admin',
        'platform:tenants:manage',
        'platform:subscriptions:manage',
        'platform:impersonate:tenant'
      ],
      tenantId: null,
      tenantSlug: null,
      tenantName: null,
      isActive: true
    },
    tenant: null
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('RECEPTIONIST');
  const [user, setUser] = useState<UserProfileDto | null>(DEMO_PROFILES.RECEPTIONIST.user);
  const [tenant, setTenant] = useState<TenantSummaryDto | null>(DEMO_PROFILES.RECEPTIONIST.tenant);
  const [token, setToken] = useState<string | null>(() => getAuthToken() || 'mock-jwt-token-receptionist');

  // Sync token to apiClient headers on mount
  useEffect(() => {
    if (!getAuthToken()) {
      setAuthToken('mock-jwt-token-receptionist');
    }
    setTenantSlug(tenant?.slug || null);
  }, [tenant]);

  // Handle unauthorized event from apiClient
  useEffect(() => {
    return subscribeToUnauthorized(() => {
      // Optional: auto re-authenticate or clear session
    });
  }, []);

  const authorities = user?.authorities || [];

  const hasAuthority = useCallback(
    (authority: string): boolean => {
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN' || user.authorities.includes('ROLE_SUPER_ADMIN')) {
        return true;
      }
      return user.authorities.includes(authority);
    },
    [user]
  );

  const hasAnyAuthority = useCallback(
    (requiredAuthorities: string[]): boolean => {
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN' || user.authorities.includes('ROLE_SUPER_ADMIN')) {
        return true;
      }
      return requiredAuthorities.some((auth) => user.authorities.includes(auth));
    },
    [user]
  );

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(user.role);
    },
    [user]
  );

  const switchRole = useCallback((newRole: UserRole) => {
    setCurrentRole(newRole);
    const profile = DEMO_PROFILES[newRole];
    setUser(profile.user);
    setTenant(profile.tenant);
    const mockToken = `mock-jwt-token-${newRole.toLowerCase()}`;
    setToken(mockToken);
    setAuthToken(mockToken);
    setTenantSlug(profile.tenant?.slug || null);
  }, []);

  const switchTenant = useCallback((newTenant: TenantSummaryDto) => {
    setTenant(newTenant);
    setTenantSlug(newTenant.slug);
    setUser((prev) => (prev ? { ...prev, tenantId: newTenant.id, tenantSlug: newTenant.slug, tenantName: newTenant.name } : null));
  }, []);

  const login = useCallback(async (email: string, targetRole: UserRole = 'RECEPTIONIST') => {
    switchRole(targetRole);
  }, [switchRole]);

  const logout = useCallback(() => {
    setUser(null);
    setTenant(null);
    setToken(null);
    setAuthToken(null);
    setTenantSlug(null);
  }, []);

  const value: AuthContextValue = {
    user,
    tenant,
    token,
    isAuthenticated: !!user && !!token,
    userType: user?.userType || null,
    role: user?.role || null,
    authorities,
    hasAuthority,
    hasAnyAuthority,
    hasRole,
    login,
    logout,
    switchRole,
    switchTenant
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
