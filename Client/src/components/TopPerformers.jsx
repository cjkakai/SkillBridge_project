import React from "react";

const TopPerformers = ({ data }) => {
  console.log("Top performers data received:", data);

  // Ensure we always have an array
  const performers = Array.isArray(data) ? data : [];

  return (
    <div className="top-performers-card" style={{ background: "#fff", padding: "1rem", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h3 style={{ marginBottom: "1rem", color: "#333" }}>Top Performers</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {performers.length > 0 ? performers.map((p, i) => (
          <li key={i} style={{ marginBottom: ".8rem", borderBottom: "1px solid #eee", paddingBottom: ".5rem" }}>
            <strong>{p.name}</strong> — {p.role} <span style={{ float: "right" }}>{p.amount || p.score}$</span>
          </li>
        )) : (
          <li>No top performers data available</li>
        )}
      </ul>
    </div>
  );
};

export default TopPerformers;
