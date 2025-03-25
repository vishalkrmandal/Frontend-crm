import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token') !== null;

  // Get user role
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const userRole = user?.role || '';

  // Check if user role is allowed
  const isAuthorized = allowedRoles.includes(userRole);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  if (!isAuthorized) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin' || userRole === 'superadmin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/client" replace />;
    }
  }

  // Render the protected route
  return <Outlet />;
};

export default ProtectedRoute;