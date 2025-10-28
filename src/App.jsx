import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import TransactionManagement from "./pages/admin/TransactionManagement";
import ProjectManagement from "./pages/admin/ProjectManagement";
import AnalyticsManagement from "./pages/admin/AnalyticsManagement";
import SettingsManagement from "./pages/admin/SettingsManagement";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/transactions" element={<TransactionManagement />} />
      <Route path="/admin/projects" element={<ProjectManagement />} />
      <Route path="/admin/analytics" element={<AnalyticsManagement />} />
      <Route path="/admin/settings" element={<SettingsManagement />} />
    </Routes>
  );
}

export default App;
