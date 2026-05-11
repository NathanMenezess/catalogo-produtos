import { QRCodeCanvas } from "qrcode.react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { simulatePayment } from "../services/ordersApi";
import "./Payment.css";

export function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const qrText = `PAGAMENTO_SIMULADO_PEDIDO_${id}`;

  async function handlePayment() {
    if (!id) return;

    try {
      await simulatePayment(Number(id));

      Swal.fire(
        "Pagamento confirmado!",
        "Seu pedido foi marcado como pago.",
        "success",
      );

      navigate("/orders");
    } catch (error: any) {
      Swal.fire(
        "Erro",
        error?.message || "Erro ao confirmar pagamento",
        "error",
      );
    }
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>Pagamento do Pedido #{id}</h2>

        <p className="payment-text">
          Escaneie o QR Code abaixo para simular o pagamento.
        </p>

        <div className="payment-qrcode">
          <QRCodeCanvas value={qrText} size={220} />
        </div>

        <p className="payment-copy">
          Código: <strong>{qrText}</strong>
        </p>

        <button className="payment-button" onClick={handlePayment}>
          Simular pagamento
        </button>
      </div>
    </div>
  );
}
