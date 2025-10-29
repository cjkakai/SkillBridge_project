import React from "react";

const PlatformStats = ({ data }) => {
  return (
    <div className="platform-stats-card" style={{ background: "#fff", padding: "1rem", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h3 style={{ marginBottom: "1rem", color: "#333" }}>Platform Statistics</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {data && data.map((stat, i) => (
          <li key={i} style={{ marginBottom: ".8rem", borderBottom: "1px solid #eee", paddingBottom: ".5rem" }}>
            <strong>{stat.label}:</strong> <span style={{ float: "right" }}>{stat.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlatformStats;
