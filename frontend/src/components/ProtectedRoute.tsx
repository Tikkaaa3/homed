import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('homed_token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
