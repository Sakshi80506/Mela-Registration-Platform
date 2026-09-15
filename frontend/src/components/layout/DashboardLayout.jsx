import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { Menu, Home, LogOut, ShieldCheck, Palette, Ticket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ROLE_META = {
  admin: { label: 'Admin', color: 'var(--color-primary)', bg: 'var(--color-bg-alt)', Icon: ShieldCheck },
  kaarigar: { label: 'Kaarigar', color: 'var(--color-secondary-dark)', bg: '#FFF8E7', Icon: Palette },
  visitor: { label: 'Visitor', color: 'var(--color-success)', bg: '#E8F5E9', Icon: Ticket },
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile, role, logout, switchRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
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
      navigate(targetRole === 'kaarigar' ? '/kaarigar/dashboard' : '/visitor/dashboard');
    } catch (e) {
      console.error(e);
      showError(e.message || 'Failed to switch role');
    }
  };

  const roleMeta = role ? (ROLE_META[role] || ROLE_META.visitor) : ROLE_META.visitor;
  const RoleIcon = roleMeta.Icon;

  return (
    <div className="dashboard-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button 
              className="mobile-menu-btn" 
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
            <div className="dashboard-topbar-badge-group">
              <button
                onClick={role !== 'admin' ? handleToggleRole : undefined}
                title={role !== 'admin' ? `Switch to ${role === 'kaarigar' ? 'Visitor' : 'Kaarigar'} mode` : 'Administrator'}
                className="role-pill-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: roleMeta.bg,
                  color: roleMeta.color,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: `1px solid ${roleMeta.color}33`,
                  cursor: role !== 'admin' ? 'pointer' : 'default',
                  whiteSpace: 'nowrap'
                }}
              >
                <RoleIcon size={13} />
                <span>{roleMeta.label}</span>
                {role !== 'admin' && <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>⇄</span>}
              </button>
              <span className="dashboard-portal-label">
                Portal
              </span>
            </div>
          </div>

          <div className="dashboard-topbar-right">
            <Link to="/" className="btn btn-outline btn-sm topbar-action-btn" title="View Public Website">
              <Home size={15} />
              <span className="topbar-btn-text">View Site</span>
            </Link>

            <div className="dashboard-topbar-user">
              <div className="topbar-user-name">
                {userProfile?.name || 'User'}
              </div>
              <div className="topbar-user-email">
                {userProfile?.email}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm topbar-logout-btn"
              title="Sign Out / Logout"
              aria-label="Sign Out"
            >
              <LogOut size={15} />
              <span className="topbar-btn-text">Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="dashboard-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

