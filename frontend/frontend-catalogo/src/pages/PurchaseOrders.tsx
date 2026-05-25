import { useEffect, useState } from "react";
import {
  createPurchaseOrder,
  createSupplier,
  getPurchaseOrders,
  getSuppliers,
  receivePurchaseOrder,
} from "../services/purchaseApi";
import { getProducts } from "../services/api";
import type { Product } from "../types/Product";
import "./PurchaseOrders.css";

export function PurchaseOrders() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("0");
  const [notes, setNotes] = useState("");

  async function loadData() {
    const [suppliersData, ordersData, productsData] = await Promise.all([
      getSuppliers(),
      getPurchaseOrders(),
      getProducts(),
    ]);

    setSuppliers(suppliersData);
    setOrders(ordersData);
    setProducts(productsData);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateSupplier(e: React.FormEvent) {
    e.preventDefault();

    await createSupplier({
      name: supplierName,
      email: supplierEmail,
      phone: supplierPhone,
    });

    setSupplierName("");
    setSupplierEmail("");
    setSupplierPhone("");

    await loadData();
    alert("Fornecedor cadastrado com sucesso!");
  }

  async function handleCreatePurchaseOrder(e: React.FormEvent) {
    e.preventDefault();

    await createPurchaseOrder({
      supplier_id: Number(selectedSupplier),
      notes,
      items: [
        {
          product_id: Number(selectedProduct),
          quantity: Number(quantity),
          unit_cost: Number(unitCost),
        },
      ],
    });

    setSelectedSupplier("");
    setSelectedProduct("");
    setQuantity("1");
    setUnitCost("0");
    setNotes("");

    await loadData();
    alert("Ordem de compra criada com sucesso!");
  }

  async function handleReceiveOrder(id: number) {
    await receivePurchaseOrder(id);
    await loadData();
    alert("Compra recebida e estoque atualizado!");
  }

  function formatMoney(value: number) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <main className="purchase-page">
      <section className="purchase-hero">
        <div>
          <span>Gestão de Compras</span>
          <h2>Fornecedores e Ordens de Compra</h2>
          <p>
            Cadastre fornecedores, crie pedidos de reposição e atualize o
            estoque automaticamente.
          </p>
        </div>
      </section>

      <section className="purchase-grid">
        <form className="purchase-card" onSubmit={handleCreateSupplier}>
          <h3>Cadastrar Fornecedor</h3>

          <input
            placeholder="Nome do fornecedor"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            required
          />

          <input
            placeholder="E-mail"
            value={supplierEmail}
            onChange={(e) => setSupplierEmail(e.target.value)}
          />

          <input
            placeholder="Telefone"
            value={supplierPhone}
            onChange={(e) => setSupplierPhone(e.target.value)}
          />

          <button type="submit">Cadastrar fornecedor</button>
        </form>

        <form className="purchase-card" onSubmit={handleCreatePurchaseOrder}>
          <h3>Criar Ordem de Compra</h3>

          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            required
          >
            <option value="">Selecione o fornecedor</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>

          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            required
          >
            <option value="">Selecione o produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title} — estoque atual: {product.stock_quantity}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantidade"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Custo unitário"
            value={unitCost}
            min="0"
            step="0.01"
            onChange={(e) => setUnitCost(e.target.value)}
            required
          />

          <textarea
            placeholder="Observações"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button type="submit">Criar ordem</button>
        </form>
      </section>

      <section className="purchase-table-card">
        <h3>Ordens de Compra</h3>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fornecedor</th>
              <th>Comprador</th>
              <th>Status</th>
              <th>Total</th>
              <th>Itens</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.supplier_name}</td>
                <td>{order.buyer_name}</td>
                <td>
                  <span
                    className={
                      order.status === "received"
                        ? "status received"
                        : "status pending"
                    }
                  >
                    {order.status === "received" ? "Recebida" : "Pendente"}
                  </span>
                </td>
                <td>{formatMoney(order.total)}</td>
                <td>
                  {order.items?.map((item: any) => (
                    <div key={item.id}>
                      {item.product_title} — {item.quantity} un.
                    </div>
                  ))}
                </td>
                <td>
                  {order.status !== "received" && (
                    <button
                      className="receive-btn"
                      onClick={() => handleReceiveOrder(order.id)}
                    >
                      Receber
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="empty-orders">Nenhuma ordem de compra criada.</p>
        )}
      </section>
    </main>
  );
}
