import React from 'react';
import { Printer, X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';

export interface ShiftSummaryData {
  shiftId: string;
  receptionistName: string;
  openedAt: string;
  closedAt: string;
  elapsedHours: string;
  expectedCash: number;
  actualCash: number;
  discrepancy: number;
  cardAmount: number;
  transferAmount: number;
  totalRevenue: number;
  transactionCount: number;
  notes?: string;
}

interface ShiftReconciliationReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ShiftSummaryData;
}

export const ShiftReconciliationReceiptModal: React.FC<ShiftReconciliationReceiptModalProps> = ({
  isOpen,
  onClose,
  summary
}) => {
  const { isRtl } = useLanguageSwitcher();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isBalanced = summary.discrepancy === 0;
  const isSurplus = summary.discrepancy > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                {isRtl ? 'تقرير إقفال ومطابقة الوردية اليومية' : 'Daily Shift Reconciliation Summary Report'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Official cashier register audit slip and closure settlement.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Audit Report</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 print:p-0 print:bg-white print:text-black">
          <div className="max-w-md mx-auto bg-white text-slate-950 p-6 rounded-lg shadow border border-slate-300 font-mono text-xs space-y-4 print:border-none print:shadow-none">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-3">
              <h2 className="font-black text-sm uppercase tracking-tight">
                Metro Health Medical Center
              </h2>
              <div className="text-[10px] text-slate-700 font-bold uppercase">
                Cashier Daily Register Shift Settlement Report
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                Terminal ID: REG-01 · Session ID: {summary.shiftId}
              </div>
            </div>

            {/* Shift Metadata */}
            <div className="space-y-1 text-[11px] border-b border-slate-200 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Cashier / Receptionist:</span>
                <span className="font-bold">{summary.receptionistName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shift Started:</span>
                <span>{summary.openedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shift Closed:</span>
                <span>{summary.closedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span>{summary.elapsedHours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Transactions:</span>
                <span>{summary.transactionCount}</span>
              </div>
            </div>

            {/* Financial Ledger Section */}
            <div className="space-y-1.5 border-b border-slate-200 pb-3">
              <div className="text-[10px] uppercase font-bold text-slate-600">
                1. Cash Drawer Audit
              </div>
              <div className="flex justify-between text-[11px]">
                <span>System Expected Cash:</span>
                <span className="font-bold">${summary.expectedCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Actual Counted Cash:</span>
                <span className="font-bold">${summary.actualCash.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between text-[11px] font-bold p-1 rounded ${
                isBalanced 
                  ? 'bg-emerald-50 text-emerald-800' 
                  : isSurplus 
                  ? 'bg-blue-50 text-blue-800' 
                  : 'bg-rose-50 text-rose-800'
              }`}>
                <span>Cash Discrepancy:</span>
                <span>
                  {summary.discrepancy > 0 ? `+$${summary.discrepancy.toFixed(2)} (Surplus)` : `$${summary.discrepancy.toFixed(2)} ${isBalanced ? '(Exact Match)' : '(Deficit)'}`}
                </span>
              </div>
            </div>

            {/* Digital & Non-Cash Breakdown */}
            <div className="space-y-1 border-b border-slate-200 pb-3 text-[11px]">
              <div className="text-[10px] uppercase font-bold text-slate-600">
                2. Electronic & Non-Cash Totals
              </div>
              <div className="flex justify-between">
                <span>Card (POS Terminal):</span>
                <span>${summary.cardAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bank Transfer:</span>
                <span>${summary.transferAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-300 pt-1 text-slate-900">
                <span>Total Net Collected:</span>
                <span>${summary.totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Notes */}
            {summary.notes && (
              <div className="text-[10px] text-slate-600 border-b border-slate-200 pb-2">
                <span className="font-bold">Closure Notes:</span> {summary.notes}
              </div>
            )}

            {/* Signature Blocks */}
            <div className="pt-6 grid grid-cols-2 gap-4 text-[9px]">
              <div className="text-center">
                <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
                <div className="font-bold uppercase">Cashier Signature</div>
                <div className="text-slate-500">{summary.receptionistName}</div>
              </div>
              <div className="text-center">
                <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
                <div className="font-bold uppercase">Supervisor Sign-Off</div>
                <div className="text-slate-500">Clinic Admin Audit</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftReconciliationReceiptModal;
