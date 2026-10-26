import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Field from '../components/Field.jsx';

const validate = (v) => {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address';
  if (v.password.length < 6) e.password = 'Password must be at least 6 characters';
  else if (!/\d/.test(v.password)) e.password = 'Password must contain a number';
  if (v.confirm !== v.password) e.confirm = 'Passwords do not match';
  return e;
};

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
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
      await register({ name: values.name, email: values.email, password: values.password });
      navigate('/dashboard');
    } catch (err) {
      setErrors(err.fields || {});
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-1">Create account</h3>
        <p className="text-muted">Start tracking your spending today.</p>
        {serverError && <div className="alert alert-danger py-2">{serverError}</div>}
        <form onSubmit={onSubmit} noValidate>
          <Field label="Full name" name="name" value={values.name} onChange={onChange} error={errors.name} autoComplete="name" />
          <Field label="Email" name="email" type="email" value={values.email} onChange={onChange} error={errors.email} autoComplete="email" />
          <Field label="Password" name="password" type="password" value={values.password} onChange={onChange} error={errors.password} autoComplete="new-password" />
          <Field label="Confirm password" name="confirm" type="password" value={values.confirm} onChange={onChange} error={errors.confirm} autoComplete="new-password" />
          <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        </form>
        <p className="text-center mt-3 mb-0">Already registered? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
