// ADMIN_TABS/DROPSHIPPER_TAB/RequestsTab.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  listDropshipperRequests,
  approveDropshipperRequest,
  rejectDropshipperRequest,
} from '../../../../SERVICES/adminDropshipperApi';
import { selectAdminUser } from '../../ADMIN_REDUX_MANAGEMENT/adminAuthSlice';
import { ROLES } from '../../roles';
import { StatusPill, formatInr, formatDate } from './statusBadges.jsx';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !acting && setSelected(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request review</h3>
              <button
                type="button"
                disabled={acting}
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{selected.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kind</p>
                  <p className="capitalize">{selected.kind}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p>{selected.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p>{selected.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Due / Paid</p>
                  <p>
                    {formatInr(selected.amountDueInr)} / {formatInr(selected.amountPaidInr)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Plan</p>
                  <p>{selected.planYears || 1} year</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment</p>
                  <StatusPill status={selected.payment?.status} kind="payment" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Admin</p>
                  <StatusPill status={selected.adminStatus} kind="request" />
                </div>
              </div>
              {selected.payment?.razorpayPaymentId ? (
                <p className="text-xs text-gray-500 break-all">
                  Payment ID: {selected.payment.razorpayPaymentId}
                </p>
              ) : null}

              {selected.application ? (
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Application (wholesaler-style)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">WhatsApp</p>
                      <p>{selected.whatsappNumber || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Have shop</p>
                      <p>{selected.application.haveShop ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Permanent address</p>
                      <p>{selected.application.permanentAddress || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Business address</p>
                      <p>{selected.application.businessAddress || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Delivery address</p>
                      <p>{selected.application.deliveryAddress || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Selling from</p>
                      <p>{selected.application.sellingPlaceFrom || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Zone / city</p>
                      <p>{selected.application.sellingZoneCity || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p>{selected.application.productCategory || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Monthly est.</p>
                      <p>
                        {selected.application.monthlyEstimatedPurchase != null
                          ? formatInr(selected.application.monthlyEstimatedPurchase)
                          : '—'}
                      </p>
                    </div>
                    {selected.application.idProofUrl ? (
                      <div className="col-span-2">
                        <a
                          href={selected.application.idProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 underline break-all"
                        >
                          ID proof →
                        </a>
                      </div>
                    ) : null}
                    {selected.application.businessAddressProofUrl ? (
                      <div className="col-span-2">
                        <a
                          href={selected.application.businessAddressProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 underline break-all"
                        >
                          Business address proof →
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {selected.kind === 'renewal' ? (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-800 text-xs">
                  Renewals auto-approve on payment. Manual approve is only for registration
                  requests that are paid + pending.
                </div>
              ) : null}
              {selected.decisionNote ? (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700">
                  Decision note: {selected.decisionNote}
                </div>
              ) : null}
            </div>

            {canDecide && selected.adminStatus === 'pending' && selected.kind === 'registration' ? (
              <div className="space-y-3">
                <label className="block text-sm">
                  <span className="text-xs text-gray-500">Note (required for reject)</span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Optional for approve; required for reject"
                  />
                </label>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    disabled={acting}
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
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
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ) : !canDecide ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                Only Super Admin can approve or reject. You can view requests.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsTab;
