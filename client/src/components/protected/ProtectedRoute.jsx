import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
  return (
  <div className="flex items-center justify-center min-h-screen">
  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
  </div>
  );
  }

  if (!user) {
  // Remember where the visitor was heading so login can send them back.
  return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // No role requirement -> any signed-in user may view the page
  const hasAccess =
  !allowedRoles ||
  allowedRoles.length === 0 ||
  (Array.isArray(user.roles) &&
  allowedRoles.some((role) => user.roles.includes(role)));

  if (!hasAccess) {
  return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;