import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send, 
  User, 
  ArrowRight, 
  Calendar, 
  Sparkles,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { statsService } from '../../services/statsService';
import DashboardCard from '../../components/cards/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const KaarigarDashboard = () => {
  const { currentUser, userProfile, kaarigarProfile } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Kaarigar Dashboard | Kaarigar Expo";
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser, kaarigarProfile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const kId = kaarigarProfile?.id || currentUser.uid;
      
      const [statsData, appsData] = await Promise.all([
        statsService.getKaarigarStats(kId),
        applicationService.getMyApplications(kId)
      ]);

      setStats(statsData);
      setRecentApplications(appsData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load kaarigar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion score
  const calculateProfileCompletion = () => {
    if (!kaarigarProfile) return 30;
    let score = 0;
    if (kaarigarProfile.name) score += 20;
    if (kaarigarProfile.craftType) score += 20;
    if (kaarigarProfile.description) score += 20;
    if (kaarigarProfile.city && kaarigarProfile.state) score += 20;
    if (kaarigarProfile.profilePhoto || kaarigarProfile.craftPhoto) score += 20;
    return score;
  };

  const profileCompletion = calculateProfileCompletion();

  if (loading) {
    return <LoadingSpinner message="Loading your artisan dashboard..." />;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--color-border)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-secondary-dark)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <Award size={16} /> Kaarigar Portal
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
            Namaste, {kaarigarProfile?.name || userProfile?.name || 'Artisan'}!
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            {kaarigarProfile?.craftType ? `Specialization: ${kaarigarProfile.craftType}` : 'Manage your mela applications and artisan profile'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/kaarigar/apply" className="btn btn-secondary">
            <Send size={16} /> Apply for Mela
          </Link>
          <Link to="/kaarigar/profile" className="btn btn-outline">
            <User size={16} /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Profile Completion Bar */}
      {profileCompletion < 100 && (
        <div style={{ background: 'var(--color-warning-bg)', border: '1px solid #FFE082', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 700 }}>
              <span style={{ color: '#B26A00' }}>Artisan Profile Completion</span>
              <span style={{ color: '#B26A00' }}>{profileCompletion}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#FFE082', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: `${profileCompletion}%`, height: '100%', background: 'var(--color-warning)', borderRadius: 'var(--radius-full)' }} />
            </div>
          </div>
          <Link to="/kaarigar/profile" className="btn btn-sm btn-outline-secondary">
            Complete Profile Now
          </Link>
        </div>
      )}

      {/* Stats KPI Row */}
      <div className="metric-grid">
        <DashboardCard
          title="Total Applied"
          value={stats.totalApplications}
          icon={FileText}
          color="var(--color-primary)"
          bgColor="var(--color-bg-alt)"
        />
        <DashboardCard
          title="Pending Review"
          value={stats.pendingApplications}
          icon={Clock}
          color="var(--color-warning)"
          bgColor="var(--color-warning-bg)"
        />
        <DashboardCard
          title="Approved Stalls"
          value={stats.approvedApplications}
          icon={CheckCircle2}
          color="var(--color-success)"
          bgColor="var(--color-success-bg)"
        />
        <DashboardCard
          title="Rejected / Closed"
          value={stats.rejectedApplications}
          icon={XCircle}
          color="var(--color-danger)"
          bgColor="var(--color-danger-bg)"
        />
      </div>

      {/* Recent Applications Section */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Recent Mela Applications</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Track the status of your submitted exhibition stall requests
            </p>
          </div>
          <Link to="/kaarigar/applications" className="btn btn-outline btn-sm">
            View All Applications <ArrowRight size={14} />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <EmptyState
            title="No Applications Submitted"
            message="You haven't applied to any melas yet. Browse upcoming exhibitions and reserve your artisan stall."
            actionText="Apply for Mela"
            actionLink="/kaarigar/apply"
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Location</th>
                  <th>Applied On</th>
                  <th>Craft Category</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.event?.name || 'Mela Event'}</strong>
                    </td>
                    <td>{app.event?.city || 'Location TBA'}, {app.event?.state || ''}</td>
                    <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : 'Recent'}</td>
                    <td>{app.craftType}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <Link to="/kaarigar/applications" className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.6rem' }}>
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KaarigarDashboard;
