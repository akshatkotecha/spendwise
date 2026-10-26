import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import Budgets from './pages/Budgets.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/expenses" element={<Protected><Expenses /></Protected>} />
          <Route path="/budgets" element={<Protected><Budgets /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="text-center text-muted small py-4">SpendWise &copy; {new Date().getFullYear()} — MERN Mini-Project</footer>
    </>
  );
}
