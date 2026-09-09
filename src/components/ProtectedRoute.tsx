import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/employee" replace />;
    }
  }

  return children;
};
