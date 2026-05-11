import { useEffect, useMemo, useState } from "react";
import { getMyOrders } from "../services/ordersApi";

import { useNavigate } from "react-router-dom";
import "./Orders.css";
import { getRole } from "../services/authStorage";
import Swal from "sweetalert2";

// MUI
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

type OrderItem = {
  id?: number;
  product_id?: number;
  title?: string;
  quantity?: number;
};

type Order = {
  id: number;
  total?: number;
  status?: "pending" | "paid" | string;
  created_at?: string;
  notes?: string;

  shipping_name?: string;
  shipping_phone?: string;
  shipping_cep?: string;
  shipping_street?: string;
  shipping_number?: string;
  shipping_district?: string;
  shipping_city?: string;
  shipping_state?: string;

  items?: OrderItem[];
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // MUI Select states
  const [filter, setFilter] = useState<"all" | "withItems" | "noItems">("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "totalDesc" | "totalAsc"
  >("newest");

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e: any) {
        Swal.fire("Erro", e?.message || "Erro ao carregar pedidos", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visibleOrders = useMemo(() => {
    const filtered = orders.filter((o) => {
      const count = o.items?.length ?? 0;

      if (filter === "withItems") return count > 0;
      if (filter === "noItems") return count === 0;
      return true;
    });

    const toDate = (s?: string) => {
      const d = s ? new Date(s).getTime() : 0;
      return Number.isFinite(d) ? d : 0;
    };

    const toTotal = (v?: number) => Number(v ?? 0);

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "newest")
        return toDate(b.created_at) - toDate(a.created_at);
      if (sortBy === "oldest")
        return toDate(a.created_at) - toDate(b.created_at);
      if (sortBy === "totalDesc") return toTotal(b.total) - toTotal(a.total);
      return toTotal(a.total) - toTotal(b.total); // totalAsc
    });

    return sorted;
  }, [orders, filter, sortBy]);

  if (loading)
    return (
      <div className="orders-page">
        <div className="orders-loading">Carregando pedidos...</div>
      </div>
    );

  return (
    <div className="orders-page">
      <div className="orders-header">
        <button
          onClick={() => {
            const role = getRole();
            navigate(
              role === "admin" || role === "vendedor"
                ? "/admin/products"
                : "/home",
            );
          }}
          className="orders-back"
        >
          ← Voltar
        </button>

        <div className="orders-titleWrap">
          <h2 className="orders-title">Meus pedidos</h2>
          <p className="orders-subtitle">
            Acompanhe seus pedidos e detalhes de compra
          </p>

          {/* Controls (MUI Selects) */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: 180,
                background: "#fff",
                borderRadius: "12px",
              }}
            >
              <InputLabel id="filter-label">Filtro</InputLabel>
              <Select
                labelId="filter-label"
                label="Filtro"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="withItems">Com itens</MenuItem>
                <MenuItem value="noItems">Sem itens</MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: 220,
                background: "#fff",
                borderRadius: "12px",
              }}
            >
              <InputLabel id="sort-label">Ordenar</InputLabel>
              <Select
                labelId="sort-label"
                label="Ordenar"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <MenuItem value="newest">Mais recentes</MenuItem>
                <MenuItem value="oldest">Mais antigos</MenuItem>
                <MenuItem value="totalDesc">Maior total</MenuItem>
                <MenuItem value="totalAsc">Menor total</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </div>

      {visibleOrders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-emptyTitle">Nenhum pedido ainda</div>
          <div className="orders-emptyText">
            Quando você finalizar uma compra, ela vai aparecer aqui.
          </div>
          <button className="orders-cta" onClick={() => navigate("/home")}>
            Ver produtos
          </button>
        </div>
      ) : (
        <div className="orders-grid">
          {visibleOrders.map((o) => {
            const created = o.created_at
              ? new Date(o.created_at).toLocaleString("pt-BR")
              : "";

            return (
              <div key={o.id} className="order-card">
                <div className="order-cardTop">
                  <div className="order-id">Pedido #{o.id}</div>
                  <span
                    className={
                      o.status === "paid"
                        ? "order-badge order-badge-paid"
                        : "order-badge order-badge-pending"
                    }
                  >
                    {o.status === "paid" ? "Pago" : "Pendente"}
                  </span>
                </div>

                <div className="order-meta">
                  <div className="order-metaItem">
                    <div className="order-metaLabel">Total</div>
                    <div className="order-metaValue">
                      R$ {Number(o.total || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="order-metaItem">
                    <div className="order-metaLabel">Itens</div>
                    <div className="order-metaValue">
                      {o.items?.length ?? 0}
                    </div>
                  </div>
                </div>

                <div className="order-date">
                  <span className="order-dateLabel">Data:</span>{" "}
                  <span className="order-dateValue">{created}</span>
                </div>

                <button
                  onClick={() => setSelectedOrder(o)}
                  className="details-button"
                >
                  Ver detalhes
                </button>

                {o.status === "pending" && (
                  <button
                    className="order-payButton"
                    onClick={() => navigate(`/payment/${o.id}`)}
                  >
                    Pagar agora
                  </button>
                )}

                {!!o.items?.length && (
                  <details className="order-details">
                    <summary className="order-summary">Ver itens</summary>

                    <ul className="order-items">
                      {o.items.map((it: any, idx: number) => (
                        <li key={it.id ?? idx} className="order-itemRow">
                          <span className="order-itemTitle">
                            {it.title ?? `Produto #${it.product_id}`}
                          </span>
                          <span className="order-itemQty">
                            x{it.quantity ?? 1}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
      {selectedOrder && (
        <div className="details-modal">
          <div className="details-content">
            <h2>Detalhes do Pedido</h2>

            <p>
              <strong>Cliente:</strong>{" "}
              {selectedOrder.shipping_name || "Não informado"}
            </p>

            <p>
              <strong>Telefone:</strong>{" "}
              {selectedOrder.shipping_phone || "Não informado"}
            </p>

            <p>
              <strong>Endereço:</strong>{" "}
              {selectedOrder.shipping_street || "Rua não informada"},{" "}
              {selectedOrder.shipping_number || "s/n"} -{" "}
              {selectedOrder.shipping_district || "Bairro não informado"},{" "}
              {selectedOrder.shipping_city || "Cidade não informada"} /{" "}
              {selectedOrder.shipping_state || "UF não informada"}
            </p>

            <p>
              <strong>CEP:</strong>{" "}
              {selectedOrder.shipping_cep || "Não informado"}
            </p>

            <p>
              <strong>Observações:</strong> {selectedOrder.notes || "Nenhuma"}
            </p>

            <h3>Itens</h3>

            {selectedOrder.items?.map((item: any, idx: number) => (
              <div key={item.id ?? idx}>
                {item.title ?? `Produto #${item.product_id}`} -{" "}
                {item.quantity ?? 1}x
              </div>
            ))}

            <h3>Total: R$ {Number(selectedOrder.total || 0).toFixed(2)}</h3>

            <button className="danger" onClick={() => setSelectedOrder(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
