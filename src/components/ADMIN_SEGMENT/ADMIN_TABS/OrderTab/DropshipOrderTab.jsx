/**
 * Dropshipper Orders — master → detail:
 * 1) Pick a dropshipper (or View all)
 * 2) Same OrderTab / status tabs / fulfillment as ecomm, scoped to storefront=dropship
 *    (+ optional dropshipperId filter)
 */
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { ArrowLeft, Package, Users } from 'lucide-react';
import OrderTab from './OrderTab';
import {
  clearAdminOrderStorefrontOverride,
  setAdminOrderStorefrontOverride,
} from '../../ADMIN_REDUX_MANAGEMENT/order_management/adminOrderStorefront';
import {
  clearAdminOrderDropshipperFilter,
  setAdminOrderDropshipperFilter,
} from '../../ADMIN_REDUX_MANAGEMENT/order_management/adminOrderDropshipperFilter';
import {
  clearAdminOrderShippingSpeedScope,
  setAdminOrderShippingSpeedScope,
} from '../../ADMIN_REDUX_MANAGEMENT/order_management/adminOrderShippingSpeedScope';
import { adminOrdersApi } from '../../ADMIN_REDUX_MANAGEMENT/order_management/adminOrdersApi';
import {
  clearSearch,
  setActiveTabLabel,
  setPage,
  DEFAULT_ORDER_TAB_LABEL,
} from '../../ADMIN_REDUX_MANAGEMENT/order_management/adminOrdersSlice';
import { listDropshipperAccounts } from '../../../../SERVICES/adminDropshipperApi';
import { StatusPill, formatDate } from '../DROPSHIPPER_TAB/statusBadges.jsx';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'pending_otp', label: 'Pending OTP' },
  { value: 'pending_admin', label: 'Pending admin' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

function invalidateDropshipOrders(dispatch) {
  dispatch(
    adminOrdersApi.util.invalidateTags([
      { type: 'AdminOrdersList', id: 'PARTIAL' },
      { type: 'AdminOrdersSummary', id: 'SUMMARY' },
    ])
  );
}

function resetOrdersUi(dispatch) {
  dispatch(setPage(1));
  dispatch(clearSearch());
  dispatch(setActiveTabLabel(DEFAULT_ORDER_TAB_LABEL));
}

const DropshipOrderTab = () => {
  const dispatch = useDispatch();

  /** null = picker; { id, fullName, ... } | { id: null, all: true } = orders view */
  const [selected, setSelected] = useState(null);

  const [page, setListPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Sync storefront before paint so first OrderTab fetch uses dropship scope
  setAdminOrderStorefrontOverride('dropship');
  setAdminOrderShippingSpeedScope('standard');

  useLayoutEffect(() => {
    setAdminOrderStorefrontOverride('dropship');
    setAdminOrderShippingSpeedScope('standard');
  }, []);

  useEffect(() => {
    return () => {
      clearAdminOrderDropshipperFilter();
      clearAdminOrderStorefrontOverride();
      clearAdminOrderShippingSpeedScope();
      invalidateDropshipOrders(dispatch);
    };
  }, [dispatch]);

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
      toast.error(err?.response?.data?.message || 'Failed to load dropshippers');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, q]);

  useEffect(() => {
    if (selected) return;
    load();
  }, [load, selected]);

  const openDropshipperOrders = (row) => {
    const id = String(row?.id || '').trim();
    if (!id) return;
    setAdminOrderStorefrontOverride('dropship');
    setAdminOrderDropshipperFilter(id);
    resetOrdersUi(dispatch);
    invalidateDropshipOrders(dispatch);
    setSelected({
      id,
      fullName: row.fullName || 'Dropshipper',
      businessName: row.businessName || null,
      email: row.email || null,
      phone: row.phone || null,
      status: row.status || null,
      all: false,
    });
  };

  const openAllOrders = () => {
    setAdminOrderStorefrontOverride('dropship');
    clearAdminOrderDropshipperFilter();
    resetOrdersUi(dispatch);
    invalidateDropshipOrders(dispatch);
    setSelected({
      id: null,
      fullName: 'All dropshippers',
      businessName: null,
      email: null,
      phone: null,
      status: null,
      all: true,
    });
  };

  const backToList = () => {
    clearAdminOrderDropshipperFilter();
    resetOrdersUi(dispatch);
    invalidateDropshipOrders(dispatch);
    setSelected(null);
  };

  if (selected) {
    const displayName = selected.all
      ? 'All dropshippers'
      : selected.fullName || 'Dropshipper';
    const subtitle = selected.all
      ? 'Orders from every dropshipper account'
      : [selected.businessName, selected.email, selected.phone].filter(Boolean).join(' · ');

    return (
      <div className="space-y-3">
        {/* Compact toolbar — matches list page button style, no instructional clutter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={backToList}
              className="inline-flex shrink-0 items-center gap-1.5 px-3 py-2 border border-teal-300 text-teal-800 text-sm font-semibold rounded-lg hover:bg-teal-50 hover:border-teal-400 transition-colors"
            >
              <ArrowLeft size={15} strokeWidth={2.25} />
              Dropshippers
            </button>
            <div className="hidden sm:block h-8 w-px bg-gray-200 shrink-0" aria-hidden />
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-base font-semibold text-gray-900 truncate">{displayName}</h2>
                {!selected.all && selected.status ? (
                  <StatusPill status={selected.status} />
                ) : null}
              </div>
              {subtitle ? (
                <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>
              ) : null}
            </div>
          </div>
          {!selected.all ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 sm:shrink-0">
              <Package size={13} className="text-teal-600" />
              Their orders
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 sm:shrink-0">
              <Users size={13} className="text-teal-600" />
              Combined view
            </span>
          )}
        </div>
        <OrderTab key={selected.all ? 'dropship-orders-all' : `dropship-orders-${selected.id}`} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 inline-flex items-center gap-2">
            <Users size={18} className="text-teal-600" />
            Dropshippers
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} accounts · click a row to open their orders
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openAllOrders}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-teal-300 text-teal-800 text-sm font-medium rounded-lg hover:bg-teal-50"
          >
            <Package size={14} />
            View all orders
          </button>
          <select
            value={status}
            onChange={(e) => {
              setListPage(1);
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
              setListPage(1);
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Orders
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-teal-50/40 cursor-pointer"
                    onClick={() => openDropshipperOrders(row)}
                  >
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
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDropshipperOrders(row);
                        }}
                        className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 text-sm font-semibold"
                      >
                        <Package size={14} />
                        View orders
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
            onClick={() => setListPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setListPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DropshipOrderTab;
