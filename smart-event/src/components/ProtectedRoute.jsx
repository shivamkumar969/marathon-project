import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const user = JSON.parse(sessionStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role) {
    if (Array.isArray(role) && !role.includes(user.role)) {
      return <Navigate to="/" />;
    } else if (!Array.isArray(role) && user.role !== role) {
      return <Navigate to="/" />;
    }
  }

  return children;
}

export default ProtectedRoute;