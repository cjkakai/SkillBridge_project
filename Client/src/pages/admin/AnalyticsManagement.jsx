import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../../context/AuthContext";
// import { fetchClients, fetchFreelancers, fetchTasks, fetchContracts, fetchPayments } from "../../../../src/services/api";
import "./UserManagement.css"; // Reuse the same CSS

const AnalyticsManagement = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [clients, freelancers, tasks, contracts, payments] = await Promise.all([
          fetchClients(),
          fetchFreelancers(),
          fetchTasks(),
          fetchContracts(),
          fetchPayments()
        ]);

        // Calculate analytics
        const totalClients = clients.length;
        const totalFreelancers = freelancers.length;
        const totalUsers = totalClients + totalFreelancers;
        const totalProjects = tasks.length;
        const totalContracts = contracts.length;
        const totalPayments = payments.length;

        // Calculate completed projects (contracts with status 'completed')
        const completedContracts = contracts.filter(contract => contract.status === 'completed').length;
        const completionRate = totalContracts > 0 ? ((completedContracts / totalContracts) * 100).toFixed(1) : 0;

        // Calculate total revenue
        const totalRevenue = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

        // Calculate average project value
        const avgProjectValue = totalPayments > 0 ? (totalRevenue / totalPayments).toFixed(2) : 0;

        // Calculate monthly growth (simplified - using creation dates)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const newClientsThisMonth = clients.filter(client => {
          const createdDate = new Date(client.created_at);
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length;

        const newFreelancersThisMonth = freelancers.filter(freelancer => {
          const createdDate = new Date(freelancer.created_at);
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length;

        const newProjectsThisMonth = tasks.filter(task => {
          const createdDate = new Date(task.created_at);
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length;

        // Calculate revenue by month (last 6 months)
        const revenueByMonth = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.getMonth();
          const year = date.getFullYear();

          const monthlyRevenue = payments
            .filter(payment => {
              const paymentDate = new Date(payment.created_at);
              return paymentDate.getMonth() === month && paymentDate.getFullYear() === year;
            })
            .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

          revenueByMonth.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            revenue: monthlyRevenue
          });
        }

        // Top performing freelancers (by number of completed contracts)
        const freelancerStats = freelancers.map(freelancer => {
          const freelancerContracts = contracts.filter(contract => contract.freelancer_id === freelancer.id);
          const completedCount = freelancerContracts.filter(contract => contract.status === 'completed').length;
          const totalEarnings = payments
            .filter(payment => {
              const contract = contracts.find(c => c.id === payment.contract_id);
              return contract && contract.freelancer_id === freelancer.id;
            })
            .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

          return {
            name: freelancer.name,
            completedProjects: completedCount,
            totalEarnings: totalEarnings,
            rating: freelancer.rating || 4.5 // Assuming rating exists or default
          };
        }).sort((a, b) => b.completedProjects - a.completedProjects).slice(0, 5);

        // Project categories distribution
        const projectCategories = {};
        tasks.forEach(task => {
          const category = task.category || 'General';
          projectCategories[category] = (projectCategories[category] || 0) + 1;
        });

        setAnalytics({
          totalUsers,
          totalClients,
          totalFreelancers,
          totalProjects,
          totalContracts,
          completedContracts,
          completionRate,
          totalRevenue,
          avgProjectValue,
          newClientsThisMonth,
          newFreelancersThisMonth,
          newProjectsThisMonth,
          revenueByMonth,
          topFreelancers: freelancerStats,
          projectCategories
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="admin-main">
          <Header />
          <div className="admin-content">
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading analytics...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Sidebar />

      <div className="admin-main">
        <Header />

        <div className="admin-content">
          <div className="user-management-header">
            <h2>Platform Analytics</h2>
          </div>

          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Users</h3>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>{analytics.totalUsers}</div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                {analytics.totalClients} Clients, {analytics.totalFreelancers} Freelancers
              </div>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Projects</h3>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>{analytics.totalProjects}</div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                {analytics.completedContracts} Completed ({analytics.completionRate}% success rate)
              </div>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Revenue</h3>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#ffc107' }}>${analytics.totalRevenue.toFixed(2)}</div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                Avg: ${analytics.avgProjectValue} per project
              </div>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Monthly Growth</h3>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#dc3545' }}>
                +{analytics.newClientsThisMonth + analytics.newFreelancersThisMonth}
              </div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                New users this month
              </div>
            </div>
          </div>

          {/* Revenue Trend */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Revenue Trend (Last 6 Months)</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', height: '200px' }}>
              {analytics.revenueByMonth.map((month, index) => (
                <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                  <div
                    style={{
                      height: `${Math.max((month.revenue / Math.max(...analytics.revenueByMonth.map(m => m.revenue))) * 150, 10)}px`,
                      background: '#007bff',
                      marginBottom: '10px',
                      borderRadius: '4px 4px 0 0'
                    }}
                  ></div>
                  <div style={{ fontSize: '0.8em', color: '#666' }}>{month.month}</div>
                  <div style={{ fontSize: '0.9em', fontWeight: 'bold' }}>${month.revenue.toFixed(0)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Top Performing Freelancers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {analytics.topFreelancers.map((freelancer, index) => (
                <div key={index} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{freelancer.name}</div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {freelancer.completedProjects} projects completed
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    ${freelancer.totalEarnings.toFixed(2)} earned
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    ⭐ {freelancer.rating}/5 rating
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Categories */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Project Categories Distribution</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              {Object.entries(analytics.projectCategories).map(([category, count]) => (
                <div key={category} style={{ textAlign: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#007bff' }}>{count}</div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>{category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManagement;
