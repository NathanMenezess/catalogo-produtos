import type { Product } from "../types/Product";
import "./productCard.css";

interface Props {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export function ProductCard({ product, onEdit, onDelete, deleting }: Props) {
  return (
    <div className="card">
      <img src={`${product.image_url}`} alt={product.title} />

      <div className="card-content">
        <h3>{product.title}</h3>
        <p>{product.subtitle}</p>
        <strong>R$ {product.price.toFixed(2)}</strong>

        <div className="actions">
          <button className="edit" onClick={onEdit}>
            Editar
          </button>
          <button onClick={onDelete} disabled={deleting}>
            {deleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
