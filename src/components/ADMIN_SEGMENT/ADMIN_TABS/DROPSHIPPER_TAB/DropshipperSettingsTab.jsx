// ADMIN_TABS/DROPSHIPPER_TAB/DropshipperSettingsTab.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  getDropshipperSettings,
  updateDropshipperSettings,
} from '../../../../SERVICES/adminDropshipperApi';
import { selectAdminUser } from '../../ADMIN_REDUX_MANAGEMENT/adminAuthSlice';
import { ROLES } from '../../roles';
import { formatInr, formatDate } from './statusBadges.jsx';

const DropshipperSettingsTab = () => {
  const adminUser = useSelector(selectAdminUser);
  const canEdit = adminUser?.role === ROLES.ADMIN;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [amountInr, setAmountInr] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDropshipperSettings();
      const s = data?.settings || null;
      setSettings(s);
      setAmountInr(s?.subscriptionAmountInr != null ? String(s.subscriptionAmountInr) : '');
      setRegistrationOpen(s?.registrationOpen !== false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    const n = Number(String(amountInr).replace(/,/g, '').trim());
    if (!Number.isFinite(n) || n < 1) {
      toast.error('Enter a valid subscription amount (₹1+)');
      return;
    }
    setSaving(true);
    try {
      const data = await updateDropshipperSettings({
        subscriptionAmountInr: n,
        registrationOpen: registrationOpen === true,
      });
      setSettings(data?.settings || null);
      toast.success(data?.message || 'Settings saved');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Dropshipper subscription settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fee applies to new registrations and renewals. Plan length is hardcoded to{' '}
          {settings?.subscriptionYears || 1} year.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Channel</span>
          <span className="font-medium text-gray-900">{settings?.channel || 'dropship'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Current fee</span>
          <span className="font-medium text-gray-900">
            {formatInr(settings?.subscriptionAmountInr)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Last updated</span>
          <span className="font-medium text-gray-900">{formatDate(settings?.updatedAt)}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Subscription amount (₹)</span>
          <input
            type="number"
            min={1}
            step={1}
            value={amountInr}
            disabled={!canEdit || saving}
            onChange={(e) => setAmountInr(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50"
          />
        </label>

        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-gray-700">Registration open</p>
            <p className="text-xs text-gray-500">
              When closed, new register create-payment is blocked. Renew still works.
            </p>
          </div>
          <input
            type="checkbox"
            checked={registrationOpen}
            disabled={!canEdit || saving}
            onChange={(e) => setRegistrationOpen(e.target.checked)}
            className="h-4 w-4 accent-teal-600"
          />
        </label>

        {canEdit ? (
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        ) : (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
            Only Super Admin can change the fee. You can view settings.
          </p>
        )}
      </form>
    </div>
  );
};

export default DropshipperSettingsTab;
