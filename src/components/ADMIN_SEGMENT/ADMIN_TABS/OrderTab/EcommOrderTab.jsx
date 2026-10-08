/**
 * Standard ecomm orders — excludes same_day (those live under Same Day Delivery tab).
 */
import React, { useLayoutEffect } from 'react';
import OrderTab from './OrderTab';
import {
  clearAdminOrderShippingSpeedScope,
  setAdminOrderShippingSpeedScope,
} from '../../ADMIN_REDUX_MANAGEMENT/order_management/adminOrderShippingSpeedScope';

const EcommOrderTab = () => {
  setAdminOrderShippingSpeedScope('standard');

  useLayoutEffect(() => {
    setAdminOrderShippingSpeedScope('standard');
    return () => {
      clearAdminOrderShippingSpeedScope();
    };
  }, []);

  return <OrderTab key="ecomm-orders-standard" />;
};

export default EcommOrderTab;
