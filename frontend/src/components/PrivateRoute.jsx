import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Session restore henüz tamamlanmadı — bekle
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-sm">Yükleniyor...</div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamış — login'e yönlendir
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Kullanıcı giriş yapmış — sayfayı göster
  return children;
};

export default PrivateRoute;