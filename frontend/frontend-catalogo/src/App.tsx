import { Routes, Route, Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "./services/authStorage";

import { Home } from "./pages/home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Header } from "./components/header";
import { Profile } from "./pages/Profile";
import { RoleRoute } from "./components/RoleRoute";
import { AdminUsers } from "./pages/AdminUsers";
import { Checkout } from "./pages/Checkout";
import Orders from "./pages/Orders";
import { ProductDetails } from "./pages/ProductDetails";
import { Payment } from "./pages/Payment";
import { Favorites } from "./pages/Favorites";
import { ProductEdit } from "./pages/ProductEdit";
import { ProductCreate } from "./pages/ProductCreate";

function DefaultAfterLogin() {
  const role = getRole();

  if (role === "admin" || role === "vendedor") {
    return <Navigate to="/admin/products" replace />;
  }

  return <Navigate to="/home" replace />; // cliente
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn() ? (
            <DefaultAfterLogin />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* CLIENTE */}
      <Route
        path="/home"
        element={
          <RoleRoute allow={["cliente", "admin"]}>
            <>
              <Header />
              <Home />
            </>
          </RoleRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <RoleRoute allow={["cliente", "admin"]}>
            <>
              <Header />
              <Orders />
            </>
          </RoleRoute>
        }
      />

      <Route
        path="/favorites"
        element={
          <RoleRoute allow={["cliente", "admin"]}>
            <>
              <Header />
              <Favorites />
            </>
          </RoleRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <RoleRoute allow={["cliente", "admin", "vendedor"]}>
            <>
              <Header />
              <Profile />
            </>
          </RoleRoute>
        }
      />

      {/* ADMIN/VENDEDOR */}
      <Route
        path="/admin/products"
        element={
          <RoleRoute allow={["admin", "vendedor"]}>
            <>
              <Header />
              <Home />
            </>
          </RoleRoute>
        }
      />

      <Route
        path="/admin/products/new"
        element={
          <RoleRoute allow={["admin", "vendedor"]}>
            <>
              <Header />
              <ProductCreate />
            </>
          </RoleRoute>
        }
      />

      <Route
        path="/admin/products/edit/:id"
        element={
          <RoleRoute allow={["admin", "vendedor"]}>
            <>
              <Header />
              <ProductEdit />
            </>
          </RoleRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <RoleRoute allow={["admin"]}>
            <>
              <Header />
              <AdminUsers />
            </>
          </RoleRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <RoleRoute allow={["cliente", "admin"]}>
            <>
              <Header />
              <Checkout />
            </>
          </RoleRoute>
        }
      />

      <Route
        path="/products/:id"
        element={
          <RoleRoute allow={["cliente", "admin", "vendedor"]}>
            <>
              <Header />
              <ProductDetails />
            </>
          </RoleRoute>
        }
      />

      <Route
        path="/payment/:id"
        element={
          <RoleRoute allow={["cliente", "admin"]}>
            <>
              <Header />
              <Payment />
            </>
          </RoleRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
