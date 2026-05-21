import type { Product } from "../types/Product";
import { getToken } from "./authStorage";

const API_URL = import.meta.env.VITE_API_URL;

function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type Favorite = {
  id: number;
  user_id: number;
  product_id: number;
  product: Product;
};

export async function getFavorites(): Promise<Favorite[]> {
  const response = await fetch(`${API_URL}/favorites`, {
    headers: authHeader(),
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar favoritos");
  }

  return response.json();
}

export async function addFavorite(productId: number): Promise<Favorite> {
  const response = await fetch(`${API_URL}/favorites/${productId}`, {
    method: "POST",
    headers: authHeader(),
  });

  if (!response.ok) {
    throw new Error("Erro ao favoritar produto");
  }

  return response.json();
}

export async function removeFavorite(productId: number): Promise<void> {
  const response = await fetch(`${API_URL}/favorites/${productId}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  if (!response.ok) {
    throw new Error("Erro ao remover favorito");
  }
}
