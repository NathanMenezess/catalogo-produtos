import { setToken, setRole } from "./authStorage";
import { getToken } from "./authStorage";

const API_URL = import.meta.env.VITE_API_URL;

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  invite_code?: string;
};

export type MeResponse = {
  id: number;
  name: string;
  email: string;
  role: "cliente" | "admin" | "vendedor";

  phone?: string | null;
  profile_image_url?: string | null;

  cep?: string | null;
  street?: string | null;
  number?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;

  created_at?: string | null;
};

export async function register(payload: RegisterPayload) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, role: "cliente" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erro ao cadastrar");
  }

  return res.json();
}

export async function login(
  email: string,
  password: string,
): Promise<MeResponse> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Login inválido");
  }

  const data = await res.json();
  const token = data.access_token as string;

  setToken(token);

  // pega role
  const meRes = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!meRes.ok) {
    const text = await meRes.text();
    throw new Error(text || "Não consegui buscar /auth/me");
  }

  const me: MeResponse = await meRes.json();
  setRole(me.role);

  return me;
}

export async function getMe() {
  const token = getToken();
  if (!token) throw new Error("Sem token");

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Erro ao buscar usuário");
  }

  return res.json();
}

export async function updateProfile(payload: Partial<MeResponse>) {
  const token = getToken();
  if (!token) throw new Error("Sem token");

  const res = await fetch(`${API_URL}/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Erro ao atualizar perfil");
  }

  return res.json();
}

export async function updateAvatar(file: File) {
  const token = getToken();
  if (!token) throw new Error("Sem token");

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/profile/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Erro ao atualizar foto");
  }

  return res.json();
}

export async function getProfileStats() {
  const token = getToken();
  if (!token) throw new Error("Sem token");

  const res = await fetch(`${API_URL}/profile/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar estatísticas");
  }

  return res.json();
}
