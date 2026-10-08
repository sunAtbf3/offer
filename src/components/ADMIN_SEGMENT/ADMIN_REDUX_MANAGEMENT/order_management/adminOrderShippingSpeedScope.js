/**
 * Module-level scope so Ecomm Orders vs Same Day Delivery tab do not mix.
 * Mirrors adminOrderStorefront / dropshipper filter pattern.
 *
 * - standard (default): exclude shippingSpeed=same_day
 * - same_day: only same-day orders
 */

let shippingSpeedScope = 'standard';

export function setAdminOrderShippingSpeedScope(scope) {
  const s = String(scope || 'standard')
    .toLowerCase()
    .trim();
  if (s === 'same_day' || s === 'sameday' || s === 'same-day') {
    shippingSpeedScope = 'same_day';
    return;
  }
  if (s === 'all') {
    shippingSpeedScope = 'all';
    return;
  }
  shippingSpeedScope = 'standard';
}

export function getAdminOrderShippingSpeedScope() {
  return shippingSpeedScope || 'standard';
}

export function clearAdminOrderShippingSpeedScope() {
  shippingSpeedScope = 'standard';
}

export function withShippingSpeedScopeParam(params = {}) {
  const scope = getAdminOrderShippingSpeedScope();
  if (!scope || scope === 'all') return { ...params };
  return { ...params, shippingSpeedScope: scope };
}
