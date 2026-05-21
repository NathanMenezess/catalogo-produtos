import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import { ProductCard } from "../components/productCard";
import type { Product } from "../types/Product";
import * as Service from "../services/api";
import { getRole } from "../services/authStorage";

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [buscarCodigo, setBuscarCodigo] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const navigate = useNavigate();
  const role = getRole();
  const canManage = role === "admin" || role === "vendedor";

  useEffect(() => {
    Service.getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
              onEdit={() => navigate(`/admin/products/edit/${product.id}`)}
              onDelete={() => handleDelete(product.id)}
              deleting={deletingId === product.id}
            />
          ))}
        </div>
      )}

      {canManage && (
        <button
          className="floating-add-button"
          onClick={() => navigate("/admin/products/new")}
          title="Adicionar produto"
        >
          +
        </button>
      )}
    </div>
  );
}
