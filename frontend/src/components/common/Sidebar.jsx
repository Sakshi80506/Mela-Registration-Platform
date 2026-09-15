import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  User, 
  PlusCircle, 
  Send, 
  Ticket, 
  LogOut, 
  X,
  Compass,
  Home,
  ShieldCheck,
  Palette
} from 'lucide-react';

const ROLE_META = {
  admin: { label: 'Admin', color: 'var(--color-primary)', bg: 'var(--color-bg-alt)', Icon: ShieldCheck },
  kaarigar: { label: 'Kaarigar', color: 'var(--color-secondary-dark)', bg: '#FFF8E7', Icon: Palette },
  visitor: { label: 'Visitor', color: 'var(--color-success)', bg: '#E8F5E9', Icon: Ticket },
};

const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser, role, userProfile, logout, switchRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
      if (onClose) onClose();
      navigate('/');
    } catch (e) {
      console.error(e);
      showError(e.message || 'Logout failed');
    }
  };

  const handleToggleRole = async () => {
    if (role === 'admin') return;
    const targetRole = role === 'kaarigar' ? 'visitor' : 'kaarigar';
    try {
      await switchRole(targetRole);
      showSuccess(`Switched to ${targetRole === 'kaarigar' ? 'Kaarigar' : 'Visitor'} Portal`);
      if (onClose) onClose();
      navigate(targetRole === 'kaarigar' ? '/kaarigar/dashboard' : '/visitor/dashboard');
    } catch (e) {
      console.error(e);
      showError(e.message || 'Failed to switch role');
    }
  };

  const roleMeta = role ? (ROLE_META[role] || ROLE_META.visitor) : ROLE_META.visitor;
  const RoleIcon = roleMeta.Icon;

  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Create Mela', path: '/admin/create-mela', icon: PlusCircle },
        { label: 'Manage Melas', path: '/admin/melas', icon: Calendar },
        { label: 'Manage Kaarigars', path: '/admin/kaarigars', icon: Users },
        { label: 'Applications', path: '/admin/applications', icon: FileText },
        { label: 'Visitors', path: '/admin/visitors', icon: Ticket },
        { label: 'Admin Profile', path: '/admin/profile', icon: User },
      ];
    } else if (role === 'kaarigar') {
      return [
        { label: 'Dashboard', path: '/kaarigar/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', path: '/kaarigar/profile', icon: User },
        { label: 'Apply for Mela', path: '/kaarigar/apply', icon: Send },
        { label: 'My Applications', path: '/kaarigar/applications', icon: FileText },
      ];
    } else {
      // Visitor
      return [
        { label: 'Dashboard', path: '/visitor/dashboard', icon: LayoutDashboard },
        { label: 'Upcoming Melas', path: '/melas', icon: Compass },
        { label: 'My Registrations', path: '/visitor/registrations', icon: Ticket },
        { label: 'My Profile', path: '/visitor/profile', icon: User },
      ];
    }
  };

  const items = getNavItems();

  return (
    <>
      <div 
        className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span>Kaarigar Expo</span>
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              className="mobile-menu-btn" 
              style={{ color: '#FFFFFF', padding: 0 }}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Card in Sidebar */}
        <div style={{
          padding: '1.15rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--color-secondary)',
              color: 'var(--color-primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.95rem',
              flexShrink: 0
            }}>
              {(userProfile?.name || currentUser?.email || 'U')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userProfile?.name || 'Portal User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: roleMeta.bg,
              color: roleMeta.color,
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <RoleIcon size={11} /> {roleMeta.label}
            </span>

            {role !== 'admin' && (
              <button
                onClick={handleToggleRole}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Switch to {role === 'kaarigar' ? 'Visitor' : 'Kaarigar'} ⇄
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                end={item.path.endsWith('dashboard')}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div style={{ margin: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />

          <Link
            to="/"
            onClick={onClose}
            className="sidebar-link"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            <Home size={18} />
            <span>View Public Site</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={handleLogout}
            className="sidebar-link"
            style={{ width: '100%', color: '#FF8A80', background: 'none', border: 'none' }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

