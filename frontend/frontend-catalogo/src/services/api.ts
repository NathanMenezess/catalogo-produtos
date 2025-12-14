import type { Product } from "../types/Product";

const API_URL = import.meta.env.VITE_API_URL;

// GET
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error("Erro ao buscar produtos");
  return res.json();
}

// POST
export async function createProduct(formData: FormData): Promise<Product> {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Erro ao criar produto");
  return res.json();
}
