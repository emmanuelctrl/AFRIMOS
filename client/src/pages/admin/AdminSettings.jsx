import { useState } from 'react';
import api, { apiError } from '../../api/client';

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirm) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/admin/password', { currentPassword, newPassword });
      setMessage('Admin password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err) {
      setError(apiError(err, 'Could not update the password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <section className="card max-w-lg">
        <h2 className="text-lg font-semibold text-white">Admin password</h2>
        <p className="mt-1 text-sm text-gray-300">
          This is the password used at <span className="font-medium">/admin/login</span>. Choose
          something strong — a short numeric code is easy to guess.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {message && (
            <p className="rounded-lg border border-green-400/20 bg-green-500/10 px-4 py-2 text-sm text-green-300">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          <div>
            <label className="label" htmlFor="current-password">
              Current password
            </label>
            <input
              id="current-password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm-password">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button
            className="btn-primary w-full"
            disabled={loading || !currentPassword || !newPassword || !confirm}
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>
    </div>
  );
}
