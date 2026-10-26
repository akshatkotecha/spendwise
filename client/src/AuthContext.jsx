import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, payload) => {
    const d = await api(path, { method: 'POST', body: payload });
    setToken(d.token);
    setUser(d.user);
  };

  const value = {
    user,
    loading,
    login: (p) => authenticate('/auth/login', p),
    register: (p) => authenticate('/auth/register', p),
    logout: () => {
      setToken(null);
      setUser(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
