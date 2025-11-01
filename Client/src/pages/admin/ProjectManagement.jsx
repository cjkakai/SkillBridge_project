import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from '../../config';
import "./UserManagement.css";

const ProjectManagement = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch contracts as primary data source
        const contractsResponse = await fetch(`${BASE_URL}/api/contracts`);
        const clientsResponse = await fetch(`${BASE_URL}/api/clients`);
        const freelancersResponse = await fetch(`${BASE_URL}/api/freelancers`);

        const contracts = contractsResponse.ok ? await contractsResponse.json() : [];
        const clients = clientsResponse.ok ? await clientsResponse.json() : [];
        const freelancers = freelancersResponse.ok ? await freelancersResponse.json() : [];

        console.log('Contracts response:', contractsResponse.ok, contracts);
        console.log('Clients response:', clientsResponse.ok, clients);
        console.log('Freelancers response:', freelancersResponse.ok, freelancers);
        
        // Fetch tasks for each contract
        const taskPromises = contracts.map(contract => 
          contract.task_id ? fetch(`${BASE_URL}/api/tasks/${contract.task_id}`).then(res => res.ok ? res.json() : null) : null
        );
        const tasks = await Promise.all(taskPromises);

        // Map contracts with their associated task and client information
        const projectsWithStatus = contracts.map((contract, index) => {
          const task = tasks[index];
          let status = contract.status || "pending";
          
          // Map contract status to display status
          if (status === 'active') {
            status = 'In Progress';
          } else if (status === 'completed') {
            status = 'Completed';
          } else if (status === 'pending') {
            status = 'Pending';
          }

          return {
            id: contract.id,
            contractId: contract.id,
            taskId: contract.task_id,
            title: task?.title || "Contract Task",
            description: task?.description || contract.description || "No description",
            budget: contract.agreed_amount ? `$${contract.agreed_amount}` : (task ? `${task.budget_min || 0} - ${task.budget_max || 0}` : "N/A"),
            startDate: contract.started_at || "N/A",
            deadline: contract.completed_at || "N/A",
            status: status,
            client: clients.find(c => c.id === (task?.client_id || contract.client_id))?.name || "Unknown",
            freelancer: freelancers.find(f => f.id === contract.freelancer_id)?.name || "Unassigned",
            skills: task?.skills || []
          };
        });

        setProjects(projectsWithStatus);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.freelancer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });





  if (loading) {
    return (
      <div className="admin-container">
        <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
          <div style={{ backgroundColor: 'white', padding: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Project Management</h1>
              <p style={{ color: '#6b7280', margin: 0 }}>Loading projects...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#f59e0b';
      case 'Pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'Completed').length,
    inProgress: projects.filter(p => p.status === 'In Progress').length,
    pending: projects.filter(p => p.status === 'Pending').length
  };

  return (
    <div className="admin-container">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
        {/* Header */}
        <div style={{ backgroundColor: 'white', padding: '32px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Contract Management</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Monitor and manage all platform contracts</p>
        </div>

        <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 120px)' }}>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Contracts</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>{stats.total}</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Completed</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.completed}</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>In Progress</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>{stats.inProgress}</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Pending</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#6b7280' }}>{stats.pending}</div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '300px' }}>
                <input
                  type="text"
                  placeholder="Search contracts by title, client, or freelancer..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                style={{
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  minWidth: '120px'
                }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Contracts Grid */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredProjects.map(project => (
              <div key={project.contractId} style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {project.title}
                      </h3>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: `${getStatusColor(project.status)}20`,
                        color: getStatusColor(project.status)
                      }}>
                        {project.status}
                      </span>
                    </div>
                    <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
                      {project.description}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Client</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{project.client}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Freelancer</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{project.freelancer}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Amount</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>{project.budget}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Start Date</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{project.startDate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>End Date</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{project.deadline}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div style={{
              backgroundColor: 'white',
              padding: '48px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '16px', color: '#6b7280' }}>No contracts found</div>
              <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>Try adjusting your search or filter criteria</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
