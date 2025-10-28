import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      status: "Active",
      lastActive: "2023-05-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "User",
      status: "Active",
      lastActive: "2023-05-18",
    },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert.j@example.com",
      role: "User",
      status: "Inactive",
      lastActive: "2023-04-22",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Moderator",
      status: "Active",
      lastActive: "2023-05-10",
    },
    {
      id: 5,
      name: "Michael Wilson",
      email: "michael.w@example.com",
      role: "User",
      status: "Active",
      lastActive: "2023-05-17",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "All" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleEditUser = (userId) => {
    // Find the user to edit
    const userToEdit = users.find(user => user.id === userId);
    if (userToEdit) {
      // In a real application, you would open a modal or navigate to an edit page
      alert(`Editing user: ${userToEdit.name}\nEmail: ${userToEdit.email}\nRole: ${userToEdit.role}\nStatus: ${userToEdit.status}`);
    }
  };

  const handleAddUser = () => {
    // In a real application, you would open a modal or navigate to an add user page
    alert("Add new user functionality would open here");
  };

  return (
    <div className="admin-container">
      <Sidebar />
      
      <div className="admin-main">
        <Header />
        
        <div className="admin-content">
          <div className="user-management-header">
            <h2>User Management</h2>
            <button className="btn-add-user" onClick={handleAddUser}>+ Add New User</button>
          </div>
          
          <div className="user-filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search users..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <select 
                className="filter-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
                <option value="User">User</option>
              </select>
              
              <select 
                className="filter-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">{user.name.charAt(0)}</div>
                        <div className="user-name">{user.name}</div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.lastActive}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-edit"
                          onClick={() => handleEditUser(user.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;