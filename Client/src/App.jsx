

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientRegister from './components/auth/ClientRegister';
import FreelancerRegister from './components/auth/FreelancerRegister';
import Login from './components/auth/Login';
import RoleSelection from './components/auth/RoleSelection';
import ClientDashboard from './pages/client/ClientDashboard'
import ClientContracts from './pages/client/ClientContracts'
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
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ClientDashboard/>} />
          <Route path="/client-dashboard" element={<ClientDashboard/>} />
          <Route path="/client-contracts" element={<ClientContracts />} />
          <Route path="/contract-details/:id" element={<ContractDetails />} />
          <Route path="/edit-contract/:id" element={<EditContract />} />
          <Route path="/client-messages" element={<ClientMessages />} />
          <Route path="/task-applications" element={<TaskApplications />} />
          <Route path="/task-edit/:taskId" element={<TaskEdit />} />
          <Route path="/freelancer-experience/:freelancerId" element={<FreelancerExperience />} />
          <Route path="/award-contract/:taskId/:freelancerId" element={<AwardContractForm />} />
          <Route path="/client-profile" element={<ClientProfile />} />
          <Route path="/freelancer-review/:contractId" element={<FreelancerReview />} />
          <Route path="/login" element={<Login />} />
          <Route path="/post-task" element={<PostTask />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/client-register" element={<ClientRegister />} />
          <Route path="/freelancer-register" element={<FreelancerRegister />} />
        </Routes>
      </div>
    </Router>

  );
}

export default App;