// ─── Central API module ───────────────────────────────────────
const BASE = "http://localhost:5000/api";

// ── Token helpers ─────────────────────────────────────────────
const TOKEN_KEY = "metalinv_token";

export function getToken()       { return localStorage.getItem(TOKEN_KEY); }
export function saveToken(t)     { localStorage.setItem(TOKEN_KEY, t); }
export function clearToken()     { localStorage.removeItem(TOKEN_KEY); }

// ── Core fetch wrapper ────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }
  return data;
}

// ── Auth API ──────────────────────────────────────────────────
export const authAPI = {
  login:    (email, password)            => apiFetch("/auth/login",    { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name, email, password, role) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password, role }) }),
  me:       ()                           => apiFetch("/auth/me"),
};

// ── Orders API ────────────────────────────────────────────────
// The backend returns raw DB rows; we normalise them so the UI
// can use consistent field names regardless of snake_case vs camelCase.
function normaliseOrder(o) {
  return {
    dbId:         o.id,
    id:           `REQ-${String(o.id).padStart(4, "0")}`,
    customerName: o.customer_name  || o.customerName  || "—",
    metalType:    o.metal_type     || o.metalType     || "—",
    quantity:     o.quantity       ?? "—",
    width:        o.width          ?? null,
    thickness:    o.thickness      ?? null,
    notes:        o.notes          || "",
    status:       o.status         || "Pending",
    createdAt:    o.created_at     ? new Date(o.created_at).toLocaleDateString() : (o.createdAt || "—"),
  };
}

export const ordersAPI = {
  getAll:      ()                  => apiFetch("/orders").then(d => (d.orders || d).map(normaliseOrder)),
  create:      (body)              => apiFetch("/orders",      { method: "POST",  body: JSON.stringify(body) }),
  deleteOrder: (id)                => apiFetch(`/orders/${id}`, { method: "DELETE" }),
  updateStatus:(id, status)        => apiFetch(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  deleteOrder: (id)                => apiFetch(`/orders/${id}`,         { method: "DELETE" }),
};

// ── Inventory API ─────────────────────────────────────────────
export const inventoryAPI = {
  // Metal types
  getMetalTypes:    ()        => apiFetch("/inventory/metal-types").then(d => d.metalTypes || d),
  createMetalType:  (body)    => apiFetch("/inventory/metal-types",     { method: "POST",   body: JSON.stringify(body) }),
  updateMetalType:  (id, body)=> apiFetch(`/inventory/metal-types/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteMetalType:  (id)      => apiFetch(`/inventory/metal-types/${id}`, { method: "DELETE" }),

  // Coil stock
  getCoils:    ()        => apiFetch("/inventory/coils").then(d => d.coils || d),
  createCoil:  (body)    => apiFetch("/inventory/coils",     { method: "POST",   body: JSON.stringify(body) }),
  updateCoil:  (id, body)=> apiFetch(`/inventory/coils/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCoil:  (id)      => apiFetch(`/inventory/coils/${id}`, { method: "DELETE" }),
};

// ── Optimize API ──────────────────────────────────────────────
export const optimizeAPI = {
  generate: (orderIds) => apiFetch("/optimize", { method: "POST", body: JSON.stringify({ orderIds }) }),
};
