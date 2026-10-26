// Bootstrap form field with inline validation message
export default function Field({ label, name, error, children, as = 'input', ...props }) {
  const cls = `${as === 'select' ? 'form-select' : 'form-control'}${error ? ' is-invalid' : ''}`;
  const Tag = as;
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label fw-medium">{label}</label>
      <Tag id={name} name={name} className={cls} {...props}>{children}</Tag>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
