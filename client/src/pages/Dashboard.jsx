import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function Dashboard() {
  const [month, setMonth] = useState(thisMonth());
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    Promise.all([api(`/budgets?month=${month}`), api(`/expenses?month=${month}`)])
      .then(([s, ex]) => {
        setSummary(s);
        setRecent(ex.slice(0, 5));
      })
      .catch((e) => setError(e.message));
  }, [month]);

  const totalBudget = summary ? summary.budgets.reduce((a, b) => a + b.limit, 0) : 0;
  const cats = summary ? Object.entries(summary.spentByCategory).sort((a, b) => b[1] - a[1]) : [];
  const max = cats.length ? cats[0][1] : 1;

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="fw-bold mb-0">Dashboard</h2>
        <input type="month" className="form-control w-auto" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Month" />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {!summary ? (
        !error && <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4"><div className="card stat shadow-sm border-0 p-3"><div className="text-muted">Spent this month</div><div className="fs-3 fw-bold">{money(summary.totalSpent)}</div></div></div>
            <div className="col-md-4"><div className="card stat shadow-sm border-0 p-3"><div className="text-muted">Total budget</div><div className="fs-3 fw-bold">{totalBudget ? money(totalBudget) : '—'}</div></div></div>
            <div className="col-md-4"><div className="card stat shadow-sm border-0 p-3"><div className="text-muted">Remaining</div>
              <div className={`fs-3 fw-bold ${totalBudget - summary.totalSpent < 0 ? 'text-danger' : 'text-success'}`}>{totalBudget ? money(totalBudget - summary.totalSpent) : '—'}</div></div></div>
          </div>

          <div className="row g-3">
            <div className="col-lg-7">
              <div className="card shadow-sm border-0 p-3 h-100">
                <h5>Spending by category</h5>
                {cats.length === 0 ? (
                  <p className="text-muted mb-0">No expenses this month. <Link to="/expenses">Add one</Link>.</p>
                ) : cats.map(([c, v]) => (
                  <div className="mb-2" key={c}>
                    <div className="d-flex justify-content-between small"><span>{c}</span><span>{money(v)}</span></div>
                    <div className="progress" style={{ height: 10 }}><div className="progress-bar" style={{ width: `${(v / max) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card shadow-sm border-0 p-3 h-100">
                <div className="d-flex justify-content-between"><h5>Recent expenses</h5><Link to="/expenses" className="small">View all</Link></div>
                {recent.length === 0 ? <p className="text-muted mb-0">Nothing yet.</p> : (
                  <ul className="list-group list-group-flush">
                    {recent.map((x) => (
                      <li key={x._id} className="list-group-item px-0 d-flex justify-content-between">
                        <span>{x.title} <span className="badge text-bg-light">{x.category}</span></span>
                        <strong>{money(x.amount)}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {summary.budgets.some((b) => b.spent > b.limit) && (
            <div className="alert alert-warning mt-4">
              ⚠️ Over budget in: {summary.budgets.filter((b) => b.spent > b.limit).map((b) => b.category).join(', ')}.
            </div>
          )}
        </>
      )}
    </div>
  );
}
