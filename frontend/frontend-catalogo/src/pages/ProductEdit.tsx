import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductForm } from "../components/productForm";
import type { Product } from "../types/Product";
import * as Service from "../services/api";
import "./home.css";

export function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Service.getProductById(Number(id))
      .then(setProduct)
      .catch(() => {
        Swal.fire({
          title: "Erro",
          text: "Produto não encontrado.",
          icon: "error",
        });

        navigate("/admin/products");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  function handleUpdate(_: Product) {
    Swal.fire({
      title: "Atualizado!",
      text: "Produto atualizado com sucesso.",
      icon: "success",
      timer: 1800,
      showConfirmButton: false,
    });

    navigate("/admin/products");
  }

  if (loading) {
    return (
      <div className="container">
        <p>Carregando produto...</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container">
      <button className="orders-back" onClick={() => navigate(-1)}>
        ← Voltar
      </button>

      <div className="page-head">
        <div>
          <h2>Editar produto</h2>
          <p className="subtitle">Atualize as informações do produto.</p>
        </div>
      </div>

      <div className="form-area">
        <ProductForm
          onAdd={() => {}}
          onUpdate={handleUpdate}
          editingProduct={product}
          onCancelEdit={() => navigate("/admin/products")}
        />
      </div>
    </div>
  );
}
