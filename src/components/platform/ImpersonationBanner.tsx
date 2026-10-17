import React from 'react';
import { AlertTriangle, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';

interface ImpersonationBannerProps {
  onExitSession?: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ onExitSession }) => {
  const { impersonatedTenant, isImpersonating, stopImpersonation } = useAuth();
  const { isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();

  if (!isImpersonating || !impersonatedTenant) {
    return null;
  }

  const handleExit = () => {
    stopImpersonation();
    addToast({
      type: 'info',
      title: 'Support Session Terminated',
      message: `Safely exited impersonation of ${impersonatedTenant.name}. Returned to Super Admin Control Plane.`
    });
    if (onExitSession) {
      onExitSession();
    }
  };

  return (
    <div className="w-full bg-rose-600 text-white px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between z-50 sticky top-0 shrink-0 animate-in fade-in">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 text-white animate-pulse" />
        <span>
          <strong>⚠️ {isRtl ? 'جلسة دعم فني نشطة:' : 'SUPPORT SESSION:'}</strong>{' '}
          {isRtl ? 'أنت تنتحل حالياً هوية عيادة' : 'You are currently impersonating'}{' '}
          <span className="underline decoration-white underline-offset-2 font-bold font-mono">
            {impersonatedTenant.name}
          </span>{' '}
          ({impersonatedTenant.slug}.micropms.io) {isRtl ? 'بصفة مدير النظام (Super Admin)' : 'as Super Admin'}.
        </span>
      </div>

      <button
        onClick={handleExit}
        className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-rose-100 text-rose-800 rounded font-bold text-xs shadow-xs transition-colors shrink-0"
        title="Terminate impersonation token and return to Super Admin dashboard"
      >
        <LogOut className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
        <span>{isRtl ? 'إنهاء جلسة الانتحال ✕' : 'Exit Session ✕'}</span>
      </button>
    </div>
  );
};

export default ImpersonationBanner;
