import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

const features = [
  { icon: '🧾', title: 'Track every expense', text: 'Log spending in seconds with categories, dates and notes. Search and filter anytime.' },
  { icon: '🎯', title: 'Set monthly budgets', text: 'Give each category a limit and watch live progress bars warn you before you overspend.' },
  { icon: '📊', title: 'See where money goes', text: 'A clear dashboard breaks your month down by category so you can spend smarter.' },
  { icon: '🔒', title: 'Private & secure', text: 'Passwords are hashed and every request is protected with JWT authentication.' },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero text-white text-center">
        <div className="container py-5">
          <h1 className="display-4 fw-bold">Take control of your money</h1>
          <p className="lead mx-auto mb-4" style={{ maxWidth: 620 }}>
            SpendWise helps you record expenses, set budgets and understand your spending — all in one place.
          </p>
          {user ? (
            <Link to="/dashboard" className="btn btn-light btn-lg">Go to dashboard</Link>
          ) : (
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <Link to="/register" className="btn btn-light btn-lg">Get started free</Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">I have an account</Link>
            </div>
          )}
        </div>
      </section>

      <section className="container py-5">
        <h2 className="text-center fw-bold mb-4">Everything you need</h2>
        <div className="row g-4">
          {features.map((f) => (
            <div className="col-12 col-sm-6 col-lg-3" key={f.title}>
              <div className="card h-100 border-0 shadow-sm text-center p-3">
                <div className="display-5">{f.icon}</div>
                <h5 className="mt-2">{f.title}</h5>
                <p className="text-muted mb-0">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">How it works</h2>
          <div className="row g-4">
            {['Create your free account', 'Add expenses as you spend', 'Set budgets and stay on track'].map((s, i) => (
              <div className="col-md-4" key={s}>
                <div className="step-badge mx-auto mb-2">{i + 1}</div>
                <p className="fw-medium">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
