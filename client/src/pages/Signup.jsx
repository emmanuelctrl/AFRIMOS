import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../api/client';

export default function Signup() {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || '');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    setError('');
    try {
      await signup({ ...values, role });
      navigate('/verify-email');
    } catch (err) {
      setError(apiError(err));
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-3xl font-bold text-gray-900">Create your account</h1>

      {!role ? (
        <div className="mt-10 space-y-4">
          <p className="text-center text-gray-600">I want to…</p>
          <button
            className="card card-hover w-full text-left hover:border-brand-400"
            onClick={() => setRole('supplier')}
          >
            <p className="font-semibold text-gray-900">Sell my products (Supplier)</p>
            <p className="mt-1 text-sm text-gray-600">
              I'm an Ethiopian exporter looking for international buyers.
            </p>
          </button>
          <button
            className="card card-hover w-full text-left hover:border-brand-400"
            onClick={() => setRole('buyer')}
          >
            <p className="font-semibold text-gray-900">Source products (Buyer)</p>
            <p className="mt-1 text-sm text-gray-600">
              I'm an importer looking for verified African suppliers.
            </p>
          </button>
        </div>
      ) : (
        <form className="card mt-10 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <p className="text-sm text-gray-500">
            Signing up as <strong className="capitalize">{role}</strong>{' '}
            <button type="button" className="text-brand-700 underline" onClick={() => setRole('')}>
              change
            </button>
          </p>
          {error && <p className="rounded-lg border border-red-200/60 bg-red-50/80 px-4 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <label className="label">Full name</label>
            <input className="input" {...register('fullName', { required: 'Your name is required', minLength: { value: 2, message: 'Too short' } })} />
            {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
          </div>
          {role === 'supplier' && (
            <div>
              <label className="label">Company name</label>
              <input className="input" {...register('companyName', { required: 'Company name is required' })} />
              {errors.companyName && <p className="field-error">{errors.companyName.message}</p>}
            </div>
          )}
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
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Account type</label>
            <select className="input" {...register('userType')}>
              <option value="company">Company</option>
              <option value="individual">Individual</option>
            </select>
          </div>
          <button className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-700 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
