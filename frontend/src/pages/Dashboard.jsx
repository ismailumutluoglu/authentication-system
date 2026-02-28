import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-blue-600">Auth System</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 font-medium hover:underline"
        >
          Çıkış Yap
        </button>
      </nav>

      {/* İçerik */}
      <div className="max-w-2xl mx-auto mt-12 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8">

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.username}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Kullanıcı ID</span>
              <span className="text-gray-800 font-mono">{user?.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-800">{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Durum</span>
              <span className="text-green-600 font-medium">✓ Giriş yapıldı</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;