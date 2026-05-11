import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getCart } from "../services/cartApi";
import { createOrder } from "../services/ordersApi";
import "./Checkout.css";

export function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any>(null);

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

  async function onConfirm() {
    if (!street || !number || !district || !city || !stateUF || !cep) {
      Swal.fire("Faltando dados", "Preencha o endereço completo.", "warning");
      return;
    }

    setPlacing(true);
    try {
      const order = await createOrder({
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
          <h3 className="checkout-sectionTitle">Endereço de entrega</h3>

          <div className="checkout-row2">
            <input
              className="checkout-input"
              placeholder="Nome (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="checkout-input"
              placeholder="Telefone (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="checkout-row2">
            <input
              className="checkout-input"
              type="text"
              placeholder="CEP"
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
              placeholder="Estado"
              value={stateUF}
              onChange={(e) => setStateUF(e.target.value)}
            />
          </div>

          <input
            className="checkout-input"
            type="text"
            placeholder="Rua / Avenida"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />

          <div className="checkout-row2">
            <input
              className="checkout-input"
              placeholder="Número"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
            <input
              className="checkout-input"
              type="text"
              placeholder="Bairro"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          <div className="checkout-row2">
            <input
              className="checkout-input"
              type="text"
              placeholder="Cidade"
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
