import type { Product } from "../types/Product";

const API_URL = import.meta.env.VITE_API_URL;

export async function createProduct(formData: FormData): Promise<Product> {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
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
    image_url: item.image_url, // 👈 conversão aqui
  }));
}
