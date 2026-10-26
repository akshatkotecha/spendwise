import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Field from '../components/Field.jsx';

const validate = (v) => {
  const e = {};
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address';
  if (!v.password) e.password = 'Password is required';
  return e;
};

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const onChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await login(values);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 440 }}>
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-1">Welcome back</h3>
        <p className="text-muted">Log in to your SpendWise account.</p>
        {serverError && <div className="alert alert-danger py-2">{serverError}</div>}
        <form onSubmit={onSubmit} noValidate>
          <Field label="Email" name="email" type="email" value={values.email} onChange={onChange} error={errors.email} autoComplete="email" />
          <Field label="Password" name="password" type="password" value={values.password} onChange={onChange} error={errors.password} autoComplete="current-password" />
          <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        </form>
        <p className="text-center mt-3 mb-0">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}
