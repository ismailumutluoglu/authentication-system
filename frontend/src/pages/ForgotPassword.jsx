import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Email Gönderildi!</h1>
          <p className="text-gray-500 text-sm mb-6">
            <strong>{email}</strong> adresine şifre sıfırlama linki gönderildi.
          </p>
          <Link to="/login" className="text-blue-600 text-sm font-medium hover:underline">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Şifremi Unuttum</h1>
        <p className="text-gray-500 text-sm mb-6">
          Email adresinizi girin, şifre sıfırlama linki gönderelim.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ornek@gmail.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Gönderiliyor...' : 'Link Gönder'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Giriş sayfasına dön
          </Link>
        </p>

      </div>
    </div>
  );
};

export default ForgotPassword;