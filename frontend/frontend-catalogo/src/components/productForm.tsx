import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { Product } from "../types/Product";
import "./productForm.css";
import * as Service from "../services/api";

interface Props {
  onAdd: (product: Product) => void;
  editingProduct: Product | null;
}

export function ProductForm({ onAdd, editingProduct }: Props) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title);
      setSubtitle(editingProduct.subtitle);
      setPrice(editingProduct.price.toString());
      setPreview(editingProduct.imageUrl);
    }
  }, [editingProduct]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  }

  useEffect(() => {
    if (!image) return;

    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!image) {
      alert("Selecione uma imagem");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("price", price);
    formData.append("image", image);

    try {
      const product = await Service.createProduct(formData);
      onAdd(product);
    } catch (error) {
      alert("Erro ao salvar produto");
      console.error(error);
    }

    setTitle("");
    setSubtitle("");
    setPrice("");
    setImage(null);
    setPreview(null);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>{editingProduct ? "Editar Produto" : "Novo Produto"}</h3>

      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Subtítulo"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Preço"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <input type="file" accept="image/*" onChange={handleImageChange} />

      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" />
        </div>
      )}

      <button type="submit">
        {editingProduct ? "Atualizar" : "Adicionar"}
      </button>
    </form>
  );
}
