// ADMIN_TABS/OrderTab/ordersTabRegistry.js
import { lazy } from 'react';

const OrderTab = lazy(() => import('./OrderTab'));
const DropshipOrderTab = lazy(() => import('./DropshipOrderTab'));

export const ORDERS_TAB_REGISTRY = [
  {
    id: 'ecomm_orders',
    label: 'Ecomm Orders',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6',
    component: OrderTab,
  },
  {
    id: 'dropship_orders',
    label: 'Dropshipper Orders',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    component: DropshipOrderTab,
  },
];
