import { useEffect, useState } from "react";
import { ProductCard } from "../components/productCard";
import { getFavorites } from "../services/favoritesApi";
import type { Product } from "../types/Product";
import "./home.css";

export function Favorites() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    try {
      setLoading(true);

      const favorites = await getFavorites();
      setProducts(favorites.map((fav) => fav.product));
    } catch (error) {
      alert("Erro ao carregar favoritos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h2>Meus favoritos</h2>
          <p className="subtitle">{products.length} produto(s) favoritado(s)</p>
        </div>
      </div>

      {loading ? (
        <p>Carregando favoritos...</p>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum produto favoritado</h3>
          <p>Volte para a tela inicial e favorite algum produto.</p>
        </div>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => {}}
              onDelete={() => {}}
              deleting={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
