import React from "react";
import "./TopPerformers.css"; // reuse some card styles

const stats = [
  {label:"Total Freelancers", value:"7,124"},
  {label:"Total Clients", value:"4,719"},
  {label:"Jobs Posted (30d)", value:"2,341"},
  {label:"Completed Projects", value:"8,456"},
  {label:"Avg. Project Value", value:"$3,420"},
  {label:"Success Rate", value:"94.2%"},
];

const PlatformStats = () => (
  <div className="transactions-card" style={{padding:18}}>
    <h4>Platform Statistics</h4>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginTop:12}}>
      {stats.map(s=>(
        <div key={s.label} style={{background:"#fff",borderRadius:10,padding:12,boxShadow:"0 4px 10px rgba(0,0,0,0.04)"}}>
          <div style={{fontWeight:700,fontSize:18,color:"var(--navy)"}}>{s.value}</div>
          <div style={{color:"#6b7280",marginTop:6}}>{s.label}</div>
        </div>
      ))}
    </div>
  </div>
);

export default PlatformStats;