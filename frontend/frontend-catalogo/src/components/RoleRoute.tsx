import { Navigate } from "react-router-dom";
import { getRole, isLoggedIn } from "../services/authStorage";
import React from "react";

type Props = {
  allow: Array<"cliente" | "admin" | "vendedor">;
  children: React.ReactNode;
};

export function RoleRoute({ allow, children }: Props) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  const role = getRole() as Props["allow"][number] | null;

  if (!role || !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
