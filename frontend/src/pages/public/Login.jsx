import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogIn, Lock, Mail, ArrowRight, ShieldCheck, Palette, Ticket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/common/FormInput';

const ROLE_TABS = [
  {
    key: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    color: 'var(--color-primary)',
    bg: 'var(--color-bg-alt)',
    hint: 'Sign in as Platform Administrator to create melas, approve/reject kaarigar applications, and oversee visitors.',
    tagline: 'Platform Administrator'
  },
  {
    key: 'kaarigar',
    label: 'Kaarigar',
    icon: Palette,
    color: 'var(--color-secondary-dark)',
    bg: 'var(--color-bg-alt)',
    hint: 'Sign in to manage your artisan profile, apply to melas, and track your stall applications.',
    tagline: 'Artisan / Exhibitor'
  },
  {
    key: 'visitor',
    label: 'Visitor',
    icon: Ticket,
    color: 'var(--color-success)',
    bg: 'var(--color-bg-alt)',
    hint: 'Sign in to browse melas, RSVP for events, and discover participating artisans.',
    tagline: 'Event Attendee'
  }
];

const Login = () => {
  const [activeTab, setActiveTab] = useState('kaarigar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, currentUser, role } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Login | Kaarigar Expo";
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
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        showError('Invalid email or password.');
      } else {
        showError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentTab = ROLE_TABS.find((t) => t.key === activeTab);
  const TabIcon = currentTab.icon;

  return (
    <div className="container" style={{ padding: '4rem 1.5rem 6rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'var(--color-bg-alt)', color: 'var(--color-primary)', marginBottom: '1rem'
          }}>
            <Sparkles size={28} color="var(--color-secondary-dark)" />
          </div>
          <h1 style={{ fontSize: '1.9rem', color: 'var(--color-primary)' }}>Sign In to Kaarigar Expo</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Choose your role and log in to your portal
          </p>
        </div>

        {/* Role Tabs */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.75rem', marginBottom: '1.75rem'
        }}>
          {ROLE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                id={`login-tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                  padding: '0.9rem 0.5rem', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  border: isActive ? `2px solid ${tab.color}` : '2px solid var(--color-border)',
                  background: isActive ? tab.bg : 'var(--color-surface)',
                  transition: 'all 0.18s ease',
                  fontFamily: 'inherit'
                }}
              >
                <Icon size={22} color={isActive ? tab.color : 'var(--color-text-muted)'} />
                <span style={{
                  fontWeight: 700, fontSize: '0.88rem',
                  color: isActive ? tab.color : 'var(--color-text-muted)'
                }}>
                  {tab.label}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                  {tab.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hint box */}
        <div style={{
          background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
          marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem'
        }}>
          <TabIcon size={16} color={currentTab.color} style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
            {currentTab.hint}
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '2rem', borderTop: `4px solid ${currentTab.color}` }}>
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
              style={{ marginTop: '1.25rem', background: currentTab.key === 'admin' ? 'var(--color-primary)' : undefined }}
            >
              {loading ? 'Signing in...' : (
                <>
                  <LogIn size={18} /> Sign In as {currentTab.label}
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '1.75rem', textAlign: 'center',
            paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-light)',
            fontSize: '0.88rem'
          }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              Register here <ArrowRight size={14} style={{ display: 'inline' }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
