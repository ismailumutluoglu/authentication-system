import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // ← api değil, direkt axios

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
  const verify = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/verify-email/${token}`);
      setStatus('success');
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.log('Hata:', err.response); // ← bunu ekle
      setStatus('error');
      setMessage(err.response?.data?.message || 'Bir hata oluştu');
    }
  };

  verify();
}, [token]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">

        {status === 'loading' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Doğrulanıyor...</h1>
            <p className="text-gray-500 text-sm">Lütfen bekleyin</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Email Doğrulandı!</h1>
            <p className="text-gray-500 text-sm mb-4">{message}</p>
            <p className="text-gray-400 text-xs">3 saniye içinde giriş sayfasına yönlendiriliyorsunuz...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Doğrulama Başarısız</h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Giriş Sayfasına Dön
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;