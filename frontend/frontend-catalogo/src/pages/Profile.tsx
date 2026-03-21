import { getRole, clearToken } from "../services/authStorage";
import { useNavigate } from "react-router-dom";
import "./profile.css";

export function Profile() {
  const role = getRole();
  const navigate = useNavigate();

  function logout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">👤</div>

        <h2>Meu perfil</h2>

        <div className="profile-info">
          <div>
            <span>Tipo de conta</span>
            <strong className={`role ${role}`}>{role}</strong>
          </div>
        </div>

        <div className="profile-actions">
          <button
            onClick={() =>
              navigate(
                role === "admin" || role === "vendedor"
                  ? "/admin/products"
                  : "/home",
              )
            }
          >
            ← Voltar
          </button>

          <button className="danger" onClick={logout}>
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
