// ADMIN_TABS/DROPSHIPPER_TAB/statusBadges.jsx

export function accountStatusBadge(status) {
  const map = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    expired: { color: 'bg-amber-100 text-amber-800', label: 'Expired' },
    pending_otp: { color: 'bg-blue-100 text-blue-800', label: 'Pending OTP' },
    pending_admin: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending admin' },
    pending_payment: { color: 'bg-orange-100 text-orange-800', label: 'Pending payment' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    suspended: { color: 'bg-gray-200 text-gray-700', label: 'Suspended' },
  };
  return map[status] || { color: 'bg-gray-100 text-gray-600', label: status || '—' };
}

export function requestAdminStatusBadge(status) {
  const map = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  };
  return map[status] || { color: 'bg-gray-100 text-gray-600', label: status || '—' };
}

export function paymentStatusBadge(status) {
  const map = {
    created: { color: 'bg-gray-100 text-gray-700', label: 'Created' },
    paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
    failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
  };
  return map[status] || { color: 'bg-gray-100 text-gray-600', label: status || '—' };
}

export function formatInr(n) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function StatusPill({ status, kind = 'account' }) {
  const badge =
    kind === 'request'
      ? requestAdminStatusBadge(status)
      : kind === 'payment'
        ? paymentStatusBadge(status)
        : accountStatusBadge(status);
  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.color}`}
    >
      {badge.label}
    </span>
  );
}
