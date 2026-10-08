/**
 * Same Day Delivery orders — ecomm storefront only, shippingSpeed=same_day.
 * Reuses OrderTab fulfillment UI; never mixes with standard Ecomm / Dropship lists.
 */
import React, { useLayoutEffect } from 'react';
import OrderTab from './OrderTab';
import {
  clearAdminOrderShippingSpeedScope,
  setAdminOrderShippingSpeedScope,
} from '../../ADMIN_REDUX_MANAGEMENT/order_management/adminOrderShippingSpeedScope';
import {
  clearAdminOrderStorefrontOverride,
  setAdminOrderStorefrontOverride,
} from '../../ADMIN_REDUX_MANAGEMENT/order_management/adminOrderStorefront';
import { clearAdminOrderDropshipperFilter } from '../../ADMIN_REDUX_MANAGEMENT/order_management/adminOrderDropshipperFilter';

const SameDayOrderTab = () => {
  setAdminOrderStorefrontOverride('ecomm');
  setAdminOrderShippingSpeedScope('same_day');

  useLayoutEffect(() => {
    setAdminOrderStorefrontOverride('ecomm');
    setAdminOrderShippingSpeedScope('same_day');
    clearAdminOrderDropshipperFilter();
    return () => {
      clearAdminOrderShippingSpeedScope();
      clearAdminOrderStorefrontOverride();
    };
  }, []);

  return (
    <div className="w-full">
      <div className="mb-3 px-1">
        <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Same Day Delivery — Shiprocket Quick orders only. Standard Shiprocket / Shipmozo orders stay under Ecomm Orders.
        </p>
      </div>
      <OrderTab key="same-day-orders" />
    </div>
  );
};

export default SameDayOrderTab;
