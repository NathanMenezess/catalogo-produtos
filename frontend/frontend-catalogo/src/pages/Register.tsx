import { useState } from "react";
import { register } from "../services/authApi";
import "./Register.css";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

function normalizeEmail(email: string) {
  return email
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s/g, "")
    .toLowerCase();
}

function validatePassword(password: string) {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    valid: minLength && hasUppercase && hasNumber && hasSpecial,

    errors: {
      minLength,
      hasUppercase,
      hasNumber,
      hasSpecial,
    },
  };
}

function validateFullName(name: string) {
  const parts = name
    .trim()
    .split(" ")
    .filter((part) => part.length > 0);

  return parts.length >= 2;
}

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [inviteCode, setInviteCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = normalizeEmail(email);

      const isValidName = validateFullName(name);

      if (!isValidName) {
        setError("Digite nome e sobrenome.");
        setLoading(false);
        return;
      }

      const passwordValidation = validatePassword(password);

      if (!passwordValidation.valid) {
        setError(
          "A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, um número e um caractere especial.",
        );

        setLoading(false);
        return;
      }

      await register({
        name,
        email: normalizedEmail,
        password,
        invite_code: inviteCode,
      });
      navigate("/login");
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
              placeholder="Nome e sobrenome"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/\s{2,}/g, " "))}
              required
            />

            <input
              placeholder="E-mail"
              value={email}
              type="email"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) =>
                setEmail(
                  e.target.value
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s/g, "")
                    .toLowerCase(),
                )
              }
            />

           <div className="password-field">
  <input
    type={showPassword ? "text" : "password"}
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <small className="password-rules">
            A senha deve conter:
            <br />
            • mínimo 8 caracteres
            <br />
            • uma letra maiúscula
              <br />
              • um número
              <br />• um caractere especial
            </small>

            <input
              placeholder="Código de indicação (opcional)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.trim())}
            />

            <button disabled={loading} type="submit">
              {loading ? "Criando..." : "Cadastrar"}
            </button>

            {error && <p className="register-error">{error}</p>}
          </div>
        </form>

        <p className="register-footer">
          Já tem conta? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
