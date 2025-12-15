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
  const [buscarCodigo, setBuscarCodigo] = useState<string>(""); // estado para a busca

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    Service.getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(product: Product) {
    setProducts((prev) => [...prev, product]);
  }

  function handleDelete(id: number) {
    if (!confirm("Deseja excluir este produto?")) return;

    setDeletingId(id);

    Service.deleteProduct(id)
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      })
      .catch(() => alert("Erro ao excluir"))
      .finally(() => setDeletingId(null));
  }

  function handleUpdate(updated: Product) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingProduct(null);
  }

  const filteredProducts = products.filter((product) => {
    const tituloMatch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const codigoMatch = product.subtitle
      .toLowerCase()
      .includes(buscarCodigo.toLowerCase());

    return tituloMatch && codigoMatch;
  });

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
      />

      {/* Campo de busca por codigo */}
      <input
        className="search-input"
        type="text"
        placeholder="Buscar por código..."
        value={buscarCodigo}
        onChange={(e) => setBuscarCodigo(e.target.value)}
      />

      {loading ? (
        <p className="loading">Carregando produtos...</p>
      ) : (
        <div className="grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => setEditingProduct(product)}
              onDelete={() => handleDelete(product.id)}
              deleting={deletingId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
