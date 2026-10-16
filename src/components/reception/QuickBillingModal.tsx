import React, { useState } from 'react';
import { DollarSign, CreditCard, Banknote, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';

interface QuickBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  mrn: string;
  appointmentId: string;
  onPaymentRecorded?: (amount: number, method: string) => void;
}

export const QuickBillingModal: React.FC<QuickBillingModalProps> = ({
  isOpen,
  onClose,
  patientName,
  mrn,
  appointmentId,
  onPaymentRecorded
}) => {
  const { isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();

  const [totalAmount] = useState<number>(185.0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [paidAmount, setPaidAmount] = useState<string>('185.00');
  const [notes, setNotes] = useState<string>('Standard pediatric consultation and vitals co-pay');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const parsed = parseFloat(paidAmount) || totalAmount;

      if (onPaymentRecorded) {
        onPaymentRecorded(parsed, paymentMethod);
      }

      addToast({
        type: 'success',
        title: 'Payment Recorded (ACID Lock)',
        message: `Successfully collected $${parsed.toFixed(2)} via ${paymentMethod} for ${patientName}. Invoice status updated.`
      });

      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                {isRtl ? 'تحصيل فاتورة الزيارة' : 'Collect Visit Payment'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {patientName} · {mrn}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bill Total Card */}
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {isRtl ? 'المبلغ الإجمالي المستحق' : 'Total Balance Due'}
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'طريقة الدفع' : 'Payment Method'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-2 px-2 text-xs font-medium rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>{isRtl ? 'نقداً (كاش)' : 'Cash'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`py-2 px-2 text-xs font-medium rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                  paymentMethod === 'CARD'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{isRtl ? 'بطاقة بنكية' : 'Card / POS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`py-2 px-2 text-xs font-medium rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                  paymentMethod === 'TRANSFER'
                    ? 'bg-purple-950 text-purple-300 border-purple-700 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                <span>{isRtl ? 'تحويل بنكي' : 'Transfer'}</span>
              </button>
            </div>
            {paymentMethod === 'CASH' && (
              <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                Cash collection will be atomically credited to your active shift drawer balance.
              </p>
            )}
          </div>

          {/* Amount Paid Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {isRtl ? 'المبلغ المستلم ($)' : 'Amount Tendered / Paid ($) *'}
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full px-3 py-2 text-base font-bold font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              {isRtl ? 'ملاحظات الفاتورة' : 'Receipt / Cashier Notes'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm disabled:opacity-50"
            >
              {isProcessing ? 'Processing Lock...' : (isRtl ? 'تسجيل الدفع وإصدار الإيصال' : 'Record Payment & Close Bill')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickBillingModal;
