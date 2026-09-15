import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { Menu, Home, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile, role, logout } = useAuth();
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
              <span className="dashboard-role-badge">
                {role}
              </span>
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

