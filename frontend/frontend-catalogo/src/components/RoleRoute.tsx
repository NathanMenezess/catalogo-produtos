import { Navigate } from "react-router-dom";
import { getRole, isLoggedIn } from "../services/authStorage";

type Props = {
  allow: Array<"cliente" | "admin" | "vendedor">;
  children: JSX.Element;
};

export function RoleRoute({ allow, children }: Props) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  const role = getRole() as Props["allow"][number] | null;

  if (!role || !allow.includes(role)) {
    // caiu aqui => não tem permissão, manda pro destino padrão
    return <Navigate to="/" replace />;
  }

  return children;
}
