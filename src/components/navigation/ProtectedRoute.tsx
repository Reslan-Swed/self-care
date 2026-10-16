import React from 'react';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { AuthUserType, UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  allowedUserTypes?: AuthUserType[];
  requiredAuthorities?: string[];
  routePath?: string;
  onNavigateHome?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  allowedUserTypes,
  requiredAuthorities,
  routePath,
  onNavigateHome
}) => {
  const { user, isAuthenticated, role, userType, hasAnyAuthority, switchRole } = useAuth();
  const { t, isRtl } = useLanguageSwitcher();

  // 1. Check Authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Authentication Required (HTTP 401)</h2>
            <p className="text-xs text-slate-400 mt-1">{t.common.unauthorizedMessage}</p>
          </div>
          <button
            onClick={() => switchRole('RECEPTIONIST')}
            className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
          >
            Authenticate as Clinic Receptionist
          </button>
        </div>
      </div>
    );
  }

  // 2. Check User Type (PLATFORM_ADMIN vs TENANT_USER)
  if (allowedUserTypes && allowedUserTypes.length > 0 && userType) {
    if (!allowedUserTypes.includes(userType)) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
          <div className="max-w-lg w-full bg-slate-900 border border-rose-800/60 rounded-xl p-8 space-y-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-100">Control Plane Isolation Boundary (HTTP 403)</h2>
                <p className="text-xs text-slate-400 mt-1">
                  This route is strictly restricted to {allowedUserTypes.join(' or ')}. Your current security principal is <code className="text-rose-300 font-mono">{userType}</code>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
              <div className="text-slate-500">Route: <span className="text-slate-300">{routePath || window.location.pathname}</span></div>
              <div className="text-slate-500">Principal User: <span className="text-slate-300">{user.email}</span></div>
              <div className="text-slate-500">Active Role: <span className="text-cyan-400">{role}</span></div>
            </div>

            <div className="flex items-center gap-3">
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                  <span>Return to Safety</span>
                </button>
              )}
              {allowedUserTypes.includes('PLATFORM_ADMIN') && (
                <button
                  onClick={() => switchRole('SUPER_ADMIN')}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                >
                  Switch to Super Admin
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // 3. Check Role & Specific RBAC Authorities
  const roleForbidden = allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role);
  const authorityForbidden = requiredAuthorities && requiredAuthorities.length > 0 && !hasAnyAuthority(requiredAuthorities);

  if (roleForbidden || authorityForbidden) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-lg w-full bg-slate-900 border border-amber-800/60 rounded-xl p-8 space-y-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Access Restricted by RBAC Policy (HTTP 403)</h2>
              <p className="text-xs text-slate-400 mt-1">
                {t.common.permissionDenied}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Required Role:</span>
              <span className="font-mono text-emerald-400 font-semibold">{allowedRoles?.join(' or ')}</span>
            </div>
            {requiredAuthorities && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Required Authority:</span>
                <span className="font-mono text-cyan-400 font-semibold">{requiredAuthorities.join(', ')}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-400 border-t border-slate-800 pt-2">
              <span>Your Current Role:</span>
              <span className="font-mono text-amber-300 font-semibold">{role}</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-800/60">
            <strong>Clinical Privacy Invariant:</strong> Reception staff are strictly isolated from clinical diagnosis, SOAP progress notes, and prescriptions. Only licensed physicians (<code className="text-cyan-300 font-mono">ROLE_DOCTOR</code>) may access the clinical workspace.
          </div>

          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>Return to Allowed View</span>
              </button>
            )}
            {allowedRoles && allowedRoles.length > 0 && (
              <button
                onClick={() => switchRole(allowedRoles[0])}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
              >
                Simulate {allowedRoles[0]}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authorized: Render child component
  return <>{children}</>;
};

export default ProtectedRoute;
