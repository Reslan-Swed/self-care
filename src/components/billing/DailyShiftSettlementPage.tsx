import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Printer, 
  History, 
  ArrowRight,
  Sparkles,
  Lock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';
import { ShiftReconciliationReceiptModal, ShiftSummaryData } from './ShiftReconciliationReceiptModal';

interface ShiftRecord {
  id: string;
  receptionistId: string;
  receptionistName: string;
  openedAt: string;
  closedAt?: string;
  expectedCash: number;
  actualCash?: number;
  cardAmount: number;
  transferAmount: number;
  discrepancy?: number;
  status: 'OPEN' | 'CLOSED';
  transactionCount: number;
  closureNotes?: string;
}

export const DailyShiftSettlementPage: React.FC = () => {
  const { user, role, hasAuthority } = useAuth();
  const { t, isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();

  const isClinicAdmin = role === 'CLINIC_ADMIN' || role === 'SUPER_ADMIN';

  // Active shift state for current cashier/receptionist
  const [activeShift, setActiveShift] = useState<ShiftRecord>({
    id: 'shift-current-8942',
    receptionistId: user?.id || 'rec-1',
    receptionistName: user?.fullName || 'Emily Watson',
    openedAt: '2026-10-16 08:00 AM',
    expectedCash: 385.0,
    cardAmount: 890.0,
    transferAmount: 140.0,
    status: 'OPEN',
    transactionCount: 9
  });

  // Calculate elapsed time
  const [elapsedDuration, setElapsedDuration] = useState('6h 35m');

  // Closing modal state
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [actualCashInput, setActualCashInput] = useState('385.00');
  const [closureNotes, setClosureNotes] = useState('Shift drawer counted at end of afternoon shift.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Summary print report modal state
  const [printSummary, setPrintSummary] = useState<ShiftSummaryData | null>(null);

  // Historical audit shifts
  const [historicalShifts, setHistoricalShifts] = useState<ShiftRecord[]>([
    {
      id: 'shift-prev-101',
      receptionistId: 'rec-1',
      receptionistName: 'Emily Watson',
      openedAt: '2026-10-15 08:00 AM',
      closedAt: '2026-10-15 05:00 PM',
      expectedCash: 520.0,
      actualCash: 520.0,
      discrepancy: 0.0,
      cardAmount: 1140.0,
      transferAmount: 0.0,
      status: 'CLOSED',
      transactionCount: 14,
      closureNotes: 'Even drawer. Perfect reconciliation.'
    },
    {
      id: 'shift-prev-102',
      receptionistId: 'rec-2',
      receptionistName: 'Marcus Vance',
      openedAt: '2026-10-14 08:00 AM',
      closedAt: '2026-10-14 05:15 PM',
      expectedCash: 410.0,
      actualCash: 405.0,
      discrepancy: -5.0,
      cardAmount: 980.0,
      transferAmount: 50.0,
      status: 'CLOSED',
      transactionCount: 11,
      closureNotes: 'Discrepancy: Short $5 due to change shortage in morning.'
    },
    {
      id: 'shift-prev-103',
      receptionistId: 'rec-3',
      receptionistName: 'Sophia Miller',
      openedAt: '2026-10-13 08:30 AM',
      closedAt: '2026-10-13 04:45 PM',
      expectedCash: 640.0,
      actualCash: 650.0,
      discrepancy: 10.0,
      cardAmount: 1350.0,
      transferAmount: 0.0,
      status: 'CLOSED',
      transactionCount: 18,
      closureNotes: 'Surplus of $10 recorded.'
    }
  ]);

  // Real-time discrepancy calculation
  const parsedActualCash = parseFloat(actualCashInput) || 0;
  const currentDiscrepancy = parsedActualCash - activeShift.expectedCash;

  // Handle closing shift
  const handleExecuteCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate backend endpoint call to /api/billing/shifts/close
      const now = new Date();
      const closedRecord: ShiftRecord = {
        ...activeShift,
        closedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actualCash: parsedActualCash,
        discrepancy: currentDiscrepancy,
        status: 'CLOSED',
        closureNotes
      };

      setTimeout(() => {
        setIsSubmitting(false);
        setActiveShift(closedRecord);
        setHistoricalShifts((prev) => [closedRecord, ...prev]);
        setIsCloseModalOpen(false);

        // Prepare print summary
        const summaryData: ShiftSummaryData = {
          shiftId: closedRecord.id,
          receptionistName: closedRecord.receptionistName,
          openedAt: closedRecord.openedAt,
          closedAt: closedRecord.closedAt || now.toLocaleString(),
          elapsedHours: elapsedDuration,
          expectedCash: closedRecord.expectedCash,
          actualCash: parsedActualCash,
          discrepancy: currentDiscrepancy,
          cardAmount: closedRecord.cardAmount,
          transferAmount: closedRecord.transferAmount,
          totalRevenue: closedRecord.expectedCash + closedRecord.cardAmount + closedRecord.transferAmount,
          transactionCount: closedRecord.transactionCount,
          notes: closureNotes
        };

        setPrintSummary(summaryData);

        addToast({
          type: 'success',
          title: 'Shift Closed & Reconciled',
          message: `Closed register shift. Discrepancy: ${currentDiscrepancy >= 0 ? '+' : ''}$${currentDiscrepancy.toFixed(2)}. Generating audit report.`
        });
      }, 400);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              {isRtl ? 'تسوية وردية الاستقبال والصندوق اليومي' : 'Receptionist Shift Settlement & Cash Register'}
            </h1>
            <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border ${
              activeShift.status === 'OPEN'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {activeShift.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cashier drawer auditing, expected cash calculation, and shift discrepancy reconciliation.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {activeShift.status === 'OPEN' ? (
            <button
              onClick={() => setIsCloseModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إقفال الوردية وتسوية الصندوق' : 'Reconcile & Close Shift'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (activeShift.closedAt) {
                  setPrintSummary({
                    shiftId: activeShift.id,
                    receptionistName: activeShift.receptionistName,
                    openedAt: activeShift.openedAt,
                    closedAt: activeShift.closedAt,
                    elapsedHours: elapsedDuration,
                    expectedCash: activeShift.expectedCash,
                    actualCash: activeShift.actualCash || activeShift.expectedCash,
                    discrepancy: activeShift.discrepancy || 0,
                    cardAmount: activeShift.cardAmount,
                    transferAmount: activeShift.transferAmount,
                    totalRevenue: activeShift.expectedCash + activeShift.cardAmount + activeShift.transferAmount,
                    transactionCount: activeShift.transactionCount,
                    notes: activeShift.closureNotes
                  });
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print Shift Reconciliation</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* REAL-TIME ACTIVE SHIFT COUNTERS (3 TILES)                      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tile 1: Shift Start Time & Elapsed Hours */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {isRtl ? 'وقت فتح الوردية والمدة' : 'Shift Start & Elapsed'}
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
              {elapsedDuration}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Started at {activeShift.openedAt}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Tile 2: Expected Cash in Drawer */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {isRtl ? 'النقد المتوقع في الدرج' : 'Expected Cash in Drawer'}
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              ${activeShift.expectedCash.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              From cash collections this session
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        {/* Tile 3: Total Card / Digital Transactions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {isRtl ? 'المدفوعات الإلكترونية والبطاقات' : 'Card & Digital Volume'}
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              ${(activeShift.cardAmount + activeShift.transferAmount).toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              POS Card: ${activeShift.cardAmount.toFixed(0)} · Bank: ${activeShift.transferAmount.toFixed(0)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Shift Details Banner */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Current Cashier Session Ledger: {activeShift.receptionistName}
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Session ID: <span className="text-slate-200">{activeShift.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Total Transactions</span>
            <span className="text-base font-bold text-slate-100">{activeShift.transactionCount}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Cash Collections</span>
            <span className="text-base font-bold text-emerald-400">${activeShift.expectedCash.toFixed(2)}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Card POS Collections</span>
            <span className="text-base font-bold text-cyan-400">${activeShift.cardAmount.toFixed(2)}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Total Net Revenue</span>
            <span className="text-base font-bold text-emerald-300">
              ${(activeShift.expectedCash + activeShift.cardAmount + activeShift.transferAmount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* HISTORICAL AUDIT VIEW (FOR CLINIC_ADMIN / SUPER_ADMIN ONLY)     */}
      {/* ============================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                {isRtl ? 'سجل التدقيق التاريخي للورديات (خاص بمدير العيادة)' : 'Historical Shift Settlement Audit Ledger'}
              </h2>
              <p className="text-[10px] text-slate-400">
                Audited cashier shift settlements with discrepancy verification and supervisor sign-offs.
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-950 text-purple-300 border border-purple-800">
            CLINIC_ADMIN AUDIT
          </span>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-start">
                <th className="py-3 px-4 font-semibold text-start">Shift Date / ID</th>
                <th className="py-3 px-4 font-semibold text-start">Cashier / Receptionist</th>
                <th className="py-3 px-4 font-semibold text-start">Expected Cash</th>
                <th className="py-3 px-4 font-semibold text-start">Actual Cash</th>
                <th className="py-3 px-4 font-semibold text-start">Discrepancy</th>
                <th className="py-3 px-4 font-semibold text-start">Card / Non-Cash</th>
                <th className="py-3 px-4 font-semibold text-start">Status & Notes</th>
                <th className="py-3 px-4 font-semibold text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {historicalShifts.map((shift) => {
                const disc = shift.discrepancy ?? 0;
                const isExact = disc === 0;
                const isSurplus = disc > 0;

                return (
                  <tr key={shift.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-200">{shift.openedAt.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-500">{shift.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{shift.receptionistName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{shift.transactionCount} payments</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      ${shift.expectedCash.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-100">
                      ${shift.actualCash !== undefined ? shift.actualCash.toFixed(2) : '--'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                          isExact
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : isSurplus
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}
                      >
                        {isExact ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>$0.00 Exact</span>
                          </>
                        ) : isSurplus ? (
                          <>
                            <span>+${disc.toFixed(2)} Surplus</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            <span>-${Math.abs(disc).toFixed(2)} Deficit</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">
                      ${(shift.cardAmount + shift.transferAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                      {shift.closureNotes || 'Standard shift closure'}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <button
                        onClick={() => {
                          setPrintSummary({
                            shiftId: shift.id,
                            receptionistName: shift.receptionistName,
                            openedAt: shift.openedAt,
                            closedAt: shift.closedAt || '17:00 PM',
                            elapsedHours: '8h 00m',
                            expectedCash: shift.expectedCash,
                            actualCash: shift.actualCash || shift.expectedCash,
                            discrepancy: shift.discrepancy || 0,
                            cardAmount: shift.cardAmount,
                            transferAmount: shift.transferAmount,
                            totalRevenue: shift.expectedCash + shift.cardAmount + shift.transferAmount,
                            transactionCount: shift.transactionCount,
                            notes: shift.closureNotes
                          });
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Print reconciliation report"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SHIFT CLOSING FORM MODAL                                       */}
      {/* ============================================================== */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-950 border border-amber-800 text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {isRtl ? 'تسوية وإقفال الوردية الحالية' : 'End of Shift Drawer Reconciliation'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Enter physical cash counted in drawer to compute discrepancy.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteCloseShift} className="space-y-4">
              {/* Expected vs Actual Grid */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">System Expected Cash:</span>
                  <span className="font-mono font-bold text-emerald-400">${activeShift.expectedCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Electronic & POS Cards:</span>
                  <span className="font-mono font-bold text-cyan-400">${activeShift.cardAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Input: Actual Counted Cash */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {isRtl ? 'النقد الفعلي المعدود في الدرج *' : 'Actual Physical Cash Counted in Drawer *'}
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute start-3 top-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={actualCashInput}
                    onChange={(e) => setActualCashInput(e.target.value)}
                    className="w-full ps-9 pe-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Real-time Discrepancy Indicator */}
              <div className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
                currentDiscrepancy === 0
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : currentDiscrepancy > 0
                  ? 'bg-blue-950/40 border-blue-800 text-blue-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                <span>Discrepancy (Actual - Expected):</span>
                <span className="font-bold text-sm">
                  {currentDiscrepancy > 0 ? `+$${currentDiscrepancy.toFixed(2)} (Surplus)` : `$${currentDiscrepancy.toFixed(2)} ${currentDiscrepancy === 0 ? '(Exact)' : '(Short)'}`}
                </span>
              </div>

              {/* Closure Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Drawer Reconciliation Notes
                </label>
                <textarea
                  rows={2}
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="Explain any discrepancy or mention safe drop..."
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm & Print Reconciliation Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconciliation Printable Report Modal */}
      {printSummary && (
        <ShiftReconciliationReceiptModal
          isOpen={true}
          onClose={() => setPrintSummary(null)}
          summary={printSummary}
        />
      )}
    </div>
  );
};

export default DailyShiftSettlementPage;
