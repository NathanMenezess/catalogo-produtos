import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { Product } from "../types/Product";
import "./productForm.css";
import * as Service from "../services/api";

interface Props {
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  editingProduct: Product | null;
}

export function ProductForm({ onAdd, onUpdate, editingProduct }: Props) {
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
      setPreview(editingProduct.image_url);
      setImage(null); // imagem opcional no editar
    }
  }, [editingProduct]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("price", price);

    if (image) {
      formData.append("image", image);
    }

    try {
      if (editingProduct) {
        const updated = await Service.updateProduct(
          editingProduct.id,
          formData
        );
        onUpdate(updated);
      } else {
        if (!image) {
          alert("Selecione uma imagem");
          return;
        }

        const product = await Service.createProduct(formData);
        onAdd(product);
      }

      // reset
      setTitle("");
      setSubtitle("");
      setPrice("");
      setImage(null);
      setPreview(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar produto");
    }
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
