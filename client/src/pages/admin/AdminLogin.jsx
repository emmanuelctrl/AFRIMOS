import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiError } from '../../api/client';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(password);
      navigate('/admin');
    } catch (err) {
      setError(apiError(err, 'Incorrect password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="text-center text-3xl font-bold text-white">Admin access</h1>
      <p className="mt-2 text-center text-sm text-gray-300">Enter the admin password to continue.</p>
      <form className="card mt-10 space-y-4" onSubmit={onSubmit}>
        {error && (
          <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <div>
          <label className="label" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            className="input"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn-primary w-full" disabled={loading || !password}>
          {loading ? 'Signing in…' : 'Enter admin'}
        </button>
      </form>
    </div>
  );
}
