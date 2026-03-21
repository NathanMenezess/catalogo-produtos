import { useState } from "react";
import { login, getMe } from "../services/authApi";
import { setUserId, setRole } from "../services/authStorage";
import "./Login.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);

      //  pega os dados do usuário logado (id + role)
      const me = await getMe();

      //  salva para o resto do app (inclusive para ocultar o botão "Excluir" em você)
      setUserId(me.id);
      setRole(me.role);

      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message ?? "Erro no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>

        <form onSubmit={onSubmit}>
          <div className="login-fields">
            <input
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button disabled={loading} type="submit">
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {error && <p className="login-error">{error}</p>}
          </div>
        </form>

        <p className="login-footer">
          Não tem conta? <a href="/register">Cadastrar</a>
        </p>
      </div>
    </div>
  );
}
