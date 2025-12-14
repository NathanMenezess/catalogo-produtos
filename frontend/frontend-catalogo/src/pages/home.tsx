import { useEffect, useState } from "react";
import "./home.css";
import { ProductCard } from "../components/productCard";
import { ProductForm } from "../components/productForm";
import type { Product } from "../types/Product";
import * as Service from "../services/api";

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    Service.getProducts().then(setProducts).catch(console.error);
  }, []);

  function handleAdd(product: Product) {
    setProducts((prev) => [...prev, product]);
  }

  function handleDelete(id: number) {
    if (!confirm("Deseja excluir este produto?")) return;

    Service.deleteProduct(id)
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      })
      .catch(() => alert("Erro ao excluir"));
  }

  function handleUpdate(updated: Product) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingProduct(null);
  }

  return (
    <div className="container">
      <ProductForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingProduct={editingProduct}
      />

      <h2>Produtos</h2>

      <div className="grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => setEditingProduct(product)}
            onDelete={() => handleDelete(product.id)}
          />
        ))}
      </div>
    </div>
  );
}
