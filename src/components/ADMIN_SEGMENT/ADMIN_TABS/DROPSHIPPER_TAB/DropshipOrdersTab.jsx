// ADMIN_TABS/DROPSHIPPER_TAB/DropshipOrdersTab.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  listAdminDropshipOrders,
  getAdminDropshipOrder,
} from '../../../../SERVICES/adminDropshipperApi';
import { formatInr, formatDate } from './statusBadges.jsx';

const DropshipOrdersTab = () => {
  const [page, setPage] = useState(1);
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
      const data = await listAdminDropshipOrders({
        page,
        limit: 15,
        q: q || undefined,
      });
      setRows(data?.orders || data?.data || []);
      setTotalPages(data?.totalPages || data?.pagination?.totalPages || 1);
      setTotal(data?.total || data?.pagination?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load dropship orders');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (orderId) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await getAdminDropshipOrder(orderId);
      setDetail(data?.order || data || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load order');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dropship orders</h2>
          <p className="text-sm text-gray-500">
            storefront=dropship only — separate from ecomm/wholesale order lists ({total} shown)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
              placeholder="Order id / dropship ref"
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
          <div className="p-12 text-center text-gray-500 text-sm">No dropship orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((row) => {
                  const id = row.orderId || row.publicId || row._id || row.id;
                  return (
                    <tr key={String(id)} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.customer?.fullName ||
                          row.shippingAddress?.fullName ||
                          row.dropshipMeta?.customerName ||
                          '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.paymentStatus || row.payment?.status || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.orderStatus || row.status || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatInr(row.totalAmount ?? row.totals?.grandTotal ?? row.grandTotal ?? row.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openDetail(id)}
                          className="text-teal-700 hover:text-teal-900 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Dropship order</h3>
              <button type="button" onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            {detailLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <pre className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(detail, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropshipOrdersTab;
