

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientRegister from './components/auth/ClientRegister';
import FreelancerRegister from './components/auth/FreelancerRegister';
import Login from './components/auth/Login';
import RoleSelection from './components/auth/RoleSelection';

import ClientDashboard from './pages/client/ClientDashboard'
import ClientContracts from './pages/client/ClientContracts'
import ClientPayment from './pages/client/ClientPayment'
import EditContract from './pages/client/EditContract'
import ClientMessages from './pages/client/ClientMessages'
import ContractDetails from './pages/client/ContractDetails'
import PostTask from './pages/client/PostTask';
import TaskApplications from './pages/client/TaskApplications';
import TaskEdit from './pages/client/TaskEdit';
import FreelancerExperience from './pages/client/FreelancerExperience';
import AwardContractForm from './pages/client/AwardContractForm';
import ClientProfile from './pages/client/ClientProfile';
import FreelancerReview from './pages/client/FreelancerReview';
import ClientReport from './pages/client/ClientReport';
import HomePage from './pages/HomePage';
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';
import Applications from './pages/freelancer/Applications';
import BrowseTasks from './pages/freelancer/BrowseTasks';
import Myprojects from './pages/freelancer/Myprojects';
import Earnings from './pages/freelancer/Earnings';
import Profile from './pages/freelancer/Profile';
import Reviews from './pages/freelancer/Reviews';
import FreelancerMessages from './pages/freelancer/FreelancerMessages';
import FreelancerReport from './pages/freelancer/FreelancerReport';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProjectManagement from './pages/admin/ProjectManagement';
import Complaints from './pages/admin/Complaints';
import HomePage from './pages/HomePage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/client/dashboard" element={<ClientDashboard/>} />
          <Route path="/client-contracts" element={<ClientContracts />} />
          <Route path="/client-payment" element={<ClientPayment />} />
          <Route path="/contract-details/:id" element={<ContractDetails />} />
          <Route path="/edit-contract/:id" element={<EditContract />} />
          <Route path="/client-messages" element={<ClientMessages />} />
          <Route path="/task-applications" element={<TaskApplications />} />
          <Route path="/task-edit/:taskId" element={<TaskEdit />} />
          <Route path="/freelancer-experience/:freelancerId" element={<FreelancerExperience />} />
          <Route path="/award-contract/:taskId/:freelancerId" element={<AwardContractForm />} />
          <Route path="/client-profile" element={<ClientProfile />} />
          <Route path="/freelancer-review/:contractId" element={<FreelancerReview />} />
          <Route path="/client-report" element={<ClientReport />} />
          <Route path="/login" element={<Login />} />
          <Route path="/post-task" element={<PostTask />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/client-register" element={<ClientRegister />} />
          <Route path="/freelancer-register" element={<FreelancerRegister />} />
          <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
          <Route path="/freelancer/browse-tasks" element={<BrowseTasks />} />
          <Route path="/freelancer/applications" element={<Applications />} />
          <Route path="/freelancer/profile" element={<Profile />} />
          <Route path="/freelancer/messages" element={<FreelancerMessages />} />
          <Route path="/freelancer/profile" element={<FreelancerDashboard />} />
          <Route path="/freelancer/earnings" element={<Earnings />} />
          <Route path="/freelancer-report" element={<FreelancerReport />} />
          <Route path="/freelancer/payments" element={<FreelancerDashboard />} />
          <Route path="/freelancer/reviews" element={<Reviews />} />
          <Route path="/my-projects" element={<Myprojects />} />
          <Route path="/freelancer/reviews" element={<FreelancerDashboard />} />
          <Route path="/freelancer/my-projects" element={<Myprojects />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/projects" element={<ProjectManagement />} />
          <Route path="/admin/complaints" element={<Complaints />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
    </AuthProvider>

  );
}

export default App;