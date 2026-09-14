import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles, Menu, X, LogIn, UserPlus, LogOut,
  LayoutDashboard, User, ShieldCheck, Palette, Ticket,
  ChevronDown, ExternalLink
} from 'lucide-react';

const ROLE_META = {
  admin: { label: 'Admin', color: 'var(--color-primary)', bg: 'var(--color-bg-alt)', Icon: ShieldCheck },
  kaarigar: { label: 'Kaarigar', color: 'var(--color-secondary-dark)', bg: '#FFF8E7', Icon: Palette },
  visitor: { label: 'Visitor', color: 'var(--color-success)', bg: '#E8F5E9', Icon: Ticket },
};

const Navbar = () => {
  const { currentUser, userProfile, role, logout, switchRole } = useAuth();
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

  const handleToggleRole = async () => {
    if (role === 'admin') return;
    const targetRole = role === 'kaarigar' ? 'visitor' : 'kaarigar';
    try {
      await switchRole(targetRole);
      showSuccess(`Switched to ${targetRole === 'kaarigar' ? 'Kaarigar' : 'Visitor'} Portal`);
      navigate(targetRole === 'kaarigar' ? '/kaarigar/dashboard' : '/visitor/dashboard');
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
    return '/visitor/profile';
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const roleMeta = role ? ROLE_META[role] : null;
  const RoleIcon = roleMeta?.Icon;

  return (
    <header className="public-navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="brand-logo" onClick={closeMobileMenu}>
            <Sparkles size={22} />
            <span>Kaarigar Expo</span>
            <span className="brand-badge">Mela</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav">
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
              <div className="user-nav-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Role badge with switch capability */}
                {roleMeta && (
                  <button
                    onClick={role !== 'admin' ? handleToggleRole : undefined}
                    title={role !== 'admin' ? `Switch to ${role === 'kaarigar' ? 'Visitor' : 'Kaarigar'} mode` : 'Administrator'}
                    className="role-pill-btn"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      background: roleMeta.bg, color: roleMeta.color,
                      padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${roleMeta.color}33`,
                      cursor: role !== 'admin' ? 'pointer' : 'default',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <RoleIcon size={12} />
                    <span>{roleMeta.label}</span>
                    {role !== 'admin' && (
                      <span style={{ fontSize: '0.7rem', opacity: 0.75 }}>⇄</span>
                    )}
                  </button>
                )}

                <Link to={getDashboardPath()} className="btn btn-outline btn-sm nav-btn-desktop" title="My Dashboard">
                  <LayoutDashboard size={15} />
                  <span className="btn-text">Dashboard</span>
                </Link>

                <Link to={getProfilePath()} className="btn btn-outline-secondary btn-sm nav-btn-desktop" title="Profile">
                  <User size={15} />
                  <span className="btn-text">{userProfile?.name?.split(' ')[0] || 'Profile'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-sm nav-btn-desktop"
                  style={{ color: 'var(--color-danger)', padding: '0.35rem 0.65rem' }}
                  title="Logout"
                >
                  <LogOut size={15} />
                  <span className="btn-text">Logout</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-outline btn-sm">
                  <LogIn size={15} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={15} />
                  <span className="btn-text">Register</span>
                </Link>
              </div>
            )}

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          <div className="brand-logo" style={{ fontSize: '1.15rem' }}>
            <Sparkles size={18} />
            <span>Kaarigar Expo</span>
          </div>
          <button onClick={closeMobileMenu} aria-label="Close menu" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={22} color="var(--color-primary)" />
          </button>
        </div>

        {/* User Card in mobile drawer */}
        {currentUser && (
          <div style={{
            background: 'var(--color-bg-alt)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {(userProfile?.name || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userProfile?.name || 'User Account'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.email}
                </div>
              </div>
            </div>

            {roleMeta && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--color-border)' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  background: roleMeta.bg, color: roleMeta.color,
                  padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem', fontWeight: 700
                }}>
                  <RoleIcon size={11} /> {roleMeta.label}
                </span>

                {role !== 'admin' && (
                  <button
                    onClick={handleToggleRole}
                    style={{
                      background: 'none', border: 'none', color: 'var(--color-primary)',
                      fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0
                    }}
                  >
                    Switch to {role === 'kaarigar' ? 'Visitor' : 'Kaarigar'} ⇄
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2rem' }}>
          <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
          <Link to="/melas" className="nav-link" onClick={closeMobileMenu}>Upcoming Melas</Link>
          <Link to="/kaarigars" className="nav-link" onClick={closeMobileMenu}>Kaarigars & Artisans</Link>
          <Link to="/about" className="nav-link" onClick={closeMobileMenu}>About Us</Link>
          <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</Link>
        </nav>

        {/* Bottom Drawer Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {currentUser ? (
            <>
              <Link to={getDashboardPath()} className="btn btn-primary btn-block" onClick={closeMobileMenu}>
                <LayoutDashboard size={16} /> My Dashboard
              </Link>
              <Link to={getProfilePath()} className="btn btn-outline btn-block" onClick={closeMobileMenu}>
                <User size={16} /> My Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-block" style={{ color: 'var(--color-danger)', borderColor: '#FFCDD2' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-block" onClick={closeMobileMenu}>
                <LogIn size={16} /> Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-block" onClick={closeMobileMenu}>
                <UserPlus size={16} /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
