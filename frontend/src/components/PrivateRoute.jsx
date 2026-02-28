import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-sm">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Email doğrulanmamış → bilgilendirme sayfasına yönlendir
  if (!user.isEmailVerified) {
    return <Navigate to="/verify-email-notice" replace />;
  }

  return children;
};

export default PrivateRoute;