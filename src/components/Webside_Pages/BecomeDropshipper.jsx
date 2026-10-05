/**
 * Ecomm storefront only — Become a Dropshipper CTA (button only, no form).
 * Registration form lives on the dropshipper portal.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSubscriptionSettings } from '../../SERVICES/dropshipperAuthApi';

const PORTAL_REGISTER_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_DROPSHIPPER_PORTAL_URL &&
    String(import.meta.env.VITE_DROPSHIPPER_PORTAL_URL).trim()) ||
  'http://localhost:5174/register';

const BecomeDropshipper = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSubscriptionSettings();
        if (!cancelled) setSettings(data?.settings || null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message || 'Could not load subscription fee right now.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const amount = settings?.subscriptionAmountInr;
  const years = settings?.subscriptionYears || 1;
  const registrationOpen = settings?.registrationOpen !== false;

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-orange-50/80 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-14 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#f7a221] mb-3">
          OfferwaleBaba · Ecomm
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Become a Dropshipper
        </h1>
        <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-2xl leading-relaxed">
          Partner with us to sell our catalog. Open the dropshipper portal to register, pay the
          annual fee, and complete your application.
        </p>

        <div className="mt-8 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-5 h-5 border-2 border-[#f7a221] border-t-transparent rounded-full animate-spin" />
              Loading plan…
            </div>
          ) : error ? (
            <p className="text-sm text-amber-700">{error}</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Annual subscription</p>
                <p className="text-3xl font-black text-gray-900 mt-1">
                  {amount != null ? `₹${Number(amount).toLocaleString('en-IN')}` : '—'}
                  <span className="text-base font-semibold text-gray-500 ml-2">
                    / {years} year
                  </span>
                </p>
                {!registrationOpen ? (
                  <p className="mt-2 text-sm text-red-600">
                    New registrations are temporarily closed.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    Continue on the dropshipper portal to fill details and pay.
                  </p>
                )}
              </div>
              <a
                href={PORTAL_REGISTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold text-white transition ${
                  registrationOpen
                    ? 'bg-[#f7a221] hover:bg-[#e09110]'
                    : 'bg-gray-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                Become a Dropshipper
              </a>
            </div>
          )}
        </div>

        <p className="mt-10 text-sm text-gray-500">
          <Link to="/" className="text-[#f7a221] font-semibold hover:underline">
            Back to shop
          </Link>
          {' · '}
          <Link to="/contact" className="text-[#f7a221] font-semibold hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
};

export default BecomeDropshipper;
