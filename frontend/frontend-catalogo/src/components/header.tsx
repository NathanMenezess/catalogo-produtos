import { CartDrawer } from "./CartDrawer";
import "./header.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, getCartCount } from "../services/cartApi";
import { clearToken, getRole } from "../services/authStorage";

export function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(() => getCartCount());

  const role = getRole();
  const isAdmin = role === "admin";
  const isCliente = role === "cliente";
  const isClienteOuAdmin = isCliente || isAdmin;
  const isAdminOrVendedor = role === "admin" || role === "vendedor";

  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  function logout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    // valor inicial (caso já esteja salvo)
    setCartCount(getCartCount());

    function onCartChanged(e: any) {
      const next = Number(e?.detail?.count);
      if (Number.isFinite(next)) setCartCount(next);
      else setCartCount(getCartCount());
    }

    window.addEventListener("cart:changed", onCartChanged);

    // se for cliente, busca do servidor ao carregar (pra ficar correto no refresh)
    if (isCliente) {
      getCart().catch(() => {});
    }

    return () => window.removeEventListener("cart:changed", onCartChanged);
  }, [isCliente]);

  return (
    <>
      <header className="header">
        <div
          className="header-left"
          style={{ cursor: "pointer" }}
          onClick={() =>
            navigate(isAdminOrVendedor ? "/admin/products" : "/home")
          }
        >
          <h1>Catálogo de Produtos</h1>
          <p>
            {isAdminOrVendedor
              ? "Painel de produtos"
              : "Confira os produtos disponíveis"}
          </p>
        </div>

        <div className="header-right">
          {/*  Carrinho só para cliente */}
          {isClienteOuAdmin && (
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              🛒 Carrinho
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}

          {/* Menu Perfil */}
          <div className="profile-wrapper" ref={menuRef}>
            <button
              className="profile-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Abrir menu do perfil"
            >
              👤
            </button>

            <div className={`profile-menu ${menuOpen ? "open" : ""}`}>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
              >
                Perfil
              </button>

              {/* Meus pedidos só para cliente */}
              {isClienteOuAdmin && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/orders");
                  }}
                >
                  Meus pedidos
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/admin/users");
                  }}
                >
                  Usuários
                </button>
              )}

              <button className="danger" onClick={logout}>
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {isClienteOuAdmin && (
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      )}
    </>
  );
}
