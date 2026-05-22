import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Product } from "../types/Product";
import * as Service from "../services/api";
import { addToCart } from "../services/cartApi";
import { getRole } from "../services/authStorage";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favoritesApi";
import "./ProductDetails.css";

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const role = getRole();
  const isCliente = role === "cliente";
  const isAdmin = role === "admin";
  const isVendedor = role === "vendedor";
  const canBuy = isCliente || isAdmin || isVendedor;
  const canManage = role === "admin" || role === "vendedor";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    Service.getProductById(Number(id))
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (!canBuy) return;

    getFavorites()
      .then((favorites) => {
        const exists = favorites.some((fav) => fav.product_id === Number(id));
        setIsFavorited(exists);
      })
      .catch(() => setIsFavorited(false));
  }, [id, canBuy]);

  async function handleFavorite() {
    if (!product) return;

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

  async function handleDelete() {
    if (!product) return;

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir "${product.title}"?`,
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await Service.deleteProduct(product.id);
      navigate(canManage ? "/admin/products" : "/home");
    } catch (error) {
      alert("Erro ao excluir produto");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="details-loading">Carregando produto...</p>;
  }

  if (!product) {
    return (
      <div className="details-container">
        <h2>Produto não encontrado</h2>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    );
  }

  return (
    <div className="details-container">
      <button className="orders-back" onClick={() => navigate(-1)}>
        ← Voltar
      </button>

      <div className="details-card">
        <div className="details-image-area">
          <img src={product.image_url} alt={product.title} />
        </div>

        <div className="details-info">
          <span className="details-code">{product.subtitle}</span>
          {product.category && (
            <span className="details-category">{product.category}</span>
          )}
          <h1>{product.title}</h1>

          <p className="details-description">
            {product.description ||
              "Este produto ainda não possui descrição detalhada."}
          </p>

          <strong className="details-price">
            R$ {product.price.toFixed(2)}
          </strong>

          {canBuy && (
            <>
              <button
                className={
                  isFavorited ? "details-favorite active" : "details-favorite"
                }
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
                className="details-cart-button"
                onClick={() => addToCart(product.id, 1)}
              >
                Adicionar ao carrinho
              </button>
            </>
          )}

          {canManage && (
            <div className="details-admin-actions">
              <button
                className="details-edit-button"
                onClick={() => navigate(`/admin/products/edit/${product.id}`)}
              >
                Editar produto
              </button>

              <button
                className="details-delete-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir produto"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
