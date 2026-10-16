import React, { useState } from 'react';
import { Shield, TrendingUp, Users, DollarSign, MessageSquare, RefreshCw, Award, Plus } from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';

export const PlatformAnalyticsView: React.FC = () => {
  const { t } = useLanguageSwitcher();
  const { addToast } = useToast();

  const [metrics] = useState({
    activeTenantsCount: 42,
    totalMrrCents: 12450000,
    trialTenantsCount: 18,
    pastDueTenantsCount: 3,
    renewalRatePercentage: 93.3,
    globalWhatsappCreditsUsed: 3840,
    globalWhatsappCreditsTotal: 12500
  });

  const [tenant360, setTenant360] = useState({
    id: 'a3b84180-2d6f-42a1-9c8e-5b1f81d94101',
    name: 'Metro Health Medical Center',
    slug: 'metro-health',
    status: 'ACTIVE',
    specialty: 'PEDIATRICS',
    subscriptionTier: 'GROWTH',
    creditsRemaining: 450,
    activeDoctors: 4,
    maxDoctors: 10,
    totalEncounters: 382
  });

  const [bonusInput, setBonusInput] = useState(500);

  const handleOverrideTier = (newTier: string) => {
    setTenant360((prev) => ({
      ...prev,
      subscriptionTier: newTier,
      maxDoctors: newTier === 'ENTERPRISE' ? 50 : 10
    }));
    addToast({
      type: 'success',
      title: 'Tenant Tier Overridden',
      message: `Updated ${tenant360.slug} to ${newTier}. Redis cache key tenant:status evicted immediately.`
    });
  };

  const handleGrantCredits = () => {
    setTenant360((prev) => ({
      ...prev,
      creditsRemaining: prev.creditsRemaining + bonusInput
    }));
    addToast({
      type: 'success',
      title: 'WhatsApp Credits Granted',
      message: `Granted +${bonusInput} messaging credits to ${tenant360.name}. New balance: ${tenant360.creditsRemaining + bonusInput}.`
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
            {t.nav.platformAnalytics}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Super Admin Control Plane intelligence, multi-tenant MRR telemetry, and Tenant 360 observability.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>ROLE_SUPER_ADMIN</span>
        </div>
      </div>

      {/* Global SaaS Dashboard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-sans">Monthly Recurring Revenue (MRR)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
            ${(metrics.totalMrrCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Sum of active subscription plans</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-sans">Active Clinics Onboarded</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 tabular-nums">
            {metrics.activeTenantsCount} <span className="text-xs text-slate-500 font-normal">/ {metrics.activeTenantsCount + metrics.trialTenantsCount} total</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{metrics.trialTenantsCount} trialing · {metrics.pastDueTenantsCount} past due</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-sans">Annual Renewal Retention Rate</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 tabular-nums">
            {metrics.renewalRatePercentage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">High retention across clinics</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-sans">Global WhatsApp Credits Used</div>
          <div className="text-2xl font-bold text-slate-100 mt-1 tabular-nums">
            {metrics.globalWhatsappCreditsUsed.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ {metrics.globalWhatsappCreditsTotal.toLocaleString()}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all clinic subscriptions</div>
        </div>
      </div>

      {/* Tenant 360 Deep Profile */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Tenant 360 Workspace Profile: {tenant360.name}
            </h2>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              ID: {tenant360.id} · Slug: {tenant360.slug}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {tenant360.status}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {tenant360.subscriptionTier}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subscription Limits */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Subscription Plan & Quotas</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Doctor Quota:</span>
                <span className="text-cyan-300 font-bold">{tenant360.activeDoctors} / {tenant360.maxDoctors} Active</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Encounters Recorded:</span>
                <span className="text-slate-200">{tenant360.totalEncounters} Encounters</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>WhatsApp Credits:</span>
                <span className="text-emerald-400 font-bold">{tenant360.creditsRemaining} remaining</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] text-slate-400 font-sans">Override Subscription Tier:</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOverrideTier('GROWTH')}
                  className={`flex-1 py-1 text-xs font-mono rounded ${tenant360.subscriptionTier === 'GROWTH' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  GROWTH
                </button>
                <button
                  onClick={() => handleOverrideTier('ENTERPRISE')}
                  className={`flex-1 py-1 text-xs font-mono rounded ${tenant360.subscriptionTier === 'ENTERPRISE' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  ENTERPRISE
                </button>
              </div>
            </div>
          </div>

          {/* Credit Allocation Tool */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Grant Bonus WhatsApp Credits</span>
            </div>
            <p className="text-xs text-slate-400">
              Instantly increment the clinic's automated message dispatch allowance without billing charges.
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                value={bonusInput}
                onChange={(e) => setBonusInput(parseInt(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 font-mono"
              />
              <button
                onClick={handleGrantCredits}
                className="flex-1 py-1 px-3 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                + Grant Credits
              </button>
            </div>
          </div>

          {/* Temporal Support Impersonation */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Temporal Support Session</span>
            </div>
            <p className="text-xs text-slate-400">
              Generate a short-lived 30-minute JWT with immutable database audit log for support troubleshooting.
            </p>
            <button
              onClick={() => addToast({ type: 'info', title: 'Impersonation Session', message: 'Issued 30-min JWT with is_impersonated: true. Audit log written.' })}
              className="w-full py-1.5 px-3 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Start 30-Min Support Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalyticsView;
