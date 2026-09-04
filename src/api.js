// TestMandi API client.
// Talks to the backend in ../testmandi-server. Handles access/refresh token
// storage in localStorage and transparently retries once on a 401 by
// refreshing the access token first.

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const TOKEN_KEY = "testmandi_token";
const REFRESH_KEY = "testmandi_refresh";

function getTokens() {
  return {
    token: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
  };
}

function setTokens({ token, refreshToken }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function rawRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const { token } = getTokens();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, data };
}

// Refreshes the access token using the stored refresh token. Returns true on
// success. Callers should re-attempt their original request once after this.
async function tryRefresh() {
  const { refreshToken } = getTokens();
  if (!refreshToken) return false;
  const { ok, data } = await rawRequest("/api/auth/refresh", { method: "POST", body: { refreshToken }, auth: false });
  if (ok && data?.token) {
    setTokens({ token: data.token, refreshToken: data.refreshToken });
    return true;
  }
  clearTokens();
  return false;
}

// Every authenticated call goes through here so a single expired access
// token doesn't force the user to log in again — it refreshes once, silently.
async function request(path, options = {}) {
  let result = await rawRequest(path, options);
  if (result.status === 401 && options.auth !== false) {
    const refreshed = await tryRefresh();
    if (refreshed) result = await rawRequest(path, options);
  }
  if (!result.ok) {
    const message = result.data?.error || `Request failed (${result.status})`;
    const err = new Error(message);
    err.status = result.status;
    err.data = result.data;
    throw err;
  }
  return result.data;
}

export const api = {
  baseUrl: API_BASE,
  // ---- session/token management ----
  getStoredTokens: getTokens,
  clearSession: clearTokens,
  isLoggedIn: () => !!getTokens().token,

  // ---- auth ----
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload, auth: false })
    .then((data) => { setTokens(data); return data; }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload, auth: false })
    .then((data) => { setTokens(data); return data; }),
  logout: async () => {
    const { refreshToken } = getTokens();
    try { await rawRequest("/api/auth/logout", { method: "POST", body: { refreshToken }, auth: false }); } catch { /* best effort */ }
    clearTokens();
  },
  me: () => request("/api/auth/me"),
  updateAccount: (payload) => request("/api/auth/update-account", { method: "POST", body: payload }).then((data) => { setTokens(data); return data; }),
  verifyEmail: (uid, token) => request("/api/auth/verify-email", { method: "POST", body: { uid, token }, auth: false }),
  resendVerification: () => request("/api/auth/resend-verification", { method: "POST" }),
  forgotPassword: (email) => request("/api/auth/forgot-password", { method: "POST", body: { email }, auth: false }),
  resetPassword: (uid, token, newPassword) => request("/api/auth/reset-password", { method: "POST", body: { uid, token, newPassword }, auth: false }),

  // ---- categories ----
  getCategories: () => request("/api/categories", { auth: false }),
  addCategory: (name) => request("/api/categories", { method: "POST", body: { name } }),
  removeCategory: (name) => request(`/api/categories/${encodeURIComponent(name)}`, { method: "DELETE" }),

  // ---- tests ----
  getTests: () => request("/api/tests", { auth: false }),
  getMyTests: () => request("/api/tests/mine"),
  createTest: (draft) => request("/api/tests", { method: "POST", body: draft }),
  deleteTest: (id) => request(`/api/tests/${id}`, { method: "DELETE" }),
  rateTest: (testId, value) => request(`/api/tests/${testId}/rate`, { method: "POST", body: { value } }),

  // ---- bundles ----
  getBundles: () => request("/api/bundles", { auth: false }),
  getMyBundles: () => request("/api/bundles/mine"),
  createBundle: (draft) => request("/api/bundles", { method: "POST", body: draft }),
  deleteBundle: (id) => request(`/api/bundles/${id}`, { method: "DELETE" }),
  getMyBundlePurchases: () => request("/api/bundle-purchases/mine"),

  // ---- ads ----
  getActiveAds: () => request("/api/ads", { auth: false }),
  getMyAds: () => request("/api/ads/mine"),
  deleteAd: (id) => request(`/api/ads/${id}`, { method: "DELETE" }),

  // ---- referrals ----
  getMyReferrals: () => request("/api/referrals/mine"),

  // ---- checkout (Razorpay) ----
  createOrder: (payload) => request("/api/checkout/create-order", { method: "POST", body: payload }),
  verifyPayment: (payload) => request("/api/checkout/verify", { method: "POST", body: payload }),
  getMyPurchases: () => request("/api/purchases/mine"),

  // ---- attempts ----
  submitAttempt: (payload) => request("/api/attempts", { method: "POST", body: payload }),
  getMyAttempts: () => request("/api/attempts/mine"),

  // ---- seller payouts ----
  saveBankDetails: (payload) => request("/api/payouts/bank", { method: "POST", body: payload }),
  getMyPayouts: () => request("/api/payouts/mine"),
  getSettings: () => request("/api/settings", { auth: false }),
  updateSellerShare: (sellerSharePercent) => request("/api/admin/settings", { method: "PUT", body: { sellerSharePercent } }),
  withdraw: () => request("/api/payouts/withdraw", { method: "POST" }),

  // ---- notifications ----
  getNotifications: () => request("/api/notifications"),
  sendNotification: (payload) => request("/api/notifications", { method: "POST", body: payload }),

  // ---- admin ----
  getAccounts: () => request("/api/admin/accounts"),
  removeAccount: (email) => request(`/api/admin/accounts/${encodeURIComponent(email)}`, { method: "DELETE" }),
  getAdminOverview: () => request("/api/admin/overview"),
  getAdminAllData: () => request("/api/admin/all-data"),
  getAdminPayouts: () => request("/api/admin/payouts"),
  resolveAdminPayout: (id, outcome, reference) => request(`/api/admin/payouts/${id}/resolve`, { method: "POST", body: { outcome, reference } }),
  getAllAdminData: () => request("/api/admin/all-data"),

  // ---- chat ----
  chat: (messages, roleHint, name) => request("/api/chat", { method: "POST", body: { messages, roleHint, name }, auth: false }),
};
