import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleHomeRedirect() {
  const { loading, profileLoading, isAuthenticated, isAdmin } = useAuth();

  if (loading || profileLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/home" replace />
  );
}