// src/services/api.js

// Base URL (change if your backend uses another port)
const BASE_URL = "http://localhost:5000/api"; // adjust to your backend route

// Utility for fetching data
const fetchData = async (endpoint) => {
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`);
    if (!response.ok) throw new Error(`Error fetching ${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// ========== Dashboard APIs ==========

export const getDashboardStats = () => fetchData("dashboard/stats");

export const getRevenueChartData = () => fetchData("dashboard/revenue-chart");

export const getUserGrowthChartData = () => fetchData("dashboard/user-growth");

export const getRecentTransactions = () => fetchData("dashboard/recent-transactions");

export const getTopPerformers = () => fetchData("dashboard/top-performers");

export const getPlatformStats = () => fetchData("dashboard/platform-stats");

export const fetchCurrentUser = async () => {
  // Temporary dummy data until backend endpoint exists
  return {
    id: 1,
    name: "Admin User",
    email: "admin@skillbridge.com",
    role: "Administrator"
  };
};
