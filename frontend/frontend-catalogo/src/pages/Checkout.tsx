import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getCart } from "../services/cartApi";
import { getMe } from "../services/authApi";
import { createOrder } from "../services/ordersApi";
import "./Checkout.css";

import { getRole } from "../services/authStorage";
import {
  getCustomers,
  getSellers,
  type UserOption,
} from "../services/usersApi";

export function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any>(null);

  const role = getRole();

  const [customers, setCustomers] = useState<UserOption[]>([]);
  const [sellers, setSellers] = useState<UserOption[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [sellerId, setSellerId] = useState("");

  // Campos do checkout
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [stateUF, setStateUF] = useState("");
  const [notes, setNotes] = useState("");

  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    async function loadUserAddress() {
      try {
        const me = await getMe();

        setName(me.name ?? "");
        setPhone(me.phone ?? "");
        setCep(me.cep ?? "");
        setStreet(me.street ?? "");
        setNumber(me.number ?? "");
        setDistrict(me.district ?? "");
        setCity(me.city ?? "");
        setStateUF(me.state_uf ?? "");
      } catch (error) {
        console.log("Não foi possível carregar endereço do perfil", error);
      }
    }

    loadUserAddress();
  }, []);

  async function buscarCep(cepDigitado: string) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );

      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado");
        return;
      }

      setCep(data.cep);
      setStreet(data.logradouro);
      setDistrict(data.bairro);
      setCity(data.localidade);
      setStateUF(data.uf);
    } catch (error) {
      alert("Erro ao buscar CEP");
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const c = await getCart();
        setCart(c);

        if (!c?.items?.length) {
          Swal.fire(
            "Carrinho vazio",
            "Adicione itens antes de finalizar.",
            "info",
          );
          navigate("/home");
          return;
        }
      } catch (e: any) {
        Swal.fire("Erro", e?.message || "Erro ao carregar carrinho", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (role === "vendedor" || role === "admin") {
      getCustomers().then(setCustomers).catch(console.error);
    }

    if (role === "cliente" || role === "admin") {
      getSellers().then(setSellers).catch(console.error);
    }
  }, [role]);

  async function onConfirm() {
    if (
      !name ||
      !phone ||
      !cep ||
      !street ||
      !number ||
      !district ||
      !city ||
      !stateUF
    ) {
      Swal.fire(
        "Faltando dados",
        "Preencha todos os campos obrigatórios do checkout.",
        "warning",
      );
      return;
    }

    setPlacing(true);
    try {
      const order = await createOrder({
        customer_id: customerId ? Number(customerId) : null,
        seller_id: sellerId ? Number(sellerId) : null,
        shipping: {
          name,
          phone,
          cep,
          street,
          number,
          district,
          city,
          state: stateUF,
        },
        notes,
      });

      Swal.fire(
        "Pedido criado!",
        "Agora realize o pagamento para confirmar sua compra.",
        "success",
      );

      navigate(`/payment/${order.id}`);
    } catch (e: any) {
      Swal.fire("Erro", e?.message || "Erro ao finalizar compra", "error");
    } finally {
      setPlacing(false);
    }
  }

  if (loading)
    return (
      <div className="checkout-page">
        <div className="checkout-card">Carregando...</div>
      </div>
    );

  const total = Number(cart?.total || 0);

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="checkout-back" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <div>
          <h2 className="checkout-title">Checkout</h2>
          <p className="checkout-subtitle">
            Confirme seus dados antes de finalizar
          </p>
        </div>
      </div>

      <div className="checkout-grid">
        <div className="checkout-card">
          <h3 className="checkout-sectionTitle">Dados da venda</h3>

          {(role === "vendedor" || role === "admin") && (
            <select
              className="checkout-input"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Cliente relacionado (opcional)</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
          )}

          {(role === "cliente" || role === "admin") && (
            <select
              className="checkout-input"
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
            >
              <option value="">Vendedor relacionado (opcional)</option>
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {seller.name} - {seller.email}
                </option>
              ))}
            </select>
          )}

          <h3 className="checkout-sectionTitle">Endereço de entrega</h3>

          <div className="checkout-row2">
            <input
              className="checkout-input"
              placeholder="Nome completo *"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="checkout-input"
              placeholder="Telefone *"
              value={phone}
              required
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="checkout-row2">
            <input
              className="checkout-input checkout-cep-input"
              type="text"
              placeholder="Digite o CEP para preencher o endereço *"
              value={cep}
              maxLength={9}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");

                if (value.length > 5) {
                  value = value.replace(/^(\d{5})(\d)/, "$1-$2");
                }

                setCep(value);

                buscarCep(value);
              }}
              required
            />

            <input
              className="checkout-input"
              type="text"
              placeholder="Estado *"
              value={stateUF}
              required
              onChange={(e) => setStateUF(e.target.value)}
            />
          </div>

          <input
            className="checkout-input"
            type="text"
            placeholder="Rua / Avenida *"
            value={street}
            required
            onChange={(e) => setStreet(e.target.value)}
          />

          <div className="checkout-row2">
            <input
              className="checkout-input"
              placeholder="Número *"
              value={number}
              required
              onChange={(e) => setNumber(e.target.value)}
            />
            <input
              className="checkout-input"
              type="text"
              placeholder="Bairro *"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          <div className="checkout-row2">
            <input
              className="checkout-input"
              type="text"
              placeholder="Cidade *"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              className="checkout-input"
              placeholder="Complemento / Observação"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="checkout-card">
          <h3 className="checkout-sectionTitle">Resumo</h3>

          <div className="checkout-summary">
            <div className="checkout-line">
              <span>Itens</span>
              <b>{cart?.items?.length ?? 0}</b>
            </div>
            <div className="checkout-line">
              <span>Total</span>
              <b>R$ {total.toFixed(2)}</b>
            </div>
          </div>

          <button
            type="button"
            className="checkout-confirm"
            disabled={placing}
            onClick={onConfirm}
          >
            {placing ? "Finalizando..." : "Confirmar e criar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}
