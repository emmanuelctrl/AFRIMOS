import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { apiError } from '../../api/client';
import { CATEGORIES } from '../SuppliersDirectory';

export default function CreateRfq() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [mode, setMode] = useState(params.get('supplierId') ? 'specific' : 'broadcast');
  const [suppliers, setSuppliers] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      supplierId: params.get('supplierId') || '',
      productCategory: 'Coffee',
      unit: 'kg',
    },
  });

  useEffect(() => {
    if (mode !== 'specific') return;
    api
      .get('/suppliers', { params: { limit: 50 } })
      .then(({ data }) => setSuppliers(data.suppliers))
      .catch(() => setSuppliers([]));
  }, [mode]);

  const onSubmit = async (values) => {
    setError('');
    try {
      const payload = {
        productCategory: values.productCategory,
        title: values.title,
        description: values.description || null,
        quantity: Number(values.quantity),
        unit: values.unit,
        requiredDeliveryDate: values.requiredDeliveryDate || null,
        budget: values.budget ? Number(values.budget) : null,
        terms: values.terms || null,
        supplierId: mode === 'specific' && values.supplierId ? values.supplierId : null,
      };
      const { data } = await api.post('/rfqs', payload);
      navigate(`/dashboard/buyer/rfqs/${data.rfq.id}`);
    } catch (err) {
      setError(apiError(err, 'Could not create RFQ'));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Create a Request for Quote</h1>
      {error && <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <section className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Product category *</label>
              <select className="input" {...register('productCategory')}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Title *</label>
              <input
                className="input"
                placeholder="e.g. Yirgacheffe Grade 1, 5 MT"
                {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Too short' } })}
              />
              {errors.title && <p className="field-error">{errors.title.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Specifications / special requirements</label>
            <textarea
              className="input"
              rows="4"
              placeholder="Quality grade, certifications required, packaging, sample requests…"
              {...register('description')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Quantity *</label>
              <input
                className="input"
                type="number"
                step="any"
                min="0.01"
                {...register('quantity', { required: 'Required' })}
              />
              {errors.quantity && <p className="field-error">{errors.quantity.message}</p>}
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="input" {...register('unit')}>
                <option value="kg">kg</option>
                <option value="MT">MT</option>
                <option value="bag">bag</option>
              </select>
            </div>
            <div>
              <label className="label">Required delivery date</label>
              <input className="input" type="date" {...register('requiredDeliveryDate')} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Budget (USD, optional)</label>
              <input className="input" type="number" step="any" min="1" {...register('budget')} />
            </div>
            <div>
              <label className="label">Payment terms</label>
              <input className="input" placeholder='e.g. "L/C at sight", "Wire transfer"' {...register('terms')} />
            </div>
          </div>
        </section>

        <section className="card space-y-4">
          <p className="font-semibold text-white">Send to</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className={`flex-1 cursor-pointer rounded-xl border p-4 ${mode === 'specific' ? 'border-brand-500 bg-brand-100/70' : 'border-white/10 bg-white/5'}`}>
              <input type="radio" className="mr-2" checked={mode === 'specific'} onChange={() => setMode('specific')} />
              A specific supplier
            </label>
            <label className={`flex-1 cursor-pointer rounded-xl border p-4 ${mode === 'broadcast' ? 'border-brand-500 bg-brand-100/70' : 'border-white/10 bg-white/5'}`}>
              <input type="radio" className="mr-2" checked={mode === 'broadcast'} onChange={() => setMode('broadcast')} />
              Broadcast to all suppliers in this category
            </label>
          </div>
          {mode === 'specific' && (
            <div>
              <label className="label">Supplier *</label>
              <select className="input" {...register('supplierId', { required: mode === 'specific' })}>
                <option value="">Select a supplier…</option>
                {params.get('supplierId') && params.get('supplierName') && (
                  <option value={params.get('supplierId')}>{params.get('supplierName')}</option>
                )}
                {suppliers
                  .filter((s) => s.id !== params.get('supplierId'))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName}
                    </option>
                  ))}
              </select>
              {errors.supplierId && <p className="field-error">Please select a supplier</p>}
            </div>
          )}
        </section>

        <button className="btn-primary px-8" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send RFQ'}
        </button>
      </form>
    </div>
  );
}
