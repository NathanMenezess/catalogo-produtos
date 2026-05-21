import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ProductForm } from "../components/productForm";
import type { Product } from "../types/Product";
import "./home.css";

export function ProductCreate() {
  const navigate = useNavigate();

  function handleAdd(_: Product) {
    Swal.fire({
      title: "Sucesso!",
      text: "Produto cadastrado com sucesso.",
      icon: "success",
      timer: 1800,
      showConfirmButton: false,
    });

    navigate("/admin/products");
  }

  return (
    <div className="container">
      <button className="orders-back" onClick={() => navigate(-1)}>
        ← Voltar
      </button>

      <div className="page-head">
        <div>
          <h2>Adicionar produto</h2>
          <p className="subtitle">Cadastre um novo produto no catálogo.</p>
        </div>
      </div>

      <div className="form-area">
        <ProductForm
          onAdd={handleAdd}
          onUpdate={() => {}}
          editingProduct={null}
          onCancelEdit={() => navigate("/admin/products")}
        />
      </div>
    </div>
  );
}
