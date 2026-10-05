// ADMIN_TABS/DROPSHIPPER_TAB/AccountsTab.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { listDropshipperAccounts, getDropshipperAccount } from '../../../../SERVICES/adminDropshipperApi';
import { StatusPill, formatInr, formatDate } from './statusBadges.jsx';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'pending_otp', label: 'Pending OTP' },
  { value: 'pending_admin', label: 'Pending admin' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

const AccountsTab = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listDropshipperAccounts({
        page,
        limit: 15,
        status: status === 'all' ? undefined : status,
        q: q || undefined,
      });
      setRows(data?.dropshippers || []);
      setTotalPages(data?.totalPages || 1);
      setTotal(data?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load dropshipper accounts');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, q]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await getDropshipperAccount(id);
      setDetail(data?.dropshipper || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load account');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dropshipper accounts</h2>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {STATUS_OPTIONS.map((o) => (
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
              placeholder="Search name, email, phone"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[200px]"
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
          <div className="p-12 text-center text-gray-500 text-sm">No dropshipper accounts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{row.fullName}</div>
                      {row.businessName ? (
                        <div className="text-xs text-gray-500">{row.businessName}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{row.email}</div>
                      <div>{row.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>
                        {row.subscription?.active ? 'Active' : 'Inactive'} ·{' '}
                        {formatInr(row.subscription?.amountPaidInr)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Ends {formatDate(row.subscription?.endsAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDetail(row.id)}
                        className="text-teal-700 hover:text-teal-900 text-sm font-medium"
                      >
                        View
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

      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Account detail</h3>
              <button type="button" onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            {detailLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : detail ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{detail.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <StatusPill status={detail.status} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p>{detail.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p>{detail.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Business</p>
                    <p>{detail.businessName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Password set</p>
                    <p>{detail.hasPassword ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Starts</p>
                    <p>{formatDate(detail.subscription?.startsAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ends</p>
                    <p>{formatDate(detail.subscription?.endsAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last paid</p>
                    <p>{formatInr(detail.subscription?.amountPaidInr)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Renewed</p>
                    <p>{formatDate(detail.subscription?.renewedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last login</p>
                    <p>{formatDate(detail.lastLoginAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Channel</p>
                    <p>{detail.channel || 'dropship'}</p>
                  </div>
                </div>
                {detail.rejectionNote ? (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-700">
                    Rejection note: {detail.rejectionNote}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsTab;
