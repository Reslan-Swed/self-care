import React, { useState } from 'react';
import { DollarSign, Clock, CheckCircle2, AlertTriangle, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';

export const CashRegisterShiftsView: React.FC = () => {
  const { role, hasAuthority } = useAuth();
  const { t } = useLanguageSwitcher();
  const { addToast } = useToast();

  const [activeShift, setActiveShift] = useState({
    id: 'shift-today',
    receptionistName: 'Emily Watson',
    openedAt: '2026-10-16 08:00 AM',
    expectedCash: 320.0,
    cardAmount: 840.0,
    transferAmount: 0.0,
    status: 'OPEN',
    transactionCount: 7
  });

  const [actualCashInput, setActualCashInput] = useState('320.00');
  const [closureNotes, setClosureNotes] = useState('End of day drawer counted and matched expected payments.');
  const [showCloseModal, setShowCloseModal] = useState(false);

  const parsedActual = parseFloat(actualCashInput) || 0;
  const discrepancy = parsedActual - activeShift.expectedCash;

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveShift((prev) => ({
      ...prev,
      status: 'CLOSED'
    }));
    setShowCloseModal(false);
    addToast({
      type: 'success',
      title: 'Shift Reconciled & Closed',
      message: `Shift closed with discrepancy: $${discrepancy.toFixed(2)}. Audit record created.`
    });
  };

  const historicalReports = [
    {
      id: 'shift-prev-1',
      date: '2026-10-15',
      receptionist: 'Emily Watson',
      expectedCash: 450.0,
      actualCash: 450.0,
      cardTotal: 1120.0,
      discrepancy: 0.0,
      status: 'CLOSED'
    },
    {
      id: 'shift-prev-2',
      date: '2026-10-14',
      receptionist: 'Marcus Vance',
      expectedCash: 380.0,
      actualCash: 375.0,
      cardTotal: 950.0,
      discrepancy: -5.0,
      status: 'CLOSED'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
            {t.nav.cashRegister}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Receptionist daily register drawer balance, cash collection, and end-of-shift reconciliation ledger.
          </p>
        </div>

        {activeShift.status === 'OPEN' ? (
          <button
            onClick={() => setShowCloseModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t.common.closeShift}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Shift Reconciled & Closed</span>
          </div>
        )}
      </div>

      {/* Active Shift Balance Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Active Shift Drawer ({activeShift.receptionistName})
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Opened: {activeShift.openedAt}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-xs">Expected Cash</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 tabular-nums">
              ${activeShift.expectedCash.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-xs">Card / Terminal Payments</div>
            <div className="text-xl font-bold text-cyan-400 mt-1 tabular-nums">
              ${activeShift.cardAmount.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-xs">Total Receipts Today</div>
            <div className="text-xl font-bold text-slate-100 mt-1 tabular-nums">
              ${(activeShift.expectedCash + activeShift.cardAmount).toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-xs">Drawer Status</div>
            <div className="text-base font-bold text-amber-300 mt-1">
              {activeShift.status}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Shift Settlement Audit (for CLINIC_ADMIN) */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              Historical Shift Reconciliation Reports (Admin Audit)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            @PreAuthorize("billing:reports:financial")
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
                <th className="py-3 px-4 font-semibold text-start">Date</th>
                <th className="py-3 px-4 font-semibold text-start">Staff Member</th>
                <th className="py-3 px-4 font-semibold text-start">Expected Cash</th>
                <th className="py-3 px-4 font-semibold text-start">Actual Cash</th>
                <th className="py-3 px-4 font-semibold text-start">Card Payments</th>
                <th className="py-3 px-4 font-semibold text-start">Discrepancy</th>
                <th className="py-3 px-4 font-semibold text-end">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {historicalReports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-200">{r.date}</td>
                  <td className="py-3 px-4 font-sans text-slate-300">{r.receptionist}</td>
                  <td className="py-3 px-4 tabular-nums text-slate-300">${r.expectedCash.toFixed(2)}</td>
                  <td className="py-3 px-4 tabular-nums text-slate-300">${r.actualCash.toFixed(2)}</td>
                  <td className="py-3 px-4 tabular-nums text-cyan-400">${r.cardTotal.toFixed(2)}</td>
                  <td className="py-3 px-4 tabular-nums">
                    {r.discrepancy === 0 ? (
                      <span className="text-emerald-400">$0.00 (Balanced)</span>
                    ) : (
                      <span className="text-rose-400">-${Math.abs(r.discrepancy).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-end">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      RECONCILED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Close Shift Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100">{t.common.closeShift}</h3>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Expected System Cash:</span>
                  <span className="text-emerald-400 font-bold">${activeShift.expectedCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Card / Terminal Receipts:</span>
                  <span className="text-cyan-400 font-bold">${activeShift.cardAmount.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Actual Physical Cash Counted in Drawer ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Real-time Discrepancy Indicator */}
              <div className="p-3 rounded-lg border text-xs font-mono flex items-center justify-between bg-slate-950 border-slate-800">
                <span>Calculated Discrepancy:</span>
                <span className={`font-bold ${discrepancy === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {discrepancy >= 0 ? `+$${discrepancy.toFixed(2)}` : `-$${Math.abs(discrepancy).toFixed(2)}`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reconciliation Notes
                </label>
                <textarea
                  rows={2}
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                >
                  Confirm & Lock Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegisterShiftsView;
