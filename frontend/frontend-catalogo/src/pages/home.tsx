import Swal from "sweetalert2";
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
    Service.getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(product: Product) {
    setProducts((prev) => [...prev, product]);

    Swal.fire({
      title: "Sucesso!",
      text: "Produto cadastrado com sucesso.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  }
  function handleDelete(id: number) {
    Swal.fire({
      title: "Tem certeza?",
      text: "Essa ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (!result.isConfirmed) return;

      setDeletingId(id);

      Service.deleteProduct(id)
        .then(() => {
          setProducts((prev) => prev.filter((p) => p.id !== id));

          Swal.fire({
            title: "Excluído!",
            text: "O produto foi removido com sucesso.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        })
        .catch(() => {
          Swal.fire({
            title: "Erro",
            text: "Não foi possível excluir o produto.",
            icon: "error",
          });
        })
        .finally(() => setDeletingId(null));
    });
  }

  function handleUpdate(updated: Product) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    setEditingProduct(null);

    Swal.fire({
      title: "Atualizado!",
      text: "Produto atualizado com sucesso.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
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
      {" "}
      <ProductForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingProduct={editingProduct}
      />{" "}
      <h2>Produtos</h2> {/* Campo de busca */}{" "}
      <input
        className="search-input"
        type="text"
        placeholder="Buscar por título..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />{" "}
      {/* Campo de busca por codigo */}{" "}
      <input
        className="search-input"
        type="text"
        placeholder="Buscar por código..."
        value={buscarCodigo}
        onChange={(e) => setBuscarCodigo(e.target.value)}
      />{" "}
      {loading ? (
        <p className="loading">Carregando produtos...</p>
      ) : (
        <div className="grid">
          {" "}
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => setEditingProduct(product)}
              onDelete={() => handleDelete(product.id)}
              deleting={deletingId === product.id}
            />
          ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
