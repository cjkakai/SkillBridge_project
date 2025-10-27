import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientRegister from './components/auth/ClientRegister';
import FreelancerRegister from './components/auth/FreelancerRegister';
import Login from './components/auth/Login';
import RoleSelection from './components/auth/RoleSelection';
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';
import Applications from './pages/freelancer/Applications';
import BrowseTasks from './pages/freelancer/BrowseTasks';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/client-register" element={<ClientRegister />} />
          <Route path="/freelancer-register" element={<FreelancerRegister />} />
          <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
          <Route path="/freelancer/browse-tasks" element={<BrowseTasks />} />
          <Route path="/freelancer/applications" element={<Applications />} />
          <Route path="/freelancer/profile" element={<FreelancerDashboard />} />
          <Route path="/freelancer/payments" element={<FreelancerDashboard />} />
          <Route path="/freelancer/reviews" element={<FreelancerDashboard />} />
          <Route path="/my-projects" element={<BrowseTasks />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;