import React, { useState } from 'react';
import { ShieldAlert, Key, X, ArrowRight, Building2, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';
import { TenantSummaryDto } from '../../types/auth';

interface ImpersonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTenant: TenantSummaryDto | null;
  onImpersonationSuccess: (tenant: TenantSummaryDto) => void;
}

export const ImpersonateModal: React.FC<ImpersonateModalProps> = ({
  isOpen,
  onClose,
  targetTenant,
  onImpersonationSuccess
}) => {
  const { startImpersonation } = useAuth();
  const { isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();

  const [justification, setJustification] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetTenant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      addToast({
        type: 'error',
        title: 'Justification Required',
        message: 'A mandatory support reason or ticket reference is required for audit logs.'
      });
      return;
    }

    setIsSubmitting(true);
    const combinedReason = ticketId.trim()
      ? `Ticket #${ticketId.trim()}: ${justification.trim()}`
      : justification.trim();

    try {
      await startImpersonation(targetTenant, combinedReason);
      setIsSubmitting(false);
      addToast({
        type: 'success',
        title: 'Support Session Established',
        message: `Acquired short-lived audit-logged token for ${targetTenant.name}. Redirecting to tenant workspace...`
      });
      onImpersonationSuccess(targetTenant);
      onClose();
    } catch {
      setIsSubmitting(false);
      addToast({
        type: 'error',
        title: 'Impersonation Failed',
        message: 'Could not acquire impersonation token.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {isRtl ? 'بدء جلسة دعم منتحلة (Impersonate)' : 'Secure Support Impersonation'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {targetTenant.name} ({targetTenant.slug})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3 bg-amber-950/50 border border-amber-800/80 rounded-lg text-amber-200 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <span>AUDIT POLICY ENFORCEMENT</span>
          </div>
          <p className="text-amber-100/90 text-[11px] leading-relaxed">
            All actions executed while impersonating this clinic will be permanently logged in the PostgreSQL Audit Trail. You will be operating within the tenant&apos;s isolated PostgreSQL RLS boundaries.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Ticket ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Support Ticket Reference (Optional)
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="e.g. ZENDESK-8921 or JIRA-PMS-404"
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Justification Reason (Required) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reason / Support Justification *
            </label>
            <textarea
              rows={3}
              required
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Describe the clinical issue or user request requiring super admin troubleshooting..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Acquiring JWT...' : 'Acquire Token & Impersonate 👁️'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImpersonateModal;
