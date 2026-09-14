import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import UpcomingMelas from './pages/public/UpcomingMelas';
import EventDetails from './pages/public/EventDetails';
import KaarigarsList from './pages/public/KaarigarsList';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Kaarigar Pages
import KaarigarDashboard from './pages/kaarigar/KaarigarDashboard';
import KaarigarProfile from './pages/kaarigar/KaarigarProfile';
import ApplyMela from './pages/kaarigar/ApplyMela';
import MyApplications from './pages/kaarigar/MyApplications';

// Visitor Pages
import VisitorDashboard from './pages/visitor/VisitorDashboard';
import MyRegistrations from './pages/visitor/MyRegistrations';
import VisitorProfile from './pages/visitor/VisitorProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateMela from './pages/admin/CreateMela';
import ManageMelas from './pages/admin/ManageMelas';
import ManageKaarigars from './pages/admin/ManageKaarigars';
import ManageApplications from './pages/admin/ManageApplications';
import ManageVisitors from './pages/admin/ManageVisitors';
import AdminProfile from './pages/admin/AdminProfile';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="melas" element={<UpcomingMelas />} />
              <Route path="melas/:eventId" element={<EventDetails />} />
              <Route path="kaarigars" element={<KaarigarsList />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* KAARIGAR PORTAL (Protected) */}
            <Route
              path="/kaarigar"
              element={
                <ProtectedRoute allowedRoles={['kaarigar', 'admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/kaarigar/dashboard" replace />} />
              <Route path="dashboard" element={<KaarigarDashboard />} />
              <Route path="profile" element={<KaarigarProfile />} />
              <Route path="apply" element={<ApplyMela />} />
              <Route path="applications" element={<MyApplications />} />
            </Route>

            {/* VISITOR PORTAL (Protected) */}
            <Route
              path="/visitor"
              element={
                <ProtectedRoute allowedRoles={['visitor', 'kaarigar', 'admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/visitor/dashboard" replace />} />
              <Route path="dashboard" element={<VisitorDashboard />} />
              <Route path="registrations" element={<MyRegistrations />} />
              <Route path="profile" element={<VisitorProfile />} />
            </Route>

            {/* ADMIN PORTAL (Protected) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="create-mela" element={<CreateMela />} />
              <Route path="melas" element={<ManageMelas />} />
              <Route path="kaarigars" element={<ManageKaarigars />} />
              <Route path="applications" element={<ManageApplications />} />
              <Route path="visitors" element={<ManageVisitors />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>


            {/* 404 CATCH ALL */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
