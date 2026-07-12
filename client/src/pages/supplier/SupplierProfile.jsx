import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api, { apiError } from '../../api/client';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { CERTIFICATIONS } from '../SuppliersDirectory';

export default function SupplierProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [completeness, setCompleteness] = useState(0);
  const [flash, setFlash] = useState('');
  const [logo, setLogo] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    api
      .get('/suppliers/me')
      .then(({ data }) => {
        const s = data.supplier;
        reset({
          companyName: s.companyName || '',
          registrationNumber: s.registrationNumber || '',
          address: s.address || '',
          city: s.city || '',
          country: s.country || 'Ethiopia',
          phone: s.phone || '',
          website: s.website || '',
          description: s.description || '',
          shippingTerms: s.shippingTerms || '',
          leadTime: s.leadTime || '',
          certifications: s.certifications || [],
        });
        setLogo(s.logoBanner);
        setStatus(s.user.verificationStatus);
        setCompleteness(data.completeness);
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await api.post('/upload', form);
      setLogo(data.url);
      setValue('logoBanner', data.url);
      setFlash('Logo uploaded - remember to save.');
    } catch (err) {
      setFlash(apiError(err, 'Upload failed'));
    }
  };

  const onSubmit = async (values) => {
    setSaving(true);
    setFlash('');
    try {
      const payload = {
        ...values,
        logoBanner: logo || null,
        shippingTerms: values.shippingTerms || null,
        leadTime: values.leadTime ? Number(values.leadTime) : null,
        website: values.website || '',
        certifications: values.certifications || [],
      };
      const { data } = await api.post('/suppliers/profile', payload);
      setCompleteness(data.completeness);
      setFlash('Profile saved successfully.');
    } catch (err) {
      setFlash(apiError(err, 'Could not save profile'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Company profile</h1>
        <div className="flex items-center gap-3 text-sm">
          <Badge tone={status}>{status}</Badge>
          <span className="text-gray-600">Completeness: {completeness}%</span>
        </div>
      </div>

      {flash && <p className="rounded-xl border border-brand-200/60 bg-brand-50/80 px-4 py-3 backdrop-blur-sm text-sm text-brand-800">{flash}</p>}

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <section className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Company information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Company name *</label>
              <input className="input" {...register('companyName', { required: true })} />
            </div>
            <div>
              <label className="label">Registration number</label>
              <input className="input" {...register('registrationNumber')} />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" {...register('address')} />
            </div>
            <div>
              <label className="label">City</label>
              <input className="input" {...register('city')} />
            </div>
            <div>
              <label className="label">Country</label>
              <input className="input" {...register('country')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" {...register('phone')} placeholder="+251 …" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Website</label>
              <input className="input" {...register('website')} placeholder="https://…" />
            </div>
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">About your company</h2>
          <textarea
            className="input min-h-32"
            {...register('description')}
            placeholder="Describe your company, products, capacity and export experience (at least 30 characters counts toward profile completeness)…"
          />
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
          <div className="flex flex-wrap gap-4">
            {CERTIFICATIONS.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" value={c} {...register('certifications')} className="rounded" />
                {c}
              </label>
            ))}
          </div>
        </section>

        <section className="card grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Default shipping terms</label>
            <select className="input" {...register('shippingTerms')}>
              <option value="">Select…</option>
              <option value="FOB">FOB - Free on Board</option>
              <option value="CIF">CIF - Cost, Insurance & Freight</option>
              <option value="DDP">DDP - Delivered Duty Paid</option>
            </select>
          </div>
          <div>
            <label className="label">Typical lead time (days)</label>
            <input className="input" type="number" min="1" {...register('leadTime')} />
          </div>
        </section>

        <section className="card space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Company logo</h2>
          <div className="flex items-center gap-4">
            {logo ? (
              <img src={logo} alt="Logo" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/40 bg-white/40 text-gray-500">
                —
              </div>
            )}
            <label className="btn-secondary cursor-pointer">
              Upload logo
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadLogo} />
            </label>
            <span className="text-xs text-gray-500">JPG, PNG or WebP, max 5MB</span>
          </div>
        </section>

        <button className="btn-primary px-8" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
