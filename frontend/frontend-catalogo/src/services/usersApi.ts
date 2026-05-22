import { getToken } from "./authStorage";

const API_URL = import.meta.env.VITE_API_URL;

function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type UserOption = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export async function getCustomers(): Promise<UserOption[]> {
  const response = await fetch(`${API_URL}/users/customers`, {
    headers: authHeader(),
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar clientes");
  }

  return response.json();
}

export async function getSellers(): Promise<UserOption[]> {
  const response = await fetch(`${API_URL}/users/sellers`, {
    headers: authHeader(),
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar vendedores");
  }

  return response.json();
}
