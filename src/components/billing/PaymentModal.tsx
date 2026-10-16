import React, { useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Printer, 
  Receipt, 
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export interface FeeItem {
  id: string;
  description: string;
  category: 'CONSULTATION' | 'PROCEDURE' | 'LAB' | 'MEDICATION';
  amount: number;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  mrn: string;
  appointmentId: string;
  initialFees?: FeeItem[];
  previousPaid?: number;
  onPaymentRecorded?: (amount: number, method: 'CASH' | 'CARD' | 'TRANSFER', remainingBalance: number) => void;
}

const DEFAULT_FEES: FeeItem[] = [
  { id: 'fee-1', description: 'Specialist Physician Consultation', category: 'CONSULTATION', amount: 120.0 },
  { id: 'fee-2', description: 'Diagnostic Otoscopy & HEENT Assessment', category: 'PROCEDURE', amount: 45.0 },
  { id: 'fee-3', description: 'Clinical Supplies & Rapid Triage Test', category: 'LAB', amount: 20.0 }
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  patientName,
  mrn,
  appointmentId,
  initialFees = DEFAULT_FEES,
  previousPaid = 0,
  onPaymentRecorded
}) => {
  const { isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [fees] = useState<FeeItem[]>(initialFees);
  const totalAmount = fees.reduce((sum, item) => sum + item.amount, 0);
  const balanceDue = Math.max(0, totalAmount - previousPaid);

  const [paymentAmount, setPaymentAmount] = useState<string>(balanceDue.toFixed(2));
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [notes, setNotes] = useState<string>('Standard visit settlement and co-pay');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState<boolean>(false);
  const [lastPaymentRecord, setLastPaymentRecord] = useState<any>(null);

  if (!isOpen) return null;

  const parsedPayment = Math.min(balanceDue, Math.max(0, parseFloat(paymentAmount) || 0));
  const newRemainingBalance = Math.max(0, balanceDue - parsedPayment);

  const handleProcessPayment = (andPrintReceipt: boolean = false) => {
    if (parsedPayment <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Payment Amount',
        message: 'Payment amount must be greater than $0.00.'
      });
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const record = {
        invoiceNumber: `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        receiptNumber: `RCP-${Math.floor(10000 + Math.random() * 90000)}`,
        amount: parsedPayment,
        paymentMethod,
        remainingBalance: newRemainingBalance,
        totalAmount,
        paidAt: new Date().toLocaleString(),
        cashier: user?.fullName || 'Reception Cashier',
        notes
      };

      setLastPaymentRecord(record);

      if (onPaymentRecorded) {
        onPaymentRecorded(parsedPayment, paymentMethod, newRemainingBalance);
      }

      addToast({
        type: 'success',
        title: 'Payment Collected (ACID Locked)',
        message: `Collected $${parsedPayment.toFixed(2)} via ${paymentMethod} for ${patientName}.`
      });

      if (andPrintReceipt) {
        setShowReceiptPreview(true);
      } else {
        onClose();
      }
    }, 350);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* MODAL HEADER                                                   */}
        {/* ============================================================== */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {isRtl ? 'تسجيل وسداد فاتورة الزيارة' : 'Invoice Payment & Cashier Checkout'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {patientName} · {mrn}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* RECEIPT PREVIEW (IF PRINT SELECTED)                            */}
        {/* ============================================================== */}
        {showReceiptPreview && lastPaymentRecord ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950">
            {/* Printable Thermal Receipt Card */}
            <div className="max-w-sm mx-auto bg-white text-slate-950 p-6 rounded-lg shadow-lg border border-slate-300 font-mono text-xs space-y-3 print:border-none print:shadow-none">
              <div className="text-center border-b border-dashed border-slate-400 pb-3">
                <div className="font-bold text-sm uppercase">Metro Health Medical Center</div>
                <div className="text-[10px] text-slate-600">Ambulatory Clinic & Cashier Register</div>
                <div className="text-[9px] text-slate-500">Tel: +1 (555) 019-2000 · Tax ID: 84-910284</div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt No:</span>
                  <span className="font-bold">{lastPaymentRecord.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span>{lastPaymentRecord.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{lastPaymentRecord.paidAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold">{patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MRN:</span>
                  <span>{mrn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cashier:</span>
                  <span>{lastPaymentRecord.cashier}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-400 py-2 space-y-1 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>Total Bill Amount:</span>
                  <span>${lastPaymentRecord.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Amount Paid ({lastPaymentRecord.paymentMethod}):</span>
                  <span>${lastPaymentRecord.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Remaining Balance:</span>
                  <span>${lastPaymentRecord.remainingBalance.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-2 space-y-0.5">
                <div>Thank you for choosing Metro Health.</div>
                <div>Keep receipt for insurance reimbursement.</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Thermal Receipt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* PAYMENT ENTRY & LEDGER BREAKDOWN                               */
          /* ============================================================== */
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* 1. Visit Fees Itemized Breakdown */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-800 pb-1.5">
                <span>{isRtl ? 'تفاصيل رسوم الزيارة' : 'Itemized Visit Fees'}</span>
                <span>{isRtl ? 'المبلغ' : 'Amount'}</span>
              </div>
              <div className="space-y-1.5">
                {fees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{fee.description}</span>
                    <span className="font-mono text-slate-100 font-semibold">${fee.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Total Invoice:</span>
                <span className="font-mono text-slate-100">${totalAmount.toFixed(2)}</span>
              </div>
              {previousPaid > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span>Previously Paid:</span>
                  <span className="font-mono">-${previousPaid.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* 2. Outstanding Balance Due Banner */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-400 uppercase font-mono block">
                  {isRtl ? 'المتبقي المستحق' : 'Remaining Balance Due'}
                </span>
                <span className="text-xl font-bold font-mono text-emerald-300">
                  ${balanceDue.toFixed(2)}
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                {balanceDue === 0 ? 'PAID IN FULL' : 'PAYMENT DUE'}
              </span>
            </div>

            {/* 3. Payment Collector Form */}
            <div className="space-y-3.5">
              {/* Amount to Collect Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'المبلغ المراد تحصيله الآن *' : 'Amount to Collect Now *'}
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute start-3 top-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={balanceDue}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full ps-9 pe-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                {parsedPayment < balanceDue && (
                  <p className="text-[11px] text-amber-400 mt-1 font-mono">
                    Partial payment. Remaining balance after collection: ${newRemainingBalance.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Payment Method Selector (CASH, CARD, TRANSFER) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isRtl ? 'طريقة الدفع' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'CASH'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>CASH 💵</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'CARD'
                        ? 'bg-cyan-950 border-cyan-600 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>CARD 💳</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('TRANSFER')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'TRANSFER'
                        ? 'bg-purple-950 border-purple-600 text-purple-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>TRANSFER 🏦</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Payment Reference / Audit Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Card auth code #89012 or standard cash receipt"
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleProcessPayment(false)}
                disabled={isProcessing}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Collect Only
              </button>
              <button
                type="button"
                onClick={() => handleProcessPayment(true)}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Collect & Print Receipt 🖨️</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
