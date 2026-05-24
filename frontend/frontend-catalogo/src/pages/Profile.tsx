import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMe,
  getProfileStats,
  updateAvatar,
  updateProfile,
  type MeResponse,
} from "../services/authApi";
import { clearToken } from "../services/authStorage";
import "./Profile.css";

type ProfileStats = {
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
  total_spent: number;
  favorites_count: number;
};

export function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<MeResponse | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    district: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const me = await getMe();
        const profileStats = await getProfileStats();

        setUser(me);
        setStats(profileStats);

        setForm({
          name: me.name ?? "",
          phone: me.phone ?? "",
          cep: me.cep ?? "",
          street: me.street ?? "",
          number: me.number ?? "",
          district: me.district ?? "",
          city: me.city ?? "",
          state: me.state ?? "",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function logout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  async function saveProfile() {
    setSaving(true);

    try {
      const updated = await updateProfile(form);
      setUser(updated);
      alert("Perfil atualizado com sucesso!");
    } catch (err: any) {
      alert(err?.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(file?: File) {
    if (!file) return;

    try {
      const updated = await updateAvatar(file);
      setUser(updated);
      alert("Foto atualizada com sucesso!");
    } catch (err: any) {
      alert(err?.message || "Erro ao atualizar foto");
    }
  }

  async function buscarCep() {
    const cepLimpo = form.cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      alert("Digite um CEP válido com 8 números");
      return;
    }

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();

    if (data.erro) {
      alert("CEP não encontrado");
      return;
    }

    setForm((prev) => ({
      ...prev,
      street: data.logradouro || "",
      district: data.bairro || "",
      city: data.localidade || "",
      state: data.uf || "",
    }));
  }

  if (loading) {
    return <div className="profile-page">Carregando perfil...</div>;
  }

  if (!user) {
    return <div className="profile-page">Usuário não encontrado.</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <section className="profile-hero">
          <div className="profile-avatar-box">
            {user.profile_image_url ? (
              <img src={user.profile_image_url} alt={user.name} />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}

            <label className="avatar-upload">
              Alterar foto
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="profile-main-info">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <strong className={`role ${user.role}`}>{user.role}</strong>
          </div>

          <button className="logout-button" onClick={logout}>
            Sair da conta
          </button>
        </section>

        <section className="profile-stats-grid">
          <div className="stat-card">
            <span>Pedidos</span>
            <strong>{stats?.total_orders ?? 0}</strong>
          </div>

          <div className="stat-card">
            <span>Pagos</span>
            <strong>{stats?.paid_orders ?? 0}</strong>
          </div>

          <div className="stat-card">
            <span>Pendentes</span>
            <strong>{stats?.pending_orders ?? 0}</strong>
          </div>

          <div className="stat-card">
            <span>Favoritos</span>
            <strong>{stats?.favorites_count ?? 0}</strong>
          </div>

          <div className="stat-card total">
            <span>Total gasto</span>
            <strong>
              {(stats?.total_spent ?? 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </strong>
          </div>
        </section>

        <section className="profile-content-grid">
          <div className="profile-panel">
            <h2>Dados pessoais</h2>

            <div className="form-grid">
              <label>
                Nome
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <label>
                Telefone
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </label>
            </div>

            <h2>Endereço salvo</h2>

            <div className="form-grid">
              <label>
                CEP
                <div className="cep-row">
                  <input
                    value={form.cep}
                    onChange={(e) => setForm({ ...form, cep: e.target.value })}
                    placeholder="00000-000"
                  />
                  <button type="button" onClick={buscarCep}>
                    Buscar
                  </button>
                </div>
              </label>

              <label>
                Rua
                <input
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
              </label>

              <label>
                Número
                <input
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                />
              </label>

              <label>
                Bairro
                <input
                  value={form.district}
                  onChange={(e) =>
                    setForm({ ...form, district: e.target.value })
                  }
                />
              </label>

              <label>
                Cidade
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </label>

              <label>
                Estado
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </label>
            </div>

            <button
              className="save-button"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>

          <aside className="profile-panel shortcuts">
            <h2>Atalhos</h2>

            <button onClick={() => navigate("/orders")}>Meus pedidos</button>
            <button onClick={() => navigate("/favorites")}>Favoritos</button>
            <button onClick={() => navigate("/checkout")}>
              Finalizar compra
            </button>
            <button onClick={() => navigate("/home")}>Ver produtos</button>

            {(user.role === "admin" || user.role === "vendedor") && (
              <button onClick={() => navigate("/admin/products")}>
                Área administrativa
              </button>
            )}

            {user.role === "admin" && (
              <button onClick={() => navigate("/admin/users")}>
                Gerenciar usuários
              </button>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}
