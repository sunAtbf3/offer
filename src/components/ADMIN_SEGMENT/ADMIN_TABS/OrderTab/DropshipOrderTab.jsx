/**
 * Dropshipper Orders — same OrderTab / fulfillment actions as ecomm,
 * scoped via x-storefront: dropship (adminOrderStorefront override).
 */
import React, { useEffect, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
import OrderTab from './OrderTab';
import {
  clearAdminOrderStorefrontOverride,
  setAdminOrderStorefrontOverride,
} from '../../ADMIN_REDUX_MANAGEMENT/order_management/adminOrderStorefront';
import { adminOrdersApi } from '../../ADMIN_REDUX_MANAGEMENT/order_management/adminOrdersApi';

const DropshipOrderTab = () => {
  const dispatch = useDispatch();

  // Sync before paint so first OrderTab fetch already uses dropship scope
  setAdminOrderStorefrontOverride('dropship');

  useLayoutEffect(() => {
    setAdminOrderStorefrontOverride('dropship');
  }, []);

  useEffect(() => {
    dispatch(
      adminOrdersApi.util.invalidateTags([
        { type: 'AdminOrdersList', id: 'PARTIAL' },
        { type: 'AdminOrdersSummary', id: 'SUMMARY' },
      ])
    );
    return () => {
      clearAdminOrderStorefrontOverride();
      dispatch(
        adminOrdersApi.util.invalidateTags([
          { type: 'AdminOrdersList', id: 'PARTIAL' },
          { type: 'AdminOrdersSummary', id: 'SUMMARY' },
        ])
      );
    };
  }, [dispatch]);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
        <strong>Dropshipper Orders</strong> — storefront <code>dropship</code> only.
        Confirm / ship / track here the same way as ecomm. After you confirm, dropshippers
        see <em>Approved</em> on their portal (paid alone stays Pending Approval).
      </div>
      <OrderTab key="dropship-orders" />
    </div>
  );
};

export default DropshipOrderTab;
