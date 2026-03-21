import { getToken } from "./authStorage";

const API_URL = "http://127.0.0.1:8000";

function authHeader() {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function handleResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (data &&
        typeof data === "object" &&
        "detail" in data &&
        (data as any).detail) ||
      (typeof data === "string" && data) ||
      `Erro ${res.status}`;

    throw new Error(message);
  }

  return data;
}

export type UserRole = "cliente" | "vendedor" | "admin";

export type UserListItem = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export async function adminGetUsers(): Promise<UserListItem[]> {
  const res = await fetch(`${API_URL}/admin/users`, {
    method: "GET",
    headers: authHeader(),
  });
  return handleResponse(res);
}

export async function adminUpdateUserRole(
  userId: number,
  role: UserRole,
): Promise<UserListItem> {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "PATCH",
    headers: authHeader(),
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
}

export async function adminDeleteUser(userId: number): Promise<void> {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = data?.detail || `Erro ao excluir usuário (${res.status})`;
    throw new Error(msg);
  }
}
