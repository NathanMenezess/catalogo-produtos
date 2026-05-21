import { useEffect, useState } from "react";
import type { Product } from "../types/Product";
import "./productCard.css";
import { addToCart } from "../services/cartApi";
import { getRole } from "../services/authStorage";
import { useNavigate } from "react-router-dom";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favoritesApi";

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
  const navigate = useNavigate();

  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (!isCliente && !isAdmin) return;

    getFavorites()
      .then((favorites) => {
        const exists = favorites.some((fav) => fav.product_id === product.id);
        setIsFavorited(exists);
      })
      .catch(() => {
        setIsFavorited(false);
      });
  }, [product.id, isCliente, isAdmin]);

  async function handleFavorite(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();

    try {
      setFavoriteLoading(true);

      if (isFavorited) {
        await removeFavorite(product.id);
        setIsFavorited(false);
      } else {
        await addFavorite(product.id);
        setIsFavorited(true);
      }
    } catch (error) {
      alert("Erro ao atualizar favorito");
    } finally {
      setFavoriteLoading(false);
    }
  }

  return (
    <div className="card" onClick={() => navigate(`/products/${product.id}`)}>
      <img src={product.image_url} alt={product.title} />

      <div className="card-content">
        <h3>{product.title}</h3>
        <p>{product.subtitle}</p>
        {product.category && (
          <span className="product-category">{product.category}</span>
        )}
        <strong>R$ {product.price.toFixed(2)}</strong>

        <div className="actions">
          {canManage && (
            <>
              <button
                className="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Editar
              </button>

              <button
                className="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </>
          )}
        </div>

        {(isCliente || isAdmin) && (
          <>
            <button
              className={isFavorited ? "favorite active" : "favorite"}
              onClick={handleFavorite}
              disabled={favoriteLoading}
            >
              {favoriteLoading
                ? "Carregando..."
                : isFavorited
                  ? "❤️ Favoritado"
                  : "🤍 Favoritar"}
            </button>

            <button
              className="addCart"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product.id, 1);
              }}
            >
              Adicionar ao carrinho
            </button>
          </>
        )}
      </div>
    </div>
  );
}
