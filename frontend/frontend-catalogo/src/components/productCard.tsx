import type { Product } from "../types/Product";
import "./productCard.css";
import { addToCart } from "../services/cartApi";
import { getRole } from "../services/authStorage";


interface Props {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export function ProductCard({ product, onEdit, onDelete, deleting }: Props) {
  const role = getRole();
  const isCliente = role === "cliente";
  const isAdmin = role === "admin";
  const canManage = role === "admin" || role === "vendedor";

  return (
    <div className="card">
      <img src={product.image_url} alt={product.title} />

      <div className="card-content">
        <h3>{product.title}</h3>
        <p>{product.subtitle}</p>
        <strong>R$ {product.price.toFixed(2)}</strong>

        <div className="actions">
          {canManage && (
            <>
              <button className="edit" onClick={onEdit}>
                Editar
              </button>
              <button className="danger" onClick={onDelete} disabled={deleting}>
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </>
          )}
        </div>

        {(isCliente || isAdmin) && (
          <button className="addCart" onClick={() => addToCart(product.id, 1)}>
            Adicionar ao carrinho
          </button>
        )}
      </div>
    </div>
  );
}
