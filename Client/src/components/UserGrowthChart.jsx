import React from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const UserGrowthChart = ({ data }) => {
  console.log("User growth data received:", data);

  // Ensure we always have an array
  const chartData = Array.isArray(data) ? data : [];

  if (!chartData.length) {
    return (
      <div className="chart-container">
        <h3>User Growth Overview</h3>
        <p>No user growth data available.</p>
      </div>
    );
  }

  const chartConfig = {
    labels: chartData.map((item) => item.month || item.label) || [],
    datasets: [
      {
        label: "User Growth",
        data: chartData.map((item) => item.users || item.value) || [],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="chart-container">
      <h3>User Growth Overview</h3>
      <Line data={chartConfig} />
    </div>
  );
};

export default UserGrowthChart;
