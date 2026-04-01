import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThreeDot } from "react-loading-indicators";

export default function RoleHomeRedirect() {
  const { loading, profileLoading, isAuthenticated, isAdmin, otpPending } = useAuth();

  if (loading || profileLoading) {
    return (
      <div className="min-h-dvh w-full bg-white flex items-center justify-center">
        <ThreeDot color="#2f963c" size="medium" text="" textColor="" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (otpPending) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/home" replace />
  );
}