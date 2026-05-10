import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Product } from "../types/Product";
import * as Service from "../services/api";
import { addToCart } from "../services/cartApi";
import "./ProductDetails.css";

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Service.getProductById(Number(id))
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="details-loading">Carregando produto...</p>;
  }

  if (!product) {
    return (
      <div className="details-container">
        <h2>Produto não encontrado</h2>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    );
  }

  return (
    <>
      <div className="details-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <div className="details-card">
          <div className="details-image-area">
            <img src={product.image_url} alt={product.title} />
          </div>

          <div className="details-info">
            <span className="details-code">{product.subtitle}</span>

            <h1>{product.title}</h1>

            <p className="details-description">
              Aqui você pode colocar uma descrição mais completa do produto,
              informações técnicas, benefícios ou detalhes importantes.
            </p>

            <strong className="details-price">
              R$ {product.price.toFixed(2)}
            </strong>

            <button
              className="details-cart-button"
              onClick={() => addToCart(product.id, 1)}
            >
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
