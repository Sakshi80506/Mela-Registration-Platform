import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Compass
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { role, userProfile, logout } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
      if (onClose) onClose();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

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

        <div style={{ padding: '1.25rem 1.5rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-secondary)' }}>
            {role || 'User'} Workspace
          </span>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userProfile?.name || 'Portal User'}
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
