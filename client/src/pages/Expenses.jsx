import { useCallback, useEffect, useState } from 'react';
import { api, CATEGORIES, money } from '../api.js';
import Field from '../components/Field.jsx';

const today = () => new Date().toISOString().slice(0, 10);
const empty = () => ({ title: '', amount: '', category: 'Food', date: today(), note: '' });

const validate = (v) => {
  const e = {};
  if (v.title.trim().length < 2) e.title = 'Title must be at least 2 characters';
  if (!(Number(v.amount) > 0)) e.amount = 'Amount must be greater than 0';
  if (!CATEGORIES.includes(v.category)) e.category = 'Choose a category';
  if (!v.date) e.date = 'Pick a date';
  else if (v.date > today()) e.date = 'Date cannot be in the future';
  if (v.note.length > 200) e.note = 'Note can be at most 200 characters';
  return e;
};

export default function Expenses() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ q: '', category: '', month: '' });
  const [values, setValues] = useState(empty());
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && p.set(k, v));
    api(`/expenses?${p}`).then(setItems).catch((e) => setMsg({ type: 'danger', text: e.message }));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const onChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const body = { ...values, amount: Number(values.amount) };
      await api(editId ? `/expenses/${editId}` : '/expenses', { method: editId ? 'PUT' : 'POST', body });
      setMsg({ type: 'success', text: editId ? 'Expense updated' : 'Expense added' });
      setValues(empty());
      setEditId(null);
      load();
    } catch (err) {
      setErrors(err.fields || {});
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const edit = (x) => {
    setEditId(x._id);
    setErrors({});
    setValues({ title: x.title, amount: String(x.amount), category: x.category, date: x.date.slice(0, 10), note: x.note || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api(`/expenses/${id}`, { method: 'DELETE' });
      setMsg({ type: 'success', text: 'Expense deleted' });
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  const total = items.reduce((a, x) => a + x.amount, 0);

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Expenses</h2>
      {msg.text && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 p-3">
            <h5>{editId ? 'Edit expense' : 'Add expense'}</h5>
            <form onSubmit={onSubmit} noValidate>
              <Field label="Title" name="title" value={values.title} onChange={onChange} error={errors.title} placeholder="e.g. Lunch" />
              <Field label="Amount (₹)" name="amount" type="number" step="0.01" min="0" value={values.amount} onChange={onChange} error={errors.amount} />
              <Field label="Category" name="category" as="select" value={values.category} onChange={onChange} error={errors.category}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Field>
              <Field label="Date" name="date" type="date" max={today()} value={values.date} onChange={onChange} error={errors.date} />
              <Field label="Note (optional)" name="note" as="textarea" rows={2} value={values.note} onChange={onChange} error={errors.note} />
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-fill" disabled={busy}>{editId ? 'Save changes' : 'Add expense'}</button>
                {editId && <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditId(null); setValues(empty()); setErrors({}); }}>Cancel</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-3">
            <div className="row g-2 mb-3">
              <div className="col-sm-4"><input className="form-control" placeholder="Search title…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} /></div>
              <div className="col-sm-4">
                <select className="form-select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                  <option value="">All categories</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-sm-4"><input type="month" className="form-control" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} /></div>
            </div>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">{items.length} expense(s)</span><strong>Total: {money(total)}</strong></div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead><tr><th>Date</th><th>Title</th><th>Category</th><th className="text-end">Amount</th><th /></tr></thead>
                <tbody>
                  {items.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-4">No expenses found.</td></tr>}
                  {items.map((x) => (
                    <tr key={x._id}>
                      <td className="text-nowrap">{new Date(x.date).toLocaleDateString('en-IN', { timeZone: 'UTC' })}</td>
                      <td>{x.title}{x.note && <div className="small text-muted">{x.note}</div>}</td>
                      <td><span className="badge text-bg-secondary">{x.category}</span></td>
                      <td className="text-end">{money(x.amount)}</td>
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => edit(x)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(x._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
