import { useState } from "react";
import { register } from "../services/authApi";
import "./Register.css";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register({ name, email, password });
      window.location.href = "/login";
    } catch (err: any) {
      setError(err?.message ?? "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Criar conta</h2>

        <form onSubmit={onSubmit}>
          <div className="register-fields">
            <input
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              placeholder="E-mail"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              placeholder="Senha"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button disabled={loading} type="submit">
              {loading ? "Criando..." : "Cadastrar"}
            </button>

            {error && <p className="register-error">{error}</p>}
          </div>
        </form>

        <p className="register-footer">
          Já tem conta? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
