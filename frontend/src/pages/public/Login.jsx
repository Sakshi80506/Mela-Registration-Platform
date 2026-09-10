import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogIn, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/common/FormInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, currentUser, role } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Login | Kaarigar Expo";
    // If already logged in, redirect to respective dashboard
    if (currentUser && role) {
      redirectByRole(role);
    }
  }, [currentUser, role]);

  const redirectByRole = (userRole) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    if (userRole === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (userRole === 'kaarigar') {
      navigate('/kaarigar/dashboard', { replace: true });
    } else {
      navigate('/visitor/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const profile = await login(email, password);
      showSuccess(`Welcome back, ${profile?.name || 'User'}!`);
      redirectByRole(profile?.role || 'visitor');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        showError('Invalid email or password.');
      } else {
        showError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem 6rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem 2rem', borderTop: '4px solid var(--color-primary)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-primary)', marginBottom: '1rem' }}>
            <Sparkles size={26} color="var(--color-secondary-dark)" />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Account Login</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Access your Kaarigar, Visitor, or Admin portal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormInput
            id="login-email"
            type="email"
            label="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <FormInput
            id="login-password"
            type="password"
            label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '1.25rem' }}
          >
            {loading ? 'Signing in...' : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-light)', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            Register here <ArrowRight size={14} style={{ display: 'inline' }} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
