import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, UserPlus, Palette, Ticket, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/common/FormInput';

const Register = () => {
  const [role, setRole] = useState('kaarigar'); // default kaarigar
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register | Kaarigar Expo";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !phone) {
      showError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role, phone);
      showSuccess(`Account created successfully! Welcome to Kaarigar Expo.`);
      
      if (role === 'kaarigar') {
        navigate('/kaarigar/profile', { replace: true });
      } else {
        navigate('/visitor/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        showError('This email is already registered. Please log in.');
      } else {
        showError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem 2rem', borderTop: '4px solid var(--color-secondary)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-secondary-dark)', marginBottom: '1rem' }}>
            <Sparkles size={26} />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Create Your Account</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Join India's premier handicraft and cultural exhibition platform
          </p>
        </div>

        {/* Role Selection Toggle */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
            I want to register as:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setRole('kaarigar')}
              className="card"
              style={{
                padding: '1rem',
                textAlign: 'center',
                cursor: 'pointer',
                borderColor: role === 'kaarigar' ? 'var(--color-primary)' : 'var(--color-border)',
                background: role === 'kaarigar' ? 'var(--color-bg-alt)' : 'var(--color-surface)',
                borderWidth: role === 'kaarigar' ? '2px' : '1px'
              }}
            >
              <Palette size={24} color="var(--color-primary)" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>Kaarigar</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Artisan / Exhibitor</div>
            </button>

            <button
              type="button"
              onClick={() => setRole('visitor')}
              className="card"
              style={{
                padding: '1rem',
                textAlign: 'center',
                cursor: 'pointer',
                borderColor: role === 'visitor' ? 'var(--color-secondary-dark)' : 'var(--color-border)',
                background: role === 'visitor' ? 'var(--color-bg-alt)' : 'var(--color-surface)',
                borderWidth: role === 'visitor' ? '2px' : '1px'
              }}
            >
              <Ticket size={24} color="var(--color-secondary-dark)" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-secondary-dark)' }}>Visitor</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Attendee / Buyer</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <FormInput
            id="register-name"
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Radheshyam Sharma"
          />

          <div className="form-grid-2">
            <FormInput
              id="register-email"
              type="email"
              label="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <FormInput
              id="register-phone"
              type="tel"
              label="Phone Number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
            />
          </div>

          <div className="form-grid-2">
            <FormInput
              id="register-password"
              type="password"
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
            <FormInput
              id="register-confirm-password"
              type="password"
              label="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-secondary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '1.25rem' }}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} /> Register as {role === 'kaarigar' ? 'Kaarigar' : 'Visitor'}
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-light)', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Already registered? </span>
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            Sign In <ArrowRight size={14} style={{ display: 'inline' }} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
