import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatCard from "./StatCard";
import { useAuth } from "../../context/AuthContext";
// import RevenueChart from "../../components/RevenueChart";
// import UserGrowthChart from "../../components/UserGrowthChart";
// import RecentTransactions from "../../components/RecentTransactions";
// import TopPerformers from "../../components/TopPerformers";
// import PlatformStats from "../../components/PlatformStats";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="admin-container">
      <Sidebar />

      <div className="admin-main">
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