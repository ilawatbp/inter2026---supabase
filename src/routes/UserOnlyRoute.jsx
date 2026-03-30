import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThreeDot } from "react-loading-indicators";

export default function UserOnlyRoute() {
  const { loading, profileLoading, isAuthenticated, isAdmin } = useAuth();

  //Loading...
  if (loading || profileLoading) {
    return <div className="min-h-dvh w-full bg-white flex items-center justify-center">
      <ThreeDot color="#2f963c" size="medium" text="" textColor="" />
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}