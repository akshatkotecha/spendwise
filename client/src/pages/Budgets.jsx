import { useCallback, useEffect, useState } from 'react';
import { api, CATEGORIES, money } from '../api.js';
import Field from '../components/Field.jsx';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function Budgets() {
  const [month, setMonth] = useState(thisMonth());
  const [data, setData] = useState({ budgets: [] });
  const [values, setValues] = useState({ category: 'Food', limit: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = useCallback(() => {
    api(`/budgets?month=${month}`).then(setData).catch((e) => setMsg({ type: 'danger', text: e.message }));
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!CATEGORIES.includes(values.category)) found.category = 'Choose a category';
    if (!(Number(values.limit) >= 1)) found.limit = 'Limit must be at least 1';
    if (!month) found.month = 'Choose a month';
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await api('/budgets', { method: 'POST', body: { category: values.category, month, limit: Number(values.limit) } });
      setMsg({ type: 'success', text: `Budget saved for ${values.category}` });
      setValues({ ...values, limit: '' });
      load();
    } catch (err) {
      setErrors(err.fields || {});
      setMsg({ type: 'danger', text: err.message });
    }
  };

  const remove = async (id) => {
    await api(`/budgets/${id}`, { method: 'DELETE' }).catch((e) => setMsg({ type: 'danger', text: e.message }));
    load();
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Budgets</h2>
      {msg.text && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 p-3">
            <h5>Set a budget</h5>
            <form onSubmit={onSubmit} noValidate>
              <Field label="Month" name="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} error={errors.month} />
              <Field label="Category" name="category" as="select" value={values.category} onChange={(e) => setValues({ ...values, category: e.target.value })} error={errors.category}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Field>
              <Field label="Monthly limit (₹)" name="limit" type="number" min="1" value={values.limit} onChange={(e) => setValues({ ...values, limit: e.target.value })} error={errors.limit} />
              <button className="btn btn-primary w-100">Save budget</button>
            </form>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-3">
            <h5>Budgets for {month}</h5>
            {data.budgets.length === 0 && <p className="text-muted mb-0">No budgets set for this month yet.</p>}
            {data.budgets.map((b) => {
              const pct = Math.round((b.spent / b.limit) * 100);
              const color = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'success';
              return (
                <div className="mb-3" key={b._id}>
                  <div className="d-flex justify-content-between">
                    <strong>{b.category}</strong>
                    <span>{money(b.spent)} / {money(b.limit)} <button className="btn btn-sm btn-link text-danger p-0 ms-2" onClick={() => remove(b._id)}>remove</button></span>
                  </div>
                  <div className="progress" style={{ height: 14 }} role="progressbar" aria-valuenow={Math.min(pct, 100)} aria-valuemin="0" aria-valuemax="100">
                    <div className={`progress-bar bg-${color}`} style={{ width: `${Math.min(pct, 100)}%` }}>{pct}%</div>
                  </div>
                  {pct >= 100 && <div className="small text-danger">Over budget by {money(b.spent - b.limit)}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
