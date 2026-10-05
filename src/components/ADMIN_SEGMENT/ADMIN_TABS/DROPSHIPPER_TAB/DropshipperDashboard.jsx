// ADMIN_TABS/DROPSHIPPER_TAB/DropshipperDashboard.jsx
import React, { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DROPSHIPPER_TAB_REGISTRY } from './dropshipperTabRegistry';

const DropshipperDashboard = () => {
  const [searchParams] = useSearchParams();
  const activeCtab = searchParams.get('ctab') || DROPSHIPPER_TAB_REGISTRY[0]?.id;
  const activeTabConfig = DROPSHIPPER_TAB_REGISTRY.find((t) => t.id === activeCtab);
  const SubTabComponent = activeTabConfig?.component ?? null;

  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Isolated dropship channel — does not change ecomm or wholesale customers.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        {SubTabComponent ? (
          <SubTabComponent />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Sub-tab not found
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default DropshipperDashboard;
