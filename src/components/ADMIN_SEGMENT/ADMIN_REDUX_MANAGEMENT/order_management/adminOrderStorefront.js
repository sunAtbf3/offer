/**
 * Temporary admin order storefront scope override.
 * Used by Dropshipper Orders tab so the same OrderTab / adminOrdersApi
 * operate on storefront=dropship without changing ecomm Orders.
 *
 * Always clear on unmount — never leave override sticky across tabs.
 */

let adminOrderStorefrontOverride = null;

/** @returns {'ecomm'|'wholesale'|'dropship'|null} */
export function getAdminOrderStorefrontOverride() {
  return adminOrderStorefrontOverride;
}

/** @param {'ecomm'|'wholesale'|'dropship'|null|undefined} storefront */
export function setAdminOrderStorefrontOverride(storefront) {
  const v = String(storefront || '').toLowerCase().trim();
  if (v === 'ecomm' || v === 'wholesale' || v === 'dropship') {
    adminOrderStorefrontOverride = v;
    return;
  }
  adminOrderStorefrontOverride = null;
}

export function clearAdminOrderStorefrontOverride() {
  adminOrderStorefrontOverride = null;
}
