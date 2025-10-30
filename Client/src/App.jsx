

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
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
import Experience from './pages/freelancer/Experience';
import Reviews from './pages/freelancer/Reviews';
import FreelancerMessages from './pages/freelancer/FreelancerMessages';
import FreelancerReport from './pages/freelancer/FreelancerReport';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProjectManagement from './pages/admin/ProjectManagement';
import Complaints from './pages/admin/Complaints';
import TransactionManagement from './pages/admin/TransactionManagement';


import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
           <Route path="/" element={<HomePage/>} />
           <Route path="/login" element={<Login />} />
           <Route path="/role-selection" element={<RoleSelection />} />
           <Route path="/client-register" element={<ClientRegister />} />
           <Route path="/freelancer-register" element={<FreelancerRegister />} />

           {/* Protected Routes - All routes except the public ones above require authentication */}
           <Route path="/post-task" element={<ProtectedRoute><PostTask /></ProtectedRoute>} />
           <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard/></ProtectedRoute>} />
           <Route path="/client-contracts" element={<ProtectedRoute allowedRoles={['client']}><ClientContracts /></ProtectedRoute>} />
           <Route path="/client-payment" element={<ProtectedRoute allowedRoles={['client']}><ClientPayment /></ProtectedRoute>} />
           <Route path="/contract-details/:id" element={<ProtectedRoute allowedRoles={['client']}><ContractDetails /></ProtectedRoute>} />
           <Route path="/edit-contract/:id" element={<ProtectedRoute allowedRoles={['client']}><EditContract /></ProtectedRoute>} />
           <Route path="/client-messages" element={<ProtectedRoute allowedRoles={['client']}><ClientMessages /></ProtectedRoute>} />
           <Route path="/task-applications" element={<ProtectedRoute allowedRoles={['client']}><TaskApplications /></ProtectedRoute>} />
           <Route path="/task-edit/:taskId" element={<ProtectedRoute allowedRoles={['client']}><TaskEdit /></ProtectedRoute>} />
           <Route path="/freelancer-experience/:freelancerId" element={<ProtectedRoute allowedRoles={['client']}><FreelancerExperience /></ProtectedRoute>} />
           <Route path="/award-contract/:taskId/:freelancerId" element={<ProtectedRoute allowedRoles={['client']}><AwardContractForm /></ProtectedRoute>} />
           <Route path="/client-profile" element={<ProtectedRoute allowedRoles={['client']}><ClientProfile /></ProtectedRoute>} />
           <Route path="/freelancer-review/:contractId" element={<ProtectedRoute allowedRoles={['client']}><FreelancerReview /></ProtectedRoute>} />
           <Route path="/client-report" element={<ProtectedRoute allowedRoles={['client']}><ClientReport /></ProtectedRoute>} />

           {/* Protected Freelancer Routes */}
           <Route path="/freelancer/dashboard" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerDashboard /></ProtectedRoute>} />
           <Route path="/freelancer/browse-tasks" element={<ProtectedRoute allowedRoles={['freelancer']}><BrowseTasks /></ProtectedRoute>} />
           <Route path="/freelancer/applications" element={<ProtectedRoute allowedRoles={['freelancer']}><Applications /></ProtectedRoute>} />
           <Route path="/freelancer/profile" element={<ProtectedRoute allowedRoles={['freelancer']}><Profile /></ProtectedRoute>} />
           <Route path="/freelancer/experience" element={<ProtectedRoute allowedRoles={['freelancer']}><Experience /></ProtectedRoute>} />
           <Route path="/freelancer/messages" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerMessages /></ProtectedRoute>} />
           <Route path="/freelancer/earnings" element={<ProtectedRoute allowedRoles={['freelancer']}><Earnings /></ProtectedRoute>} />
           <Route path="/freelancer-report" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerReport /></ProtectedRoute>} />
           <Route path="/freelancer/reviews" element={<ProtectedRoute allowedRoles={['freelancer']}><Reviews /></ProtectedRoute>} />
           <Route path="/my-projects" element={<ProtectedRoute allowedRoles={['freelancer']}><Myprojects /></ProtectedRoute>} />
           <Route path="/freelancer/my-projects" element={<ProtectedRoute allowedRoles={['freelancer']}><Myprojects /></ProtectedRoute>} />

           {/* Protected Admin Routes */}
           <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
           <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
           <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={['admin']}><ProjectManagement /></ProtectedRoute>} />
           <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['admin']}><Complaints /></ProtectedRoute>} />
           <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><TransactionManagement /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
    </AuthProvider>

  );
}

export default App;