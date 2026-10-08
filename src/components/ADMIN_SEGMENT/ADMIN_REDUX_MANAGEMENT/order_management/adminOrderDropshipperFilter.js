/**
 * Temporary admin order dropshipperId filter.
 * Used by Dropshipper Orders tab so OrderTab / adminOrdersApi
 * load only one dropshipper's orders (storefront=dropship still required).
 *
 * Always clear on unmount / back-to-list — never leave sticky across tabs.
 */

let adminOrderDropshipperId = null;

/** @returns {string|null} */
export function getAdminOrderDropshipperFilter() {
  return adminOrderDropshipperId;
}

/** @param {string|null|undefined} dropshipperId */
export function setAdminOrderDropshipperFilter(dropshipperId) {
  const v = String(dropshipperId || '').trim();
  adminOrderDropshipperId = v || null;
}

export function clearAdminOrderDropshipperFilter() {
  adminOrderDropshipperId = null;
}
