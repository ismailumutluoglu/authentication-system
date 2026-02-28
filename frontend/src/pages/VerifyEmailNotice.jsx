import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const VerifyEmailNotice = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post('/auth/resend-verification');
      setSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">

        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Doğrulama Gerekli</h1>
        <p className="text-gray-500 text-sm mb-2">
          <strong>{user?.email}</strong> adresine doğrulama emaili gönderildi.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Emailinizi kontrol edin ve doğrulama linkine tıklayın.
        </p>

        {sent && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
            Email tekrar gönderildi! ✅
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={loading || sent}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 mb-3"
        >
          {loading ? 'Gönderiliyor...' : sent ? 'Email Gönderildi ✅' : 'Tekrar Gönder'}
        </button>

        <button
          onClick={handleLogout}
          className="w-full text-sm text-red-500 font-medium hover:underline"
        >
          Çıkış Yap
        </button>

      </div>
    </div>
  );
};

export default VerifyEmailNotice;