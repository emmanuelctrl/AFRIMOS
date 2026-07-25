import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api, { apiError } from '../../api/client';
import Spinner from '../../components/Spinner';
import { CATEGORIES, CERTIFICATIONS } from '../SuppliersDirectory';

function ProductModal({ product, supplierId, onClose, onSaved }) {
  const [error, setError] = useState('');
  const [image, setImage] = useState(product?.image || null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: product
      ? { ...product, certifications: product.certifications || [] }
      : { category: 'Coffee', unit: 'kg', quality: 'Standard', minimumOrderQuantity: 1, certifications: [] },
  });

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await api.post('/upload', form);
      setImage(data.url);
    } catch (err) {
      setError(apiError(err, 'Image upload failed'));
    }
  };

  const onSubmit = async (values) => {
    setError('');
    const payload = {
      category: values.category,
      name: values.name,
      description: values.description || null,
      pricePerUnit: Number(values.pricePerUnit),
      unit: values.unit,
      minimumOrderQuantity: Number(values.minimumOrderQuantity) || 1,
      maximumOrderQuantity: values.maximumOrderQuantity ? Number(values.maximumOrderQuantity) : null,
      origin: values.origin || null,
      quality: values.quality,
      certifications: values.certifications || [],
      image,
    };
    try {
      if (product) {
        await api.put(`/products/${product.id}`, payload);
      } else {
        await api.post(`/suppliers/${supplierId}/products`, payload);
      }
      onSaved();
    } catch (err) {
      setError(apiError(err, 'Could not save product'));
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-white/80 p-6 shadow-glass-lg backdrop-blur-md sm:backdrop-blur-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {product ? 'Edit product' : 'Add product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200" aria-label="Close">
            ✕
          </button>
        </div>
        {error && <p className="mb-3 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Category *</label>
              <select className="input" {...register('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Quality</label>
              <select className="input" {...register('quality')}>
                <option>Standard</option>
                <option>Premium</option>
                <option>Specialty</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Product name *</label>
            <input
              className="input"
              placeholder="e.g. Ethiopian Yirgacheffe Grade 1"
              {...register('name', { required: 'Product name is required' })}
            />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows="3" {...register('description')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Price per unit (USD) *</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0.01"
                {...register('pricePerUnit', { required: 'Required' })}
              />
              {errors.pricePerUnit && <p className="field-error">{errors.pricePerUnit.message}</p>}
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
              <label className="label">MOQ</label>
              <input className="input" type="number" min="1" {...register('minimumOrderQuantity')} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Max order quantity</label>
              <input className="input" type="number" min="1" {...register('maximumOrderQuantity')} />
            </div>
            <div>
              <label className="label">Origin</label>
              <input className="input" placeholder="e.g. Sidamo" {...register('origin')} />
            </div>
          </div>
          <div>
            <label className="label">Certifications</label>
            <div className="flex flex-wrap gap-3">
              {CERTIFICATIONS.map((c) => (
                <label key={c} className="flex items-center gap-1.5 text-sm text-gray-200">
                  <input type="checkbox" value={c} {...register('certifications')} className="rounded" />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {image && <img src={image} alt="" className="h-12 w-12 rounded object-cover" />}
            <label className="btn-secondary cursor-pointer">
              {image ? 'Change image' : 'Upload image'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadImage} />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SupplierProducts() {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | product object

  const load = () =>
    api
      .get('/suppliers/me')
      .then(({ data }) => setSupplier(data.supplier))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    await api.delete(`/products/${product.id}`);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <button className="btn-primary" onClick={() => setModal('new')}>
          + Add Product
        </button>
      </div>

      {supplier.products.length === 0 ? (
        <div className="card py-16 text-center text-gray-400">
          No products yet. Add your first product so buyers can find you.
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="thead-glass">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">MOQ</th>
                <th className="px-6 py-3">Quality</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {supplier.products.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-6 py-3 text-gray-300">{p.category}</td>
                  <td className="px-6 py-3 text-white">
                    ${p.pricePerUnit.toLocaleString()}/{p.unit}
                  </td>
                  <td className="px-6 py-3 text-gray-300">
                    {p.minimumOrderQuantity} {p.unit}
                  </td>
                  <td className="px-6 py-3 text-gray-300">{p.quality}</td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-sm font-medium text-brand-400 hover:underline" onClick={() => setModal(p)}>
                      Edit
                    </button>
                    <button className="ml-4 text-sm font-medium text-red-300 hover:underline" onClick={() => remove(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          supplierId={supplier.id}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}
