import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatCard from "./StatCard";
import RevenueChart from "../../components/RevenueChart";
import UserGrowthChart from "../../components/UserGrowthChart";
import RecentTransactions from "../../components/RecentTransactions";
import TopPerformers from "../../components/TopPerformers";
import PlatformStats from "../../components/PlatformStats";
import {
  getDashboardStats,
  getRevenueChartData,
  getUserGrowthChartData,
  getRecentTransactions,
  getTopPerformers,
  getPlatformStats
} from "../../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: "0",
    activeProjects: "0",
    totalRevenue: "$0",
    growthRate: "0%"
  });
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [platformStats, setPlatformStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          dashboardStats,
          revenueChartData,
          userGrowthChartData,
          recentTxns,
          topPerformersData,
          platformStatsData
        ] = await Promise.all([
          getDashboardStats(),
          getRevenueChartData(),
          getUserGrowthChartData(),
          getRecentTransactions(),
          getTopPerformers(),
          getPlatformStats()
        ]);

        setStats(dashboardStats);
        setRevenueData(revenueChartData);
        setUserGrowthData(userGrowthChartData);
        setRecentTransactions(recentTxns);
        setTopPerformers(topPerformersData);
        setPlatformStats(platformStatsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Export printable report
  const handleExportReport = () => {
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString();

    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SkillBridge Platform Report - ${currentDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #246BFD; }
            h2 { color: #64748b; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #e0e0e0; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>SkillBridge Platform Report</h1>
          <p>Generated on: ${currentDate}</p>
          <h2>Overview</h2>
          <ul>
            <li><b>Total Users:</b> ${stats.totalUsers}</li>
            <li><b>Active Projects:</b> ${stats.activeProjects}</li>
            <li><b>Total Revenue:</b> ${stats.totalRevenue}</li>
            <li><b>Growth Rate:</b> ${stats.growthRate}</li>
          </ul>
        </body>
      </html>`;
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
  };

  // Loading state
  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="admin-main">
          <Header />
          <div className="admin-content" style={{ textAlign: "center", padding: "50px" }}>
            Loading dashboard data...
          </div>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Header />

        <div className="admin-content">
          <div className="dashboard-header">
            <h2>Platform Overview</h2>
            <div className="actions">
              <button className="filter-btn" onClick={() => alert("Filter feature coming soon!")}>
                Filter
              </button>
              <button className="export-btn" onClick={handleExportReport}>
                Export Report
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard title="Total Users" value={stats.totalUsers} icon="👥" note="↑ 8% from last month" />
            <StatCard title="Active Projects" value={stats.activeProjects} icon="📁" note="↑ 12%" />
            <StatCard title="Total Revenue" value={stats.totalRevenue} icon="💰" note="↑ 15%" />
            <StatCard title="Growth Rate" value={stats.growthRate} icon="📈" note="↑ 4%" />
          </div>

          {/* Charts */}
          <div className="charts-section">
            <RevenueChart data={revenueData} />
            <UserGrowthChart data={userGrowthData} />
          </div>

          {/* Tables */}
          <div className="table-row">
            <RecentTransactions data={recentTransactions} />
            <PlatformStats data={platformStats} />
          </div>

          {/* Top Performers */}
          <TopPerformers data={topPerformers} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
