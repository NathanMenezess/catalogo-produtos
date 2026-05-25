import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../services/api";
import { getMyOrders } from "../services/ordersApi";
import type { Product } from "../types/Product";
import "./Dashboard.css";

type OrderItem = {
  title?: string;
  product_id?: number;
  quantity: number;
};

type Order = {
  id: number;
  total: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
};

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [productsData, ordersData] = await Promise.all([
        getProducts(),
        getMyOrders(),
      ]);

      setProducts(productsData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const paidOrders = orders.filter((order) => order.status === "paid");
    const pendingOrders = orders.filter((order) => order.status === "pending");

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );

    const totalStock = products.reduce(
      (sum, product) => sum + Number(product.stock_quantity ?? 0),
      0,
    );

    const lowStockProducts = products.filter(
      (product) =>
        Number(product.stock_quantity ?? 0) <= Number(product.min_stock ?? 5),
    );

    const outOfStockProducts = products.filter(
      (product) => Number(product.stock_quantity ?? 0) === 0,
    );

    const soldMap: Record<string, number> = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const name = item.title || `Produto #${item.product_id}`;
        soldMap[name] = (soldMap[name] || 0) + Number(item.quantity || 0);
      });
    });

    const bestSeller =
      Object.entries(soldMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Ainda sem vendas";

    return {
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue,
      totalStock,
      lowStockProducts,
      outOfStockProducts,
      bestSeller,
    };
  }, [orders, products]);

  function formatMoney(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function getStockStatus(product: Product) {
    const stock = Number(product.stock_quantity ?? 0);
    const minStock = Number(product.min_stock ?? 5);

    if (stock === 0) return "Sem estoque";
    if (stock <= minStock) return "Reposição";
    return "Normal";
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">Carregando dashboard...</div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-badge">Painel Gerencial</span>
          <h2>Dashboard de Vendas e Estoque</h2>
          <p>
            Acompanhe pedidos, faturamento, produtos mais vendidos e alertas de
            reposição.
          </p>
        </div>

        <button className="dashboard-refresh" onClick={loadDashboard}>
          Atualizar dados
        </button>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <span>Total de pedidos</span>
          <strong>{stats.totalOrders}</strong>
          <p>{stats.pendingOrders} pedidos pendentes</p>
        </article>

        <article className="dashboard-card success">
          <span>Faturamento pago</span>
          <strong>{formatMoney(stats.totalRevenue)}</strong>
          <p>{stats.paidOrders} pedidos pagos</p>
        </article>

        <article className="dashboard-card warning">
          <span>Estoque total</span>
          <strong>{stats.totalStock}</strong>
          <p>{products.length} produtos cadastrados</p>
        </article>

        <article className="dashboard-card danger">
          <span>Alertas de reposição</span>
          <strong>{stats.lowStockProducts.length}</strong>
          <p>{stats.outOfStockProducts.length} produtos zerados</p>
        </article>
      </section>

      <section className="dashboard-panels">
        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Produto mais vendido</h3>
              <p>Baseado nos itens dos pedidos registrados</p>
            </div>
          </div>

          <div className="best-seller-box">
            <span>🏆</span>
            <strong>{stats.bestSeller}</strong>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Resumo de pedidos</h3>
              <p>Situação atual das vendas</p>
            </div>
          </div>

          <div className="order-summary">
            <div>
              <span>Pendentes</span>
              <strong>{stats.pendingOrders}</strong>
            </div>

            <div>
              <span>Pagos</span>
              <strong>{stats.paidOrders}</strong>
            </div>

            <div>
              <span>Total</span>
              <strong>{stats.totalOrders}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h3>Controle de estoque</h3>
            <p>Produtos que precisam de atenção do vendedor</p>
          </div>
        </div>

        <div className="stock-table-wrapper">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Estoque atual</th>
                <th>Estoque mínimo</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const status = getStockStatus(product);

                return (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.title}</strong>
                      <span>{product.subtitle}</span>
                    </td>
                    <td>{product.stock_quantity}</td>
                    <td>{product.min_stock}</td>
                    <td>
                      <span
                        className={`stock-status ${
                          status === "Normal"
                            ? "normal"
                            : status === "Reposição"
                              ? "low"
                              : "empty"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="empty-dashboard">
              Nenhum produto cadastrado ainda.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}