import React, { useEffect, useState } from 'react';
import TestimonialsDisplay from './TestimonialsDisplay';
import Navbar from './navbar';
import Login from './login';
import AboutUs from './About';
import ContactForm from './contactus';
import Footer from './footer';
import IdentityVerificationForm from './IdentityVerificationForm';
import AcademicRecordsForm from './AcademicRecordsForm';
import StudentForm from './StudentForm';

import AdditionalInfoForm from './AdditionalInfoForm';
import GraduationVerificationForm from './GraduationVerificationForm';//
import Chapapayment from './Donate';
import RegistrarAdmin from './admind';
import SettingsPage from './Adminsetting';
import CreateAccount from './createaccount';
import UpdateAccount from './updateacount';
import UserCrude from './usercrude';
import AdminCrud from './Admincrude';
import AdminAnnouncements from './AdminAnnouncements';
import FinanceAdmin from './FinanceDashboard';
import TeamAssociationDashboard from './TeamAssociationDashboard';
import AdminRequestsView from './AdminRequestsView'; // The improved requests view
import Chat from "../pages/home/Chat";  // Go up one level from `comp` to `src`

const Home = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const storedTestimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
    setTestimonials(storedTestimonials);
  }, []);

  return (
    <>
export default FinanceAdmin;
<Chat />
<AdminRequestsView />
<TeamAssociationDashboard />
    <FinanceAdmin />
   <AdminAnnouncements />
      <AdminCrud />
      <UserCrude />
      <UpdateAccount />
      <CreateAccount />
      <SettingsPage />
      <RegistrarAdmin />
      <Chapapayment />
      <GraduationVerificationForm />//
      <AdditionalInfoForm />//
   
      <StudentForm />//
      <AcademicRecordsForm />//
      <IdentityVerificationForm />
      <Navbar />
      <Login />
      <AboutUs />
      <ContactForm />
      <TestimonialsDisplay testimonials={testimonials} />
      <Footer />
    </>
  );
};

export default Home;