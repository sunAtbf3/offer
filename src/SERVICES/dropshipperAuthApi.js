/**
 * Public dropshipper registration / subscription API handoffs (Offer repo).
 * Ecomm Become-a-Dropshipper page uses these for register + pay.
 * Dropshipper-dashboard FE wires panel login/catalog separately.
 *
 * Base: /api/dropshipper/auth/...
 * No admin JWT required.
 */
import axiosInstance from './axiosInstance';

const BASE = '/dropshipper';

/** GET current subscription fee (public) */
export async function getSubscriptionSettings() {
  const res = await axiosInstance.get(`${BASE}/auth/subscription-settings`);
  return res.data;
}

/**
 * Validate applicant + return fee preview.
 * Body: wholesaler-style application fields + { fullName, email, phone, businessName? }
 */
export async function startDropshipperRegistration(body) {
  const res = await axiosInstance.post(`${BASE}/auth/register/start`, body);
  return res.data;
}

/**
 * Create registration request + Razorpay order.
 * Pass FormData with fields + idProof / businessAddressProof files (Cloudinary),
 * or a plain object (must already include proof https URLs).
 * Returns { requestId, razorpay: { keyId, orderId, amount, currency }, subscription }
 */
export async function createDropshipperRegistrationPayment(body) {
  const res = await axiosInstance.post(`${BASE}/auth/register/create-payment`, body);
  return res.data;
}

/**
 * After Razorpay Checkout success.
 * Body: { requestId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export async function verifyDropshipperRegistrationPayment(body) {
  const res = await axiosInstance.post(`${BASE}/auth/register/verify-payment`, body);
  return res.data;
}

/** Poll status — pass email or phone for ownership check */
export async function getDropshipperRegistrationStatus(requestId, { email, phone } = {}) {
  const res = await axiosInstance.get(
    `${BASE}/auth/register/status/${encodeURIComponent(requestId)}`,
    { params: { email, phone } }
  );
  return res.data;
}

/**
 * Phase C — after admin approve, send activation OTP to registered email.
 * Body: { email } | { phone } | { dropshipperId }
 */
export async function sendDropshipperActivationOtp(body) {
  const res = await axiosInstance.post(`${BASE}/auth/activate/send-otp`, body);
  return res.data;
}

/**
 * Phase C — verify OTP + set password → activates 1-year subscription.
 * Body: { email|phone|dropshipperId, otp, password, confirmPassword? }
 */
export async function completeDropshipperActivation(body) {
  const res = await axiosInstance.post(`${BASE}/auth/activate/complete`, body);
  return res.data;
}

/**
 * Phase D — dropshipper login (returns accessToken + refreshToken).
 * Body: { email, password } or { phone, password }
 * Use accessToken as: Authorization: Bearer <accessToken>
 */
export async function loginDropshipper(body) {
  const res = await axiosInstance.post(`${BASE}/auth/login`, body);
  return res.data;
}

export async function refreshDropshipperSession(refreshToken) {
  const res = await axiosInstance.post(`${BASE}/auth/refresh`, { refreshToken });
  return res.data;
}

/** Requires dropshipper Bearer token */
export async function getDropshipperMe() {
  const res = await axiosInstance.get(`${BASE}/auth/me`);
  return res.data;
}

/** Requires dropshipper Bearer token */
export async function logoutDropshipper() {
  const res = await axiosInstance.post(`${BASE}/auth/logout`);
  return res.data;
}

/**
 * Phase E — renew quote (current admin fee + new endsAt preview).
 * Works when subscription is expired (or early renew while active).
 * Requires dropshipper Bearer token — does NOT require active subscription.
 */
export async function getDropshipperRenewQuote() {
  const res = await axiosInstance.get(`${BASE}/auth/renew/quote`);
  return res.data;
}

/**
 * Phase E — create renew Razorpay order at current fee.
 * Returns { requestId, razorpay: { keyId, orderId, amount, currency }, subscription }
 */
export async function createDropshipperRenewPayment() {
  const res = await axiosInstance.post(`${BASE}/auth/renew/create-payment`);
  return res.data;
}

/**
 * Phase E — after Razorpay Checkout success → extends endsAt by 1 year, no admin approval.
 * Body: { requestId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export async function verifyDropshipperRenewPayment(body) {
  const res = await axiosInstance.post(`${BASE}/auth/renew/verify-payment`, body);
  return res.data;
}
