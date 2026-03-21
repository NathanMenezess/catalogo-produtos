import { getToken } from "./authStorage";

const API_URL = import.meta.env.VITE_API_URL;

const CART_COUNT_KEY = "cartCount";

function calcCartCount(cart: any): number {
  const items = cart?.items || [];
  return items.reduce(
    (sum: number, it: any) => sum + (Number(it.quantity) || 0),
    0,
  );
}

function notifyCartChanged(cart: any) {
  const count = calcCartCount(cart);
  localStorage.setItem(CART_COUNT_KEY, String(count));
  window.dispatchEvent(new CustomEvent("cart:changed", { detail: { count } }));
}

export function getCartCount(): number {
  const raw = localStorage.getItem(CART_COUNT_KEY);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function authHeader() {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function handleResponse(res: Response) {
  // tenta ler json, senão texto
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    // tenta pegar mensagem padrão do FastAPI
    const message =
      (data &&
        typeof data === "object" &&
        "detail" in data &&
        (data as any).detail) ||
      (typeof data === "string" && data) ||
      `Erro ${res.status}`;

    throw new Error(message);
  }

  return data;
}

export async function getCart() {
  const res = await fetch(`${API_URL}/cart`, {
    method: "GET",
    headers: authHeader(),
  });
  const data = await handleResponse(res);
  notifyCartChanged(data);
  return data;
}

export async function addToCart(product_id: number, quantity = 1) {
  const res = await fetch(`${API_URL}/cart/items`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ product_id, quantity }),
  });
  const data = await handleResponse(res);
  notifyCartChanged(data);
  return data;
}

export async function updateCartItemByProduct(
  productId: number,
  quantity: number,
) {
  const res = await fetch(`${API_URL}/cart/items/product/${productId}`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify({ quantity }),
  });
  const data = await handleResponse(res);
  notifyCartChanged(data);
  return data;
}

export async function removeCartItem(itemId: number) {
  const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await handleResponse(res);
  notifyCartChanged(data);
  return data;
}

export async function clearCart() {
  const res = await fetch(`${API_URL}/cart/clear`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await handleResponse(res);
  notifyCartChanged(data);
  return data;
}
