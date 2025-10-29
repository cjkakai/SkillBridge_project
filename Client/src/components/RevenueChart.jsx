import React from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const RevenueChart = ({ data }) => {
  console.log("Revenue data received:", data);

  // Ensure we always have an array
  const chartData = Array.isArray(data) ? data : [];

  if (!chartData.length) {
    return (
      <div className="chart-container">
        <h3>Revenue Overview</h3>
        <p>No revenue data available.</p>
      </div>
    );
  }

  const chartConfig = {
    labels: chartData.map((item) => item.month || item.label) || [],
    datasets: [
      {
        label: "Revenue ($)",
        data: chartData.map((item) => item.revenue || item.value) || [],
        borderColor: "#2563EB",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="chart-container">
      <h3>Revenue Overview</h3>
      <Line data={chartConfig} />
    </div>
  );
};

export default RevenueChart;
