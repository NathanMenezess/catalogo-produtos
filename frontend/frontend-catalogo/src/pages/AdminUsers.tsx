import { useEffect, useState, useMemo } from "react";
import {
  adminGetUsers,
  adminUpdateUserRole,
  adminDeleteUser,
  type UserListItem,
  type UserRole,
} from "../services/adminUserApi";
import { getUserId } from "../services/authStorage";
import Swal from "sweetalert2";
import "./AdminUsers.css";
import Tooltip from "@mui/material/Tooltip";

// MUI Select
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

type PendingRoleMap = Record<number, UserRole>;

export function AdminUsers() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"todos" | UserRole>("todos");
  const currentUserId = getUserId();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);

  const [pendingRoles, setPendingRoles] = useState<PendingRoleMap>({});

  async function load() {
    setLoading(true);
    try {
      const data = await adminGetUsers();
      setUsers(data);
      setPendingRoles({});
    } catch (e: any) {
      Swal.fire("Erro", e?.message || "Erro ao carregar usuários", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onSelectRole(userId: number, role: UserRole) {
    setPendingRoles((prev) => ({ ...prev, [userId]: role }));
  }

  async function confirmRoleChange(userId: number) {
    const newRole = pendingRoles[userId];
    if (!newRole) return;

    try {
      setSavingRoleId(userId);
      const updated = await adminUpdateUserRole(userId, newRole);

      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));

      setPendingRoles((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });

      Swal.fire("Sucesso", "Acesso atualizado com sucesso.", "success");
    } catch (e: any) {
      Swal.fire("Erro", e?.message || "Erro ao atualizar acesso", "error");
    } finally {
      setSavingRoleId(null);
    }
  }

  function cancelRoleChange(userId: number) {
    setPendingRoles((prev) => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  }

  async function deleteUser(userId: number, name: string) {
    const result = await Swal.fire({
      title: "Excluir usuário?",
      text: `Tem certeza que deseja excluir "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(userId);
      await adminDeleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      Swal.fire("Excluído!", "Usuário removido com sucesso.", "success");
    } catch (e: any) {
      Swal.fire("Erro", e?.message || "Erro ao excluir usuário", "error");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchText =
        q.length === 0 ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchRole = roleFilter === "todos" ? true : u.role === roleFilter;
      return matchText && matchRole;
    });
  }, [users, search, roleFilter]);

  if (loading) {
    return (
      <div className="admin-users">
        <div className="admin-users__status">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-users__header">
        <div>
          <h2 className="admin-users__title">Usuários</h2>
          <p className="admin-users__subtitle">
            Defina o nível de acesso de cada conta
          </p>

          <div className="admin-users__filters">
            <input
              className="admin-users__search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              type="text"
            />

            {/* ✅ Role Filter - MUI Select */}
            <FormControl
              size="small"
              sx={{
                minWidth: 160,
                background: "#fff",
                borderRadius: "12px",
              }}
            >
              <InputLabel id="role-filter-label">Acesso</InputLabel>
              <Select
                labelId="role-filter-label"
                label="Acesso"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="cliente">cliente</MenuItem>
                <MenuItem value="vendedor">vendedor</MenuItem>
                <MenuItem value="admin">admin</MenuItem>
              </Select>
            </FormControl>

            <button
              className="admin-users__btn"
              onClick={() => {
                setSearch("");
                setRoleFilter("todos");
              }}
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="admin-users__actions">
          <button className="admin-users__btn" onClick={load}>
            Atualizar
          </button>
        </div>
      </div>

      <div className="admin-users__card">
        {filteredUsers.length === 0 ? (
          <div className="admin-users__status">Nenhum usuário encontrado.</div>
        ) : (
          <div className="admin-users__tableWrap">
            <table className="admin-users__table">
              <colgroup>
                <col style={{ width: "26%" }} />
                <col style={{ width: "34%" }} />
                <col style={{ width: "26%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>

              <thead>
                <tr>
                  <th className="admin-users__th">Nome</th>
                  <th className="admin-users__th">E-mail</th>
                  <th className="admin-users__th">Acesso</th>
                  <th className="admin-users__th admin-users__th--actions">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u) => {
                  const pendingRole = pendingRoles[u.id] ?? u.role;
                  const hasChange = pendingRoles[u.id] !== undefined;

                  return (
                    <tr key={u.id} className="admin-users__row">
                      <td className="admin-users__td" data-label="Nome">
                        <span className="admin-users__name">{u.name}</span>
                      </td>

                      <td className="admin-users__td" data-label="E-mail">
                        <span className="admin-users__email">{u.email}</span>
                      </td>

                      <td className="admin-users__td" data-label="Acesso">
                        {/* ✅ User Role - MUI Select */}
                        <FormControl
                          size="small"
                          sx={{
                            minWidth: 170,
                            background: "#fff",
                            borderRadius: "12px",
                          }}
                          disabled={savingRoleId === u.id}
                        >
                          <InputLabel id={`role-label-${u.id}`}>
                            Acesso
                          </InputLabel>
                          <Select
                            labelId={`role-label-${u.id}`}
                            label="Acesso"
                            value={pendingRole}
                            onChange={(e) =>
                              onSelectRole(u.id, e.target.value as UserRole)
                            }
                          >
                            <MenuItem value="cliente">cliente</MenuItem>
                            <MenuItem value="vendedor">vendedor</MenuItem>
                            <MenuItem value="admin">admin</MenuItem>
                          </Select>
                        </FormControl>

                        {hasChange && (
                          <div className="admin-users__confirmRow">
                            <button
                              className="admin-users__btn"
                              onClick={() => confirmRoleChange(u.id)}
                              disabled={savingRoleId === u.id}
                            >
                              Confirmar
                            </button>

                            <button
                              className="admin-users__btn"
                              onClick={() => cancelRoleChange(u.id)}
                              disabled={savingRoleId === u.id}
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </td>

                      <td
                        className="admin-users__td admin-users__td--actions"
                        data-label="Ações"
                      >
                        {currentUserId === u.id ? (
                          <span className="admin-users__badge">você</span>
                        ) : (
                          <Tooltip title="Excluir usuário">
                            <button
                              className="admin-users__deleteBtn"
                              disabled={deletingId === u.id}
                              onClick={() => deleteUser(u.id, u.name)}
                            >
                              {deletingId === u.id ? "Excluindo..." : "Excluir"}
                            </button>
                          </Tooltip>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
