import type { Product } from "../types/Product";

const API_URL = import.meta.env.VITE_API_URL;

// Função para criar um novo produto
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

// Função para buscar a lista de produtos
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

// Função para excluir um produto pelo ID
export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir produto");
  }
}

// Função para atualizar um produto pelo ID
export async function updateProduct(
  id: number,
  formData: FormData
): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar produto");
  }

  return response.json();
}
