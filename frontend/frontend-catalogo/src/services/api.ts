import type { Product } from "../types/Product";
import { getToken } from "./authStorage";

const API_URL = import.meta.env.VITE_API_URL;

function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createProduct(formData: FormData): Promise<Product> {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: authHeader(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erro ao criar produto");
  }

  return response.json();
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`);
  const data = await response.json();

  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    price: item.price,
    image_url: item.image_url,
    description: item.description,
  }));
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao excluir produto");
  }
}

export async function updateProduct(
  id: number,
  formData: FormData,
): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: authHeader(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar produto");
  }

  return response.json();
}

export async function getProductById(id: number): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("Produto não encontrado");
  }

  const item = await response.json();

  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    price: item.price,
    image_url: item.image_url,
    description: item.description,
  };
}
