import { useEffect, useState } from "react";
import "./home.css";
import { ProductCard } from "../components/productCard";
import { ProductForm } from "../components/productForm";
import type { Product } from "../types/Product";
import * as Service from "../services/api";

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(""); // estado para a busca

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

  // Filtra os produtos com base no título
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <ProductForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingProduct={editingProduct}
      />

      <h2>Produtos</h2>

      {/* Campo de busca */}
      <input
        className="search-input"
        type="text"
        placeholder="Buscar por título..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        // style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      />

      <div className="grid">
        {filteredProducts.map((product) => (
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
