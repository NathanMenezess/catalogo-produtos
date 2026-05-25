import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import type { Product } from "../types/Product";
import "./StockNotifications.css";

export function StockNotifications() {
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    async function load() {
      const products = await getProducts();

      const alerts = products.filter(
        (p) => Number(p.stock_quantity ?? 0) <= Number(p.min_stock ?? 5),
      );

      setLowStock(alerts);
    }

    load();
  }, []);

  if (!open || lowStock.length === 0) return null;

  return (
    <div className="stock-notification">
      <button
        className="stock-notification-close"
        onClick={() => setOpen(false)}
      >
        ×
      </button>

      <strong>Alerta de reposição</strong>

      <p>Existem {lowStock.length} produto(s) com estoque baixo ou zerado.</p>

      <ul>
        {lowStock.slice(0, 3).map((product) => (
          <li key={product.id}>
            {product.title} — estoque atual: {product.stock_quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
