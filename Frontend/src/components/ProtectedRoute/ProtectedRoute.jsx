import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./ProtectedRoute.module.css";

export default function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
