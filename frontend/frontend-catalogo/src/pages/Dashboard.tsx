import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import { getMyOrders } from "../services/ordersApi";

export function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const productsData = await getProducts();
      const ordersData = await getMyOrders();

      setProducts(productsData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    }

    load();
  }, []);

  const totalOrders = orders.length;

  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.stock_quantity ?? 0),
    0,
  );

  const lowStockProducts = products.filter(
    (p) => Number(p.stock_quantity ?? 0) <= Number(p.min_stock ?? 5),
  );

  const soldMap: Record<string, number> = {};

  orders.forEach((order) => {
    order.items?.forEach((item: any) => {
      soldMap[item.title] =
        (soldMap[item.title] || 0) + Number(item.quantity || 0);
    });
  });

  const bestSeller =
    Object.entries(soldMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "Ainda sem vendas";

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <div>
          <h3>Total de pedidos</h3>
          <strong>{totalOrders}</strong>
        </div>

        <div>
          <h3>Produto mais vendido</h3>
          <strong>{bestSeller}</strong>
        </div>

        <div>
          <h3>Quantidade em estoque</h3>
          <strong>{totalStock}</strong>
        </div>

        <div>
          <h3>Alertas de reposição</h3>
          <strong>{lowStockProducts.length}</strong>
        </div>
      </div>

      <h3 style={{ marginTop: 32 }}>Produtos com estoque baixo</h3>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Estoque atual</th>
            <th>Estoque mínimo</th>
          </tr>
        </thead>

        <tbody>
          {lowStockProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.stock_quantity}</td>
              <td>{p.min_stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
