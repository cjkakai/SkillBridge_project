import React from "react";
import "./TopPerformers.css"; // reuse some card styles

const stats = [
  {label:"Total Freelancers", value:"7,124", icon:"👨‍💻"},
  {label:"Total Clients", value:"4,719", icon:"👥"},
  {label:"Jobs Posted (30d)", value:"2,341", icon:"📝"},
  {label:"Completed Projects", value:"8,456", icon:"✅"},
  {label:"Avg. Project Value", value:"$3,420", icon:"💰"},
  {label:"Success Rate", value:"94.2%", icon:"🏆"},
];

const PlatformStats = () => (
  <div className="transactions-card" style={{padding:20}}>
    <h4>Platform Statistics</h4>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginTop:20}}>
      {stats.map(s=>(
        <div key={s.label} style={{background:"#fff",borderRadius:12,padding:16,boxShadow:"0 4px 6px rgba(0,0,0,0.03)",border:"1px solid #f1f5f9",transition:"all 0.2s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:18}}>{s.icon}</span>
            <div style={{fontWeight:600,fontSize:16,color:"var(--navy)"}}>{s.value}</div>
          </div>
          <div style={{color:"#64748b",fontSize:13}}>{s.label}</div>
        </div>
      ))}
    </div>
  </div>
);

export default PlatformStats;