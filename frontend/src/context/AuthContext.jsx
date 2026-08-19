import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loginAdmin, fetchCurrentAdmin } from '../api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'fuelfinder_admin_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On first load, if a token is already stored, verify it's still valid
  // and load the admin's details instead of trusting it blindly.
  useEffect(() => {
    let cancelled = false;

    async function verifyStoredToken() {
      if (!token) {
        setCheckingSession(false);
        return;
      }
      try {
        const { user: currentUser } = await fetchCurrentAdmin(token);
        if (!cancelled) setUser(currentUser);
      } catch (err) {
        // Token expired or invalid — clear it silently.
        if (!cancelled) {
          setToken(null);
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    verifyStoredToken();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { token: newToken, user: loggedInUser } = await loginAdmin(email, password);
    setToken(newToken);
    setUser(loggedInUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    checkingSession,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
