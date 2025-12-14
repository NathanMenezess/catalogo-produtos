import type { Product } from "../types/Product";
import "./productCard.css";

interface Props {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductCard({ product, onEdit, onDelete }: Props) {
  return (
    <div className="card">
      <img
        src={`https://catalogo-produtos-ocyr.onrender.com/${product.image_url}`}
        alt={product.title}
      />

      <div className="card-content">
        <h3>{product.title}</h3>
        <p>{product.subtitle}</p>
        <strong>R$ {product.price.toFixed(2)}</strong>

        <div className="actions">
          <button className="edit" onClick={onEdit}>
            Editar
          </button>
          <button className="delete" onClick={onDelete}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
