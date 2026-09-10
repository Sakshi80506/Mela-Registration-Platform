import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { Menu, Home, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile, role } = useAuth();

  return (
    <div className="dashboard-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setSidebarOpen(true)}
              style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary)' }}
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', background: 'var(--color-secondary)', color: 'var(--color-primary-dark)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, textTransform: 'uppercase' }}>
                {role}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                Portal
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/" className="btn btn-outline btn-sm" title="View Public Website">
              <Home size={15} />
              <span className="btn-text">View Site</span>
            </Link>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {userProfile?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {userProfile?.email}
              </div>
            </div>
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
