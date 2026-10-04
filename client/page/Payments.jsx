import React, { useState } from 'react';
import { Wallet, AlertTriangle, CheckCircle2, Clock, MapPin, Store, CalendarDays, Loader2 } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import DashboardCard from '../component/DashboardCard';
import FilterDropdown from '../component/FilterDropdown';
import Button from '../component/Button';

const GRACE_DAYS = 3;

function formatDate(value) {
  if (!value) return '';
  const d = new Date(String(value).replace(' ', 'T'));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTaka(amount) {
  return `৳${Number(amount || 0).toLocaleString()}`;
}

// Days from now until (or since) a due date — negative once it's overdue.
function daysUntil(value) {
  if (!value) return 0;
  const due = new Date(String(value).replace(' ', 'T'));
  return Math.ceil((due - new Date()) / 86400000);
}

// Settles the remaining 90% owed on venue bookings and vendor hires once an
// event has finished. The list itself is derived server-side from paid
// deposits on completed events (see balancePayments.controller.js), so
// there's nothing to "add" here — a balance appears on its own the moment
// its event ends, and disappears once paid.
export default function Payments() {
  const {
    outstandingPayments,
    outstandingPaymentsLoading,
    initiateBalancePayment,
    authToken,
    realUser
  } = useEventFlow();

  const [statusFilter, setStatusFilter] = useState('All');
  const [payingId, setPayingId] = useState(null);
  const [payError, setPayError] = useState('');

  const isRealOrganizer = !!(authToken && realUser?.role === 'organizer');

  const filtered = outstandingPayments.filter((p) => {
    if (statusFilter === 'Overdue') return p.isOverdue;
    if (statusFilter === 'Due Soon') return !p.isOverdue;
    return true;
  });

  const totalOutstanding = outstandingPayments.reduce((sum, p) => sum + p.balanceAmount, 0);
  const overdueItems = outstandingPayments.filter((p) => p.isOverdue);
  const overdueTotal = overdueItems.reduce((sum, p) => sum + p.balanceAmount, 0);

  const handlePay = async (payment) => {
    const key = `${payment.bookingType}-${payment.sourceBookingId}`;
    setPayError('');
    setPayingId(key);
    try {
      const { GatewayPageURL } = await initiateBalancePayment(payment.bookingType, payment.sourceBookingId);
      window.location.href = GatewayPageURL;
    } catch (err) {
      setPayError(err.message || 'Could not start the payment session.');
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">Payments</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Final balances owed on your venues and vendors — due within {GRACE_DAYS} days of an event finishing
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <DashboardCard
          id="card-total-outstanding"
          title="Total Outstanding"
          value={formatTaka(totalOutstanding)}
          subtitle={`${outstandingPayments.length} balance${outstandingPayments.length === 1 ? '' : 's'} to settle`}
          icon={Wallet}
          iconBg="bg-blue-50"
          iconColor="text-[#1B3A5C]"
        />
        <DashboardCard
          id="card-overdue-outstanding"
          title="Overdue"
          value={formatTaka(overdueTotal)}
          subtitle={`${overdueItems.length} past the ${GRACE_DAYS}-day window`}
          icon={AlertTriangle}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          badge={overdueItems.length > 0 ? 'Admin Notified' : undefined}
          badgeType="gold"
        />
        <DashboardCard
          id="card-due-soon-outstanding"
          title="Within Window"
          value={(outstandingPayments.length - overdueItems.length).toString()}
          subtitle="Still inside the grace period"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-800"
        />
      </div>

      {/* How it works */}
      <div className="p-4 bg-sky-50 rounded-xl border border-sky-200/70 flex items-start gap-3 text-xs text-[#1B3A5C]">
        <Wallet className="w-4 h-4 text-[#1B3A5C] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>How settlement works:</strong> booking a venue or hiring a vendor charges a 10% confirmation
          deposit up front. The remaining 90% lands here once the event finishes, and must be paid within{' '}
          {GRACE_DAYS} days. After that the balance is flagged to the EventFlow admin team automatically.
        </p>
      </div>

      {payError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
          {payError}
        </div>
      )}

      {/* Filter */}
      {outstandingPayments.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={['All', 'Overdue', 'Due Soon']}
            id="filter-payment-status"
          />
          <span className="text-xs font-semibold text-slate-500">
            Showing {filtered.length} of {outstandingPayments.length}
          </span>
        </div>
      )}

      {/* List */}
      {!isRealOrganizer ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Sign in to see your balances</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Payments are tied to a real organizer account — there's nothing owed in demo mode.
          </p>
        </div>
      ) : outstandingPaymentsLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Loader2 className="w-6 h-6 text-[#1B3A5C] animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">
            {outstandingPayments.length === 0 ? 'Nothing outstanding' : 'Nothing matches this filter'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {outstandingPayments.length === 0
              ? 'Final balances show up here once an event finishes. You\'re all settled for now.'
              : 'Try switching the status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const key = `${p.bookingType}-${p.sourceBookingId}`;
            const TypeIcon = p.bookingType === 'venue' ? MapPin : Store;
            const days = daysUntil(p.dueDate);

            return (
              <div
                key={key}
                id={`payment-row-${key}`}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  p.isOverdue ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      <TypeIcon className="w-3 h-3" />
                      {p.bookingType}
                    </span>
                    {p.isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Overdue by {Math.abs(days)} day{Math.abs(days) === 1 ? '' : 's'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Due in {Math.max(days, 0)} day{days === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  <h4 className="mt-2 text-base font-bold text-[#1B3A5C] leading-snug truncate">
                    {p.payeeName}
                  </h4>

                  <div className="mt-1.5 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-[#D4A537] shrink-0" />
                      <span>
                        Event: <strong className="text-slate-800 font-semibold">{p.eventTitle}</strong>
                        {' '}&bull; ended {formatDate(p.endDatetime)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Contract {formatTaka(p.totalAmount)} &bull; deposit paid {formatTaka(p.depositPaid)} &bull; due by{' '}
                      <strong className={p.isOverdue ? 'text-rose-600' : 'text-slate-700'}>{formatDate(p.dueDate)}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Balance Due</p>
                    <p className="text-xl font-extrabold text-[#1B3A5C] tracking-tight">
                      {formatTaka(p.balanceAmount)}
                    </p>
                  </div>
                  <Button
                    variant={p.isOverdue ? 'danger' : 'primary'}
                    icon={Wallet}
                    disabled={payingId !== null}
                    onClick={() => handlePay(p)}
                    id={`btn-pay-balance-${key}`}
                  >
                    {payingId === key ? 'Redirecting...' : 'Pay Balance'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
