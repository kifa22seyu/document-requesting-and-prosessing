import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';

// Layout Components
const RegistrarAdmin = React.lazy(() => import('./comp/admind'));
const FinanceDashboard = React.lazy(() => import('./comp/FinanceDashboard'));
const TeamAssociationDashboard = React.lazy(() => import('./comp/TeamAssociationDashboard'));
const AlumniDashboard = React.lazy(() => import('./comp/almunidashbored'));
const CompanyDashboard = React.lazy(() => import('./comp/companydashbored'));
const Dashboard = React.lazy(() => import('./comp/Dashboard'));

// Page Components
const Home = React.lazy(() => import('./comp/Home'));
const AboutUs = React.lazy(() => import('./comp/About'));
const ContactForm = React.lazy(() => import('./comp/contactus'));
const Login = React.lazy(() => import('./comp/login'));
const RegisterForm = React.lazy(() => import('./comp/Register'));
const ForgetPassword = React.lazy(() => import('./comp/Forgotpassword'));
const TestimonialsPage = React.lazy(() => import('./comp/testimonial'));
const AdditionalInfoForm = React.lazy(() => import('./comp/AdditionalInfoForm'));
const IdentityVerificationForm = React.lazy(() => import('./comp/IdentityVerificationForm'));
const PersonalInfo = React.lazy(() => import('./comp/personalinfo'));
const AcademicRecordsForm = React.lazy(() => import('./comp/AcademicRecordsForm'));
const StudentForm = React.lazy(() => import('./comp/StudentForm'));
const Donate = React.lazy(() => import('./comp/Donate'));
const GraduationVerificationForm = React.lazy(() => import('./comp/GraduationVerificationForm'));

// Admin Components
const UserCrud = React.lazy(() => import('./comp/usercrude'));
const AdminCrud = React.lazy(() => import('./comp/Admincrude'));
const AdminAnnouncements = React.lazy(() => import('./comp/AdminAnnouncements'));
const AdminRequestsView = React.lazy(() => import('./comp/AdminRequestsView'));

const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuthContext();
  return authUser ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { authUser } = useAuthContext();
  return authUser?.role === 'admin' ? children : <Navigate to="/" replace />;
};

function App() {
  const [testimonials, setTestimonials] = useState(() => {
    try {
      const saved = localStorage.getItem('testimonials');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load testimonials", e);
      return [];
    }
  });

  const addTestimonial = (newTestimonial) => {
    const updatedTestimonials = [...testimonials, { ...newTestimonial, id: Date.now() }];
    setTestimonials(updatedTestimonials);
    localStorage.setItem('testimonials', JSON.stringify(updatedTestimonials));
  };

  const SettingsPlaceholder = React.memo(() => (
    <div className='p-6 bg-white rounded-lg shadow'>
      <h2 className='text-xl font-semibold text-gray-800'>Settings</h2>
      <p className='text-gray-600 mt-2'>Admin profile and application settings will go here.</p>
    </div>
  ));

  return (
    <BrowserRouter>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Company Dashboard */}
          <Route path="/company-dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>}>
            <Route path="verify-graduates" element={<GraduationVerificationForm />} />
            <Route path="messages/inbox" element={<div>Messages Inbox</div>} />
            <Route path="messages/sent" element={<div>Sent Messages</div>} />
            <Route path="settings" element={<div>Company Settings</div>} />
          </Route>

          {/* Alumni Dashboard */}
          <Route path="/alumni-dashboard" element={<ProtectedRoute><AlumniDashboard /></ProtectedRoute>}>
            <Route index element={
              <div className='p-6 bg-white rounded-lg shadow'>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Welcome to the Alumni Portal!</h2>
                <p className='text-gray-600'>Please select an option from the sidebar.</p>
              </div>
            } />
            <Route path="identity-verification" element={<IdentityVerificationForm />} />
            <Route path="testimonial" element={<TestimonialsPage testimonials={testimonials} addTestimonial={addTestimonial} />} />
            <Route path="delivery-method" element={<AdditionalInfoForm />} />
            <Route path="personal-information" element={<PersonalInfo />} />
            <Route path="student-information" element={<StudentForm />} />
            <Route path="request-form" element={<AcademicRecordsForm />} />
            <Route path="payment-methods" element={<Donate />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/registraradmin" element={<AdminRoute><RegistrarAdmin /></AdminRoute>}>
            <Route index element={
              <div className='p-6 bg-white rounded-lg shadow'>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Registrar Dashboard</h2>
                <p className='text-gray-600'>Welcome, Administrator.</p>
                <p className='mt-4'><Link to="/registraradmin/requests" className="text-blue-600 hover:underline">View Alumni Requests</Link></p>
              </div>
            } />
            <Route path="requests" element={<AdminRequestsView />} />
            <Route path="users" element={<UserCrud />} />
            <Route path="admins" element={<AdminCrud />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="messages" element={<div>Messages Section <p>Select Inbox or Chat</p></div>} />
            <Route path="messages/inbox" element={<div>Messages Inbox Placeholder</div>} />
            <Route path="messages/chat" element={<div>Chat Interface Placeholder</div>} />
            <Route path="settings" element={<SettingsPlaceholder />} />
          </Route>

          <Route path="/finance-dashboard" element={<AdminRoute><FinanceDashboard /></AdminRoute>}>
            <Route index element={<div>Finance Dashboard Home</div>} />
            <Route path="payments" element={<div>Payment Records</div>} />
          </Route>

          <Route path="/team-association-dashboard" element={<AdminRoute><TeamAssociationDashboard /></AdminRoute>}>
            <Route index element={<div>Team Association Dashboard Home</div>} />
            <Route path="requests" element={<div>Request Review</div>} />
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default React.memo(App);