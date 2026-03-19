import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminOnlyRoute() {
  const { loading, profileLoading, isAuthenticated, isAdmin } = useAuth();

  if (loading || profileLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}