import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { apiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState(token ? 'verifying' : 'waiting');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    api
      .post('/auth/verify-email', { token })
      .then(async () => {
        setState('done');
        await refreshUser();
        setTimeout(() => {
          navigate(user?.role === 'supplier' ? '/dashboard/supplier/profile' : '/dashboard/buyer');
        }, 1500);
      })
      .catch((err) => {
        setState('error');
        setMessage(apiError(err, 'Verification failed'));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resend = async () => {
    try {
      const { data } = await api.post('/auth/resend-verification');
      setMessage(data.message);
    } catch (err) {
      setMessage(apiError(err, 'Could not resend email. Are you logged in?'));
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      {state === 'verifying' && <p className="text-gray-600">Verifying your email…</p>}
      {state === 'done' && (
        <>
          <p className="text-4xl">✅</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Email verified!</h1>
          <p className="mt-2 text-gray-600">Redirecting you to your dashboard…</p>
        </>
      )}
      {state === 'error' && (
        <>
          <p className="text-4xl">⚠️</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Verification failed</h1>
          <p className="mt-2 text-gray-600">{message}</p>
          <button className="btn-primary mt-6" onClick={resend}>
            Resend verification email
          </button>
        </>
      )}
      {state === 'waiting' && (
        <>
          <p className="text-4xl">📬</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-gray-600">
            We sent a verification link to your inbox. Click it to activate your account.
          </p>
          {message && <p className="mt-4 text-sm text-brand-700">{message}</p>}
          <button className="btn-secondary mt-6" onClick={resend}>
            Resend email
          </button>
          <p className="mt-6 text-sm text-gray-500">
            Wrong account? <Link className="text-brand-700 underline" to="/login">Log in again</Link>
          </p>
        </>
      )}
    </div>
  );
}
