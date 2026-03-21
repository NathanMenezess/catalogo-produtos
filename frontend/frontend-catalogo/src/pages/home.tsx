import Swal from "sweetalert2";
import { useEffect, useState, useRef } from "react";
import "./home.css";
import { ProductCard } from "../components/productCard";
import { ProductForm } from "../components/productForm";
import type { Product } from "../types/Product";
import * as Service from "../services/api";

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [buscarCodigo, setBuscarCodigo] = useState<string>(""); 

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

  const formRef = useRef<HTMLDivElement | null>(null);

  function handleEdit(product: Product) {
    setEditingProduct(product);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div className="container">
      <div ref={formRef} className="form-area">
        <ProductForm
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          editingProduct={editingProduct}
          onCancelEdit={() => setEditingProduct(null)}
        />
      </div>

      <div className="page-head">
        <div>
          <h2>Produtos</h2>
          <p className="subtitle">
            {filteredProducts.length} produto(s) encontrado(s)
          </p>
        </div>

        <div className="search-row">
          <input
            className="search-input"
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <input
            className="search-input"
            type="text"
            placeholder="Buscar por código..."
            value={buscarCodigo}
            onChange={(e) => setBuscarCodigo(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-box">
          <div className="spinner" />
          <p>Carregando produtos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente mudar os filtros de busca.</p>
        </div>
      ) : (
        <div className="grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDelete(product.id)}
              deleting={deletingId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
