import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setError('');
    try {
      const user = await login(email, password);
      const fallback =
        user.role === 'admin' ? '/admin' : user.role === 'supplier' ? '/dashboard/supplier' : '/dashboard/buyer';
      navigate(location.state?.from || fallback);
    } catch (err) {
      setError(apiError(err, 'Invalid email or password'));
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-3xl font-bold text-white">Welcome back</h1>
      <form className="card mt-10 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {error && <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" {...register('email', { required: 'Email is required' })} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        <button className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-300">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-brand-400 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
