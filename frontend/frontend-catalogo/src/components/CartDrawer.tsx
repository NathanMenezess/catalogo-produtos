import "./cartDrawer.css";
import { useEffect, useState } from "react";
import {
  getCart,
  updateCartItemByProduct,
  removeCartItem,
  clearCart,
} from "../services/cartApi";
import { useNavigate } from "react-router-dom";

type Product = {
  id: number;
  title: string;
  price: number | string;
  image_url: string;
};

type CartItem = {
  id: number;
  quantity: number;
  product: Product;
};

type Cart = {
  items: CartItem[];
  total: number | string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: Props) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function loadCart() {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      loadCart();
    }
  }, [open]);

  async function handleUpdateQuantity(productId: number, newQuantity: number) {
    if (newQuantity < 1) return;

    try {
      setLoading(true);
      const updatedCart = await updateCartItemByProduct(productId, newQuantity);
      setCart(updatedCart);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveItem(itemId: number) {
    try {
      setLoading(true);
      const updatedCart = await removeCartItem(itemId);
      setCart(updatedCart);
    } catch (error) {
      console.error("Erro ao remover item:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleClearCart() {
    try {
      setLoading(true);
      const updatedCart = await clearCart();
      setCart(updatedCart);
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleCheckout() {
    setLoading(true);
    onClose();
    navigate("/checkout");
  }

  if (!open) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div>
            <h2>Carrinho</h2>
            <small>{cart?.items?.length || 0} item(ns)</small>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            ✖
          </button>
        </div>

        <div className="cart-body">
          {loading && !cart ? (
            <div className="cart-empty">
              <p>Carregando carrinho...</p>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Carrinho vazio</p>
              <button className="btn" onClick={onClose}>
                Ver produtos
              </button>
            </div>
          ) : (
            <>
              {cart.items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    className="cart-img"
                    src={item.product.image_url}
                    alt={item.product.title}
                  />

                  <div className="cart-info">
                    <div className="cart-title-row">
                      <strong className="cart-title">
                        {item.product.title}
                      </strong>
                      <span className="cart-price">
                        R$ {Number(item.product.price).toFixed(2)}
                      </span>
                    </div>

                    <div className="cart-actions">
                      <div className="qty">
                        <button
                          className="qty-btn"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product.id,
                              item.quantity - 1,
                            )
                          }
                          disabled={loading || item.quantity <= 1}
                        >
                          -
                        </button>

                        <span className="qty-value">{item.quantity}</span>

                        <button
                          className="qty-btn"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product.id,
                              item.quantity + 1,
                            )
                          }
                          disabled={loading}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="link-btn"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={loading}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <strong>R$ {Number(cart.total).toFixed(2)}</strong>
            </div>

            <div className="cart-footer-buttons">
              <button
                className="btn btn-ghost"
                onClick={handleClearCart}
                disabled={loading}
              >
                {loading ? "Limpando..." : "Limpar"}
              </button>

              <button
                className="btn btn-primary"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Finalizando..." : "Finalizar compra"}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
