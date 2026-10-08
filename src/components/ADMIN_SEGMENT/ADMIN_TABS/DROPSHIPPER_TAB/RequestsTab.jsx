// ADMIN_TABS/DROPSHIPPER_TAB/RequestsTab.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  ExternalLink,
  FileText,
  MapPin,
  Store,
  X,
} from 'lucide-react';
import {
  listDropshipperRequests,
  approveDropshipperRequest,
  rejectDropshipperRequest,
} from '../../../../SERVICES/adminDropshipperApi';
import { selectAdminUser } from '../../ADMIN_REDUX_MANAGEMENT/adminAuthSlice';
import { ROLES } from '../../roles';
import { StatusPill, formatInr, formatDate } from './statusBadges.jsx';

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-0.5">
        {label}
      </p>
      <div className="text-sm text-gray-900 break-words">{children ?? '—'}</div>
    </div>
  );
}

function ProofLink({ href, label }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 text-sm font-medium hover:bg-teal-100 hover:border-teal-300 transition-colors"
    >
      <FileText size={14} />
      {label}
      <ExternalLink size={12} className="opacity-70" />
    </a>
  );
}

const ADMIN_STATUS_OPTIONS = [
  { value: 'all', label: 'All admin status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const KIND_OPTIONS = [
  { value: 'all', label: 'All kinds' },
  { value: 'registration', label: 'Registration' },
  { value: 'renewal', label: 'Renewal' },
];

const RequestsTab = () => {
  const adminUser = useSelector(selectAdminUser);
  const canDecide = adminUser?.role === ROLES.ADMIN;

  const [page, setPage] = useState(1);
  const [adminStatus, setAdminStatus] = useState('pending');
  const [kind, setKind] = useState('all');
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listDropshipperRequests({
        page,
        limit: 15,
        adminStatus: adminStatus === 'all' ? undefined : adminStatus,
        kind: kind === 'all' ? undefined : kind,
        q: q || undefined,
      });
      setRows(data?.requests || []);
      setTotalPages(data?.totalPages || 1);
      setTotal(data?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load requests');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, adminStatus, kind, q]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async () => {
    if (!selected?.id || !canDecide) return;
    setActing(true);
    try {
      const data = await approveDropshipperRequest(selected.id, { note: note.trim() || undefined });
      toast.success(data?.message || 'Approved');
      setSelected(null);
      setNote('');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Approve failed');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!selected?.id || !canDecide) return;
    if (!note.trim()) {
      toast.error('Rejection note is required');
      return;
    }
    setActing(true);
    try {
      const data = await rejectDropshipperRequest(selected.id, { note: note.trim() });
      toast.success(data?.message || 'Rejected');
      setSelected(null);
      setNote('');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reject failed');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Registration & renew requests</h2>
          <p className="text-sm text-gray-500">{total} matching</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={adminStatus}
            onChange={(e) => {
              setPage(1);
              setAdminStatus(e.target.value);
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {ADMIN_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={kind}
            onChange={(e) => {
              setPage(1);
              setKind(e.target.value);
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setQ(searchInput.trim());
            }}
          >
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, email, phone, payment id"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[220px]"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
            >
              Search
            </button>
          </form>
          <button
            type="button"
            onClick={load}
            className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kind</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{row.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {row.email} · {row.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-gray-700">{row.kind}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusPill status={row.payment?.status} kind="payment" />
                        <span className="text-xs text-gray-500">
                          {formatInr(row.amountPaidInr || row.amountDueInr)} /{' '}
                          {formatInr(row.amountDueInr)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.adminStatus} kind="request" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(row);
                          setNote('');
                        }}
                        className="text-teal-700 hover:text-teal-900 text-sm font-medium"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={() => !acting && setSelected(null)}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-white">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 mb-1">
                  Request review
                </p>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {selected.fullName || 'Applicant'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium capitalize">
                    {selected.kind || 'registration'}
                  </span>
                  <StatusPill status={selected.payment?.status} kind="payment" />
                  <StatusPill status={selected.adminStatus} kind="request" />
                </div>
              </div>
              <button
                type="button"
                disabled={acting}
                onClick={() => setSelected(null)}
                className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Applicant + payment */}
              <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <Field label="Email">{selected.email || '—'}</Field>
                  <Field label="Phone">{selected.phone || '—'}</Field>
                  <Field label="WhatsApp">{selected.whatsappNumber || '—'}</Field>
                  <Field label="Plan">{selected.planYears || 1} year</Field>
                  <Field label="Amount due">{formatInr(selected.amountDueInr)}</Field>
                  <Field label="Amount paid">{formatInr(selected.amountPaidInr)}</Field>
                  <Field label="Submitted">{formatDate(selected.createdAt)}</Field>
                  {selected.payment?.razorpayPaymentId ? (
                    <Field label="Payment ID">
                      <span className="font-mono text-xs text-gray-700">
                        {selected.payment.razorpayPaymentId}
                      </span>
                    </Field>
                  ) : null}
                </div>
              </section>

              {selected.application ? (
                <section className="rounded-xl border border-gray-200 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Store size={15} className="text-teal-600" />
                    <h4 className="text-sm font-semibold text-gray-900">Business details</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    <Field label="Have shop">
                      {selected.application.haveShop ? 'Yes' : 'No'}
                    </Field>
                    <Field label="Category">
                      {selected.application.productCategory || '—'}
                    </Field>
                    <Field label="Selling from">
                      {selected.application.sellingPlaceFrom || '—'}
                    </Field>
                    <Field label="Zone / city">
                      {selected.application.sellingZoneCity || '—'}
                    </Field>
                    <Field label="Monthly estimate" className="sm:col-span-2">
                      {selected.application.monthlyEstimatedPurchase != null
                        ? formatInr(selected.application.monthlyEstimatedPurchase)
                        : '—'}
                    </Field>
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <MapPin size={12} />
                      Addresses
                    </div>
                    <Field label="Permanent">{selected.application.permanentAddress || '—'}</Field>
                    <Field label="Business">{selected.application.businessAddress || '—'}</Field>
                    <Field label="Delivery">{selected.application.deliveryAddress || '—'}</Field>
                  </div>

                  {(selected.application.idProofUrl ||
                    selected.application.businessAddressProofUrl) && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-2">
                        Documents
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <ProofLink
                          href={selected.application.idProofUrl}
                          label="ID proof"
                        />
                        <ProofLink
                          href={selected.application.businessAddressProofUrl}
                          label="Business address proof"
                        />
                      </div>
                    </div>
                  )}
                </section>
              ) : null}

              {selected.kind === 'renewal' ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  Renewals auto-approve after payment. Manual approve is only for paid
                  registration requests that are still pending.
                </div>
              ) : null}

              {selected.decisionNote ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <span className="font-medium text-gray-900">Decision note: </span>
                  {selected.decisionNote}
                </div>
              ) : null}

              {!canDecide ? (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  Only Super Admin can approve or reject. You can view this request.
                </p>
              ) : null}
            </div>

            {/* Sticky footer actions */}
            {canDecide &&
            selected.adminStatus === 'pending' &&
            selected.kind === 'registration' ? (
              <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-gray-500">
                    Note <span className="text-gray-400">(required for reject)</span>
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                    placeholder="Optional for approve · required for reject"
                  />
                </label>
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                  <button
                    type="button"
                    disabled={acting}
                    onClick={handleReject}
                    className="px-4 py-2.5 bg-white border border-red-200 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={acting || selected.payment?.status !== 'paid'}
                    onClick={handleApprove}
                    title={
                      selected.payment?.status !== 'paid'
                        ? 'Payment must be paid before approve'
                        : undefined
                    }
                    className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ) : (
              <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-3 flex justify-end">
                <button
                  type="button"
                  disabled={acting}
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsTab;
