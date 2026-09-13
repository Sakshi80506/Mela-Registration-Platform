import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogIn, Lock, Mail, ArrowRight, ShieldCheck, Palette, Ticket, KeyRound, MailCheck, HelpCircle, X } from 'lucide-react';
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

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { login, resetPassword, currentUser, role } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Login | Kaarigar Expo";
  }, []);

  const redirectByRole = (userRole) => {
    const r = (userRole || 'visitor').toLowerCase();
    const from = location.state?.from?.pathname;

    // Only redirect to 'from' if it matches the chosen role's portal
    if (from && from.startsWith(`/${r}`)) {
      navigate(from, { replace: true });
      return;
    }

    if (r === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (r === 'kaarigar') {
      navigate('/kaarigar/profile', { replace: true });
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
      const profile = await login(email, password, activeTab);
      showSuccess(`Welcome back, ${profile?.name || 'User'}! Signed in to ${activeTab.toUpperCase()} portal.`);
      redirectByRole(activeTab);
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

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      showError('Please enter your registered email address.');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
      showSuccess(`Password reset link sent to ${resetEmail}! Check your inbox.`);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        showError('No registered account found with this email address.');
      } else {
        showError(err.message || 'Failed to send password reset link.');
      }
    } finally {
      setResetLoading(false);
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

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetSent(false);
                    setShowForgotModal(true);
                  }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--color-primary)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <FormInput
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

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

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '1rem'
          }}>
            <div className="card" style={{
              maxWidth: '440px', width: '100%', padding: '2rem',
              position: 'relative', boxShadow: 'var(--shadow-xl)',
              animation: 'fadeIn 0.2s ease'
            }}>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)'
                }}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: 'var(--color-bg-alt)', color: 'var(--color-primary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <KeyRound size={24} color="var(--color-secondary-dark)" />
                </div>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--color-primary)', margin: 0 }}>
                  Reset Your Password
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                  Enter your registered email address to receive a secure password reset link.
                </p>
              </div>

              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <MailCheck size={44} color="var(--color-success)" style={{ margin: '0 auto 0.75rem' }} />
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-success)', marginBottom: '0.4rem' }}>
                    Reset Link Dispatched!
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    We've emailed a password recovery link to <strong>{resetEmail}</strong>. Follow the instructions in the email to set a new password.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendResetEmail}>
                  <FormInput
                    id="reset-email"
                    type="email"
                    label="Registered Email Address"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                  />

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                      onClick={() => setShowForgotModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      disabled={resetLoading}
                    >
                      {resetLoading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;

