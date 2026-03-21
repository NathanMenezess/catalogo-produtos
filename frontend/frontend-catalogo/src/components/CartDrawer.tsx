import "./cartDrawer.css";
import { useEffect, useState } from "react";
import {
  getCart,
  updateCartItemByProduct,
  removeCartItem,
  clearCart,
} from "../services/cartApi";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: Props) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) getCart().then(setCart);
  }, [open]);

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
          {!cart || cart.items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Carrinho vazio</p>
              <button className="btn" onClick={onClose}>
                Ver produtos
              </button>
            </div>
          ) : (
            <>
              {cart.items.map((item: any) => (
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
                            updateCartItemByProduct(
                              item.product.id,
                              item.quantity - 1,
                            ).then(setCart)
                          }
                        >
                          -
                        </button>

                        <span className="qty-value">{item.quantity}</span>

                        <button
                          className="qty-btn"
                          onClick={() =>
                            updateCartItemByProduct(
                              item.product.id,
                              item.quantity + 1,
                            ).then(setCart)
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="link-btn"
                        onClick={() => removeCartItem(item.id).then(setCart)}
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
                onClick={() => clearCart().then(setCart)}
                disabled={loading}
              >
                Limpar
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  navigate("/checkout");
                }}
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
