import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../contexts/AuthContext";
import PageLoading from "./PageLoading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Define paths for redirection
  const LOGIN_PATH = requiredRole === "admin" ? "/admin/signin" : "/signin";
  const DASHBOARD_PATH = user?.role === "admin" ? "/admin" : "/dashboard";

  // Show loading state while authentication is in progress
  if (isLoading) {
    console.log("Authentication in progress...");
    return <PageLoading message="Authenticating..." />;
  }

  // Redirect unauthenticated users to the login page
  if (!isAuthenticated) {
    console.log("User is not authenticated. Redirecting to login...");
    return <Navigate to={LOGIN_PATH} state={{ from: location.pathname }} replace />;
  }

  // Redirect users with mismatched roles to their respective dashboards
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`Role mismatch. Expected: ${requiredRole}, Found: ${user?.role}. Redirecting...`);
    return <Navigate to={DASHBOARD_PATH} replace />;
  }

  // Render the protected content for authorized users
  console.log("User authorized. Rendering protected content.");
  return <>{children}</>;
};

export default ProtectedRoute;