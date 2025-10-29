import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="admin-container">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
        <Header />

        <div className="admin-content">
          <div className="overview-row">
            <div className="overview-left">
              <section className="overview-intro">
                <h2>Platform Overview</h2>
                <p className="subtitle">Monitor and manage SkillBridge platform performance.</p>
              </section>

              <div className="stat-cards">
                <StatCard title="Total Users" value="12,543" note="↑ 8% from last month" />
                <StatCard title="Active Projects" value="1,284" note="↑ 12% from last month" />
                <StatCard title="Total Revenue" value="$284,540" note="↑ 15% from last month" />
                <StatCard title="Growth Rate" value="24%" note="↑ 4% from last month" />
              </div>

              <div className="charts-row">
                <RevenueChart />
                <UserGrowthChart />
              </div>
            </div>

            <aside className="overview-right">
              <div className="actions-row">
                <button className="btn-filter">Filter</button>
                <button className="btn-export">Export Report</button>
              </div>

              <TopPerformers />
            </aside>
          </div>

          <div className="table-row">
            <RecentTransactions />
            <PlatformStats />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;