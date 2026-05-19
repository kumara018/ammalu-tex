'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, ShoppingBag, Users, TrendingUp, Plus, Pencil,
  Trash2, Eye, EyeOff, X, AlertCircle, CheckCircle,
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Chudithar', 'Tops', 'Lehenga', 'Crop Tops', 'Party Wears'];
const ORDER_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];
const SIZE_OPTIONS   = ['XS','S','M','L','XL','XXL','Free Size'];

interface DashData { total_products: number; active_products: number; total_users: number; total_orders: number; pending_orders: number; total_revenue: number; recent_orders: any[]; }

const emptyProduct = {
  name:'', description:'', price:'', compare_price:'', category:'Chudithar',
  fabric:'', size_options:[] as string[], colors:[] as string[],
  images:[] as string[], stock:'', is_featured:false,
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'dash'|'products'|'orders'|'users'>('dash');
  const [dash, setDash] = useState<DashData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [formErrors, setFormErrors] = useState<any>({});
  const [colorInput, setColorInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;            // wait for localStorage restore
    if (!user) return;                  // middleware already blocked non-users
    if (!user.is_admin) { router.push('/'); return; }  // block non-admins
    loadDash();
  }, [user, authLoading]);

  const loadDash = async () => {
    try {
      const res = await adminAPI.dashboard();
      setDash(res.data);
    } catch {} finally { setLoading(false); }
  };

  const loadProducts = async () => {
    setLoading(true);
    try { const res = await adminAPI.getProducts(); setProducts(res.data); }
    catch {} finally { setLoading(false); }
  };

  const loadOrders = async () => {
    setLoading(true);
    try { const res = await adminAPI.getOrders(); setOrders(res.data); }
    catch {} finally { setLoading(false); }
  };

  const loadUsers = async () => {
    setLoading(true);
    try { const res = await adminAPI.getUsers(); setUsers(res.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'dash') loadDash();
    if (tab === 'products') loadProducts();
    if (tab === 'orders') loadOrders();
    if (tab === 'users') loadUsers();
  }, [tab]);

  const validateForm = () => {
    const e: any = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    else if (form.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Price must be greater than 0';
    if (!form.category) e.category = 'Category is required';
    const stock = Number(form.stock);
    if (form.stock === '' || isNaN(stock) || stock < 0) e.stock = 'Stock must be 0 or more';
    if (form.compare_price && Number(form.compare_price) <= 0) e.compare_price = 'Compare price must be greater than 0';
    if (form.compare_price && Number(form.compare_price) <= Number(form.price)) e.compare_price = 'Compare price must be higher than selling price';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyProduct });
    setFormErrors({});
    setColorInput('');
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : '',
      category: p.category, fabric: p.fabric || '',
      size_options: p.size_options || [], colors: p.colors || [],
      images: p.images || [], stock: String(p.stock), is_featured: p.is_featured,
    });
    setFormErrors({});
    setColorInput('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!validateForm()) { toast.error('Please fix all errors before saving'); return; }
    setSaving(true);
    try {
      const data: any = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        category: form.category,
        fabric: form.fabric.trim() || null,
        size_options: form.size_options,
        colors: form.colors,
        images: form.images,
        stock: Number(form.stock),
        is_featured: form.is_featured,
      };
      if (editing) {
        await adminAPI.updateProduct(editing.id, data);
        toast.success('Product updated successfully!');
      } else {
        await adminAPI.createProduct(data);
        toast.success('Product added successfully!');
      }
      setShowForm(false);
      loadProducts();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail.map((d: any) => d.msg).join('. ') : (detail || 'Failed to save product'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deactivate product "${name}"?`)) return;
    try {
      await adminAPI.deleteProduct(id);
      toast.success('Product deactivated');
      loadProducts();
    } catch { toast.error('Failed to deactivate product'); }
  };

  const handleOrderStatus = async (id: number, status: string) => {
    try {
      await adminAPI.updateOrderStatus(id, status);
      toast.success('Order status updated');
      loadOrders();
    } catch { toast.error('Failed to update status'); }
  };

  const toggleSize = (s: string) => {
    setForm(f => ({
      ...f,
      size_options: f.size_options.includes(s)
        ? f.size_options.filter(x => x !== s)
        : [...f.size_options, s],
    }));
  };

  const addColor = () => {
    const c = colorInput.trim();
    if (!c) return;
    if (!form.colors.includes(c)) setForm(f => ({ ...f, colors: [...f.colors, c] }));
    setColorInput('');
  };

  const F = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  if (!user?.is_admin) return null;

  const TABS = [
    { key: 'dash',     label: 'Dashboard' },
    { key: 'products', label: 'Products'  },
    { key: 'orders',   label: 'Orders'    },
    { key: 'users',    label: 'Customers' },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="section-title">Admin Panel</h1>
          <p className="text-sm text-gray-500">Ammalu Tex Store Management</p>
        </div>
        {tab === 'products' && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-orange-200 mb-6 gap-1 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${tab === key ? 'border-maroon-800 text-maroon-800 bg-maroon-50' : 'border-transparent text-gray-500 hover:text-maroon-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === 'dash' && dash && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Active Products', value: dash.active_products, icon: Package,     color: 'bg-purple-50 text-purple-700' },
              { label: 'Total Customers', value: dash.total_users,     icon: Users,       color: 'bg-blue-50 text-blue-700' },
              { label: 'Total Orders',    value: dash.total_orders,    icon: ShoppingBag, color: 'bg-orange-50 text-orange-700' },
              { label: 'Pending Orders',  value: dash.pending_orders,  icon: Package,     color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Total Revenue',   value: `₹${dash.total_revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-50 text-green-700' },
              { label: 'All Products',    value: dash.total_products,  icon: Package,     color: 'bg-maroon-50 text-maroon-700' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color}`}><Icon size={22} /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-maroon-900 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b border-orange-100">
                  <th className="pb-3 pr-4">Order #</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-orange-50">
                  {dash.recent_orders.map((o) => (
                    <tr key={o.id} className="hover:bg-orange-50">
                      <td className="py-3 pr-4 font-mono font-medium text-maroon-800">{o.order_number}</td>
                      <td className="py-3 pr-4 font-semibold">₹{o.total.toLocaleString()}</td>
                      <td className="py-3 pr-4"><span className="capitalize badge badge-info">{o.status}</span></td>
                      <td className="py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      {tab === 'products' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-maroon-50">
                <tr className="text-left text-maroon-800 text-xs font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {loading ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                )) : products.map((p) => (
                  <tr key={p.id} className={`hover:bg-orange-50 ${!p.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                      {p.is_featured && <span className="text-[10px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded font-medium">Featured</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-maroon-900">₹{p.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.is_active ? 'badge-success' : 'badge-danger'}>{p.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-maroon-100 rounded-lg text-maroon-700 transition-colors" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors" title="Deactivate">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-maroon-50">
                <tr className="text-left text-maroon-800 text-xs font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {loading ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                )) : orders.map((o) => (
                  <tr key={o.id} className="hover:bg-orange-50">
                    <td className="px-4 py-3 font-mono font-medium text-maroon-800 text-xs">{o.order_number}</td>
                    <td className="px-4 py-3 text-gray-700">{(o.shipping_address as any)?.full_name}</td>
                    <td className="px-4 py-3 font-bold text-maroon-900">₹{o.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium capitalize ${o.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                        {o.payment_method} · {o.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize badge badge-info text-xs">{o.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatus(o.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-maroon-500"
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-maroon-50">
                <tr className="text-left text-maroon-800 text-xs font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {loading ? null : users.map((u) => (
                  <tr key={u.id} className="hover:bg-orange-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={u.is_active ? 'badge-success' : 'badge-danger'}>{u.is_active ? 'Active' : 'Blocked'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-orange-100">
              <h2 className="font-bold text-xl text-maroon-900">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="label">Product Name *</label>
                <input value={form.name} onChange={F('name')} placeholder="e.g. Kashmiri Floral Chudithar Set" className={`input-field ${formErrors.name ? 'input-error' : ''}`} />
                {formErrors.name && <p className="error-msg mt-1"><AlertCircle size={13} />{formErrors.name}</p>}
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea value={form.description} onChange={F('description')} rows={3} placeholder="Detailed product description..." className={`input-field resize-none ${formErrors.description ? 'input-error' : ''}`} />
                {formErrors.description && <p className="error-msg mt-1"><AlertCircle size={13} />{formErrors.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Selling Price (₹) *</label>
                  <input type="number" value={form.price} onChange={F('price')} placeholder="999" min="1" className={`input-field ${formErrors.price ? 'input-error' : ''}`} />
                  {formErrors.price && <p className="error-msg mt-1"><AlertCircle size={13} />{formErrors.price}</p>}
                </div>
                <div>
                  <label className="label">MRP / Compare Price (₹)</label>
                  <input type="number" value={form.compare_price} onChange={F('compare_price')} placeholder="1499 (optional)" min="1" className={`input-field ${formErrors.compare_price ? 'input-error' : ''}`} />
                  {formErrors.compare_price && <p className="error-msg mt-1"><AlertCircle size={13} />{formErrors.compare_price}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select value={form.category} onChange={F('category')} className={`input-field ${formErrors.category ? 'input-error' : ''}`}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Fabric</label>
                  <input value={form.fabric} onChange={F('fabric')} placeholder="Cotton, Silk, Georgette..." className="input-field" />
                </div>
              </div>
              <div>
                <label className="label">Stock Quantity *</label>
                <input type="number" value={form.stock} onChange={F('stock')} placeholder="50" min="0" className={`input-field ${formErrors.stock ? 'input-error' : ''}`} />
                {formErrors.stock && <p className="error-msg mt-1"><AlertCircle size={13} />{formErrors.stock}</p>}
              </div>
              <div>
                <label className="label">Available Sizes</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SIZE_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${form.size_options.includes(s) ? 'bg-maroon-800 border-maroon-800 text-white' : 'border-gray-200 text-gray-600 hover:border-maroon-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Available Colours</label>
                <div className="flex gap-2 mb-2">
                  <input value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} placeholder="Type colour name and press Enter" className="input-field flex-1 py-2" />
                  <button type="button" onClick={addColor} className="btn-secondary px-4 py-2">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.colors.map(c => (
                    <span key={c} className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      {c}
                      <button onClick={() => setForm(f => ({ ...f, colors: f.colors.filter(x => x !== c) }))} className="hover:text-red-600"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-orange-50">
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 accent-maroon-800" />
                <div>
                  <p className="font-medium text-sm text-gray-800">Mark as Featured</p>
                  <p className="text-xs text-gray-500">Featured products appear on the homepage</p>
                </div>
              </label>
            </div>
            <div className="p-6 border-t border-orange-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-3">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                {saving ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</> : <><CheckCircle size={16} /> {editing ? 'Save Changes' : 'Add Product'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
