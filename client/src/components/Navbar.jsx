import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const link = ({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`;

  return (
    <nav className="navbar navbar-expand-md navbar-dark sw-nav sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">💸 SpendWise</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><NavLink end className={link} to="/">Home</NavLink></li>
            {user && (
              <>
                <li className="nav-item"><NavLink className={link} to="/dashboard">Dashboard</NavLink></li>
                <li className="nav-item"><NavLink className={link} to="/expenses">Expenses</NavLink></li>
                <li className="nav-item"><NavLink className={link} to="/budgets">Budgets</NavLink></li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="text-white-50 small">Hi, {user.name.split(' ')[0]}</span>
                <button className="btn btn-outline-light btn-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
                <Link className="btn btn-light btn-sm" to="/register">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
