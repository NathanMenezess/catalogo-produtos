// src/services/ordersApi.ts
import { getToken } from "./authStorage";

const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
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

function authHeader() {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createOrder(payload?: any) {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: authHeader(),
    body: payload ? JSON.stringify(payload) : undefined,
  });
  return handleResponse(res);
}

export async function getMyOrders() {
  const res = await fetch(`${API_URL}/orders/me`, {
    headers: authHeader(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erro ao buscar pedidos");
  }

  return res.json();
}

export async function getOrderById(id: number) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: authHeader(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erro ao buscar pedido");
  }

  return res.json();
}

export async function simulatePayment(orderId: number) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/orders/${orderId}/pay`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao confirmar pagamento");
  }

  return response.json();
}
