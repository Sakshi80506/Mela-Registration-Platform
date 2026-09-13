import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles, Menu, X, LogIn, UserPlus, LogOut,
  LayoutDashboard, User, ShieldCheck, Palette, Ticket
} from 'lucide-react';

const ROLE_META = {
  admin: { label: 'Admin', color: 'var(--color-primary)', bg: 'var(--color-bg-alt)', Icon: ShieldCheck },
  kaarigar: { label: 'Kaarigar', color: 'var(--color-secondary-dark)', bg: '#FFF8E7', Icon: Palette },
  visitor: { label: 'Visitor', color: 'var(--color-success)', bg: '#E8F5E9', Icon: Ticket },
};

const Navbar = () => {
  const { currentUser, userProfile, role, logout } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
      setMobileMenuOpen(false);
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'kaarigar') return '/kaarigar/dashboard';
    return '/visitor/dashboard';
  };

  const getProfilePath = () => {
    if (role === 'admin') return '/admin/profile';
    if (role === 'kaarigar') return '/kaarigar/profile';
    return '/visitor/dashboard';
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const roleMeta = role ? ROLE_META[role] : null;
  const RoleIcon = roleMeta?.Icon;

  return (
    <header className="public-navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="brand-logo" onClick={closeMobileMenu}>
            <Sparkles size={24} />
            <span>Kaarigar Expo</span>
            <span className="brand-badge">Mela</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav>
            <ul className="nav-links">
              <li>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/melas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Upcoming Melas
                </NavLink>
              </li>
              <li>
                <NavLink to="/kaarigars" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Kaarigars
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  About
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Contact
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Nav Actions */}
          <div className="nav-actions">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {/* Role badge */}
                {roleMeta && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: roleMeta.bg, color: roleMeta.color,
                    padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${roleMeta.color}22`
                  }}>
                    <RoleIcon size={12} />
                    {roleMeta.label}
                  </div>
                )}
                <Link to={getDashboardPath()} className="btn btn-outline btn-sm">
                  <LayoutDashboard size={16} />
                  <span className="btn-text">Dashboard</span>
                </Link>
                <Link to={getProfilePath()} className="btn btn-outline-secondary btn-sm" title="My Profile">
                  <User size={16} />
                  <span className="btn-text">{userProfile?.name?.split(' ')[0] || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="btn-text">Logout</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn-outline btn-sm">
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={16} />
                  <span>Register</span>
                </Link>
              </div>
            )}

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
      />
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div className="brand-logo" style={{ fontSize: '1.2rem' }}>
            <Sparkles size={20} />
            <span>Kaarigar Expo</span>
          </div>
          <button onClick={closeMobileMenu} aria-label="Close menu">
            <X size={24} color="var(--color-primary)" />
          </button>
        </div>

        {/* Role badge in mobile */}
        {currentUser && roleMeta && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: roleMeta.bg, color: roleMeta.color,
            padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.25rem',
            border: `1px solid ${roleMeta.color}33`
          }}>
            <RoleIcon size={13} />
            Logged in as {roleMeta.label} — {userProfile?.name?.split(' ')[0] || 'User'}
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
          <Link to="/melas" className="nav-link" onClick={closeMobileMenu}>Upcoming Melas</Link>
          <Link to="/kaarigars" className="nav-link" onClick={closeMobileMenu}>Kaarigars</Link>
          <Link to="/about" className="nav-link" onClick={closeMobileMenu}>About</Link>
          <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</Link>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {currentUser ? (
            <>
              <Link to={getDashboardPath()} className="btn btn-primary btn-block" onClick={closeMobileMenu}>
                <LayoutDashboard size={18} /> My Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-block" style={{ color: 'var(--color-danger)' }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-block" onClick={closeMobileMenu}>
                <LogIn size={18} /> Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-block" onClick={closeMobileMenu}>
                <UserPlus size={18} /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
