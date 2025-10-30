// src/services/api.js

// Base URL (change if your backend uses another port)
const BASE_URL = "http://localhost:5555/api"; // adjust to your backend route

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

export const fetchClients = async () => {
  const response = await fetch(`${BASE_URL}/clients`);
  if (!response.ok) throw new Error('Failed to fetch clients');
  return await response.json();
};

export const fetchFreelancers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/freelancers`);
    if (!response.ok) throw new Error('Failed to fetch freelancers');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    throw error;
  }
};

// Fetch contracts
export const fetchContracts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/contracts`);
    if (!response.ok) throw new Error('Failed to fetch contracts');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
};

// Fetch all tasks
export const fetchTasks = async () => {
  const response = await fetch(`${BASE_URL}/tasks`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return await response.json();
};

// Fetch payments
export const fetchPayments = async () => {
  try {
    const response = await fetch(`${BASE_URL}/payments`);
    if (!response.ok) throw new Error('Failed to fetch payments');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

export const fetchCurrentUser = async () => {
  // Temporary dummy data until backend endpoint exists
  return {
    id: 1,
    name: "Admin User",
    email: "admin@skillbridge.com",
    role: "Administrator"
  };
};
