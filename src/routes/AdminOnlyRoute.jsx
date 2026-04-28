import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThreeDot } from "react-loading-indicators";

export default function AdminOnlyRoute() {
const {
  isAuthenticated,
  isAdmin,
  loading,
  profileLoading,
  deviceChecking,
  otpPending,
} = useAuth();
  const location = useLocation();

if (loading || profileLoading || deviceChecking) {
  return (
    <div className="min-h-screen flex items-center justify-center">
     <ThreeDot color="#2f963c" size="medium" text="" textColor="" />
    </div>
  );
}

if (!isAuthenticated) {
  return <Navigate to="/login" replace state={{ from: location }} />;
}

if (otpPending) {
  return <Navigate to="/login" replace state={{ from: location }} />;
}

if (!isAdmin) {
  return <Navigate to="/" replace />;
}

  return <Outlet />;
}