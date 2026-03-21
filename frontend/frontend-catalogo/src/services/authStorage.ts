const TOKEN_KEY = "token";
const ROLE_KEY = "role";

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem("userId");
}

export function setRole(role: string) {
  localStorage.setItem(ROLE_KEY, role);
}
export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function isCliente() {
  return getRole() === "cliente";
}

export function isAdminOrVendedor() {
  const role = getRole();
  return role === "admin" || role === "vendedor";
}

export function getUserId(): number | null {
  const raw = localStorage.getItem("userId");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function setUserId(id: number) {
  localStorage.setItem("userId", String(id));
}
