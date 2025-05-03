import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { activeRole, switchRole } = useAuth();
  const navigate = useNavigate();

  // Get role-specific tokens
  const adminToken = localStorage.getItem('adminToken');
  const clientToken = localStorage.getItem('clientToken');
  const superadminToken = localStorage.getItem('superadminToken');

  useEffect(() => {
    let userString: string | null = null;

    if (allowedRoles.includes('admin') || allowedRoles.includes('superadmin')) {
      // Check for admin user
      if (allowedRoles.includes('admin') && adminToken) {
        userString = localStorage.getItem('adminUser');
        // Switch to admin role if not already active
        if (activeRole !== 'admin') {
          switchRole('admin', navigate);
        }
      }
      // Check for superadmin user
      else if (allowedRoles.includes('superadmin') && superadminToken) {
        userString = localStorage.getItem('superadminUser');
        // Switch to superadmin role if not already active
        if (activeRole !== 'superadmin') {
          switchRole('superadmin', navigate);
        }
      }
    }
    // Check for client user
    else if (allowedRoles.includes('client') && clientToken) {
      userString = localStorage.getItem('clientUser');
      // Switch to client role if not already active
      if (activeRole !== 'client') {
        switchRole('client', navigate);
      }
    }
  }, [activeRole, allowedRoles, adminToken, clientToken, superadminToken, navigate, switchRole]);

  // Get user based on current activeRole
  const userString = activeRole ? localStorage.getItem(`${activeRole}User`) : null;
  const user = userString ? JSON.parse(userString) : null;
  const userRole = user?.role || '';
  const isAuthenticated = !!user;

  // Check if user role is allowed for this route
  const isAuthorized = allowedRoles.includes(userRole);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated for this role 
    return <Navigate to="/" replace />;
  }

  if (!isAuthorized) {
    // Redirect based on available roles
    if ((adminToken || superadminToken) && (userRole === 'admin' || userRole === 'superadmin')) {
      return <Navigate to="/admin" replace />;
    } else if (clientToken && userRole === 'client') {
      return <Navigate to="/client" replace />;
    } else {
      // No valid role found, go to login
      return <Navigate to="/" replace />;
    }
  }

  // Render the protected route
  return <Outlet />;
};

export default ProtectedRoute;