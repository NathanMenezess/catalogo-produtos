import { API_URL } from "./api";
import { getToken } from "./authStorage";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getSuppliers() {
  const res = await fetch(`${API_URL}/suppliers`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Erro ao buscar fornecedores");
  return res.json();
}

export async function createSupplier(data: any) {
  const res = await fetch(`${API_URL}/suppliers`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erro ao cadastrar fornecedor");
  return res.json();
}

export async function getPurchaseOrders() {
  const res = await fetch(`${API_URL}/purchase-orders`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Erro ao buscar ordens de compra");
  return res.json();
}

export async function createPurchaseOrder(data: any) {
  const res = await fetch(`${API_URL}/purchase-orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erro ao criar ordem de compra");
  return res.json();
}

export async function receivePurchaseOrder(id: number) {
  const res = await fetch(`${API_URL}/purchase-orders/${id}/receive`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Erro ao receber ordem de compra");
  return res.json();
}
