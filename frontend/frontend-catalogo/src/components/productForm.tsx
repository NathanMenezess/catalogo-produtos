import {
  useEffect,
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { Product } from "../types/Product";
import "./productForm.css";
import * as Service from "../services/api";
import { getRole } from "../services/authStorage";

interface Props {
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  editingProduct: Product | null;
  onCancelEdit?: () => void;
}

export function ProductForm({
  onAdd,
  onUpdate,
  editingProduct,
  onCancelEdit,
}: Props) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title);
      setSubtitle(editingProduct.subtitle);
      setPrice(editingProduct.price.toString());
      setPreview(editingProduct.image_url);
      setDescription(editingProduct.description || "");
      setImage(null);
    } else {
      setTitle("");
      setSubtitle("");
      setPrice("");
      setDescription("");
      setImage(null);
      setPreview(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
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
    setSaving(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("price", price);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    try {
      if (editingProduct) {
        const updated = await Service.updateProduct(
          editingProduct.id,
          formData,
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

      setTitle("");
      setSubtitle("");
      setPrice("");
      setImage(null);
      setPreview(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (error) {
      alert("Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  const role = getRole();
  const isAdmin = role === "admin" || role === "vendedor";

  return (
    isAdmin && (
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
          placeholder="Código"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Preço"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "Subtract") {
              e.preventDefault();
            }
          }}
          min="0"
          step="0.01"
          required
        />

        <textarea
          placeholder="Descrição detalhada do produto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {preview && (
          <div className="preview">
            <img src={preview} alt="Preview" />
          </div>
        )}

        <div className="ButtonActions">
          <button type="submit" disabled={saving}>
            {saving
              ? editingProduct
                ? "Atualizando..."
                : "Salvando..."
              : editingProduct
                ? "Atualizar"
                : "Adicionar"}
          </button>

          {editingProduct && (
            <button
              type="button"
              onClick={() => onCancelEdit?.()}
              className="danger"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>
    )
  );
}
