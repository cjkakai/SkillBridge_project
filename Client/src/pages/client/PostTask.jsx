import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, User } from 'lucide-react';
import "./PostTask.css";
import './ClientDashboard.css';

 
function PostTask() {
  const navigate = useNavigate();
  const clientId = 5; // Hardcoded for now, should come from auth context

   // This state holds all the information the user enters in the form
   const [formData, setFormData] = useState({
     title: "",
     description: "",
     requiredSkill: "",
     skills: [],
     minBudget: "500",
     maxBudget: "1000",
     deadline: "",
   });

  
  // It updates the formData state with the new value for the given field
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  

  // Function to add a new skill to the skills list
  
  const handleAddSkill = () => {
    if (formData.requiredSkill.trim() !== "") { // Trim removes extra spaces
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.requiredSkill.trim()], // Add new skill to array
        requiredSkill: "", 
      }));
    }
  };

  // Function to remove a skill from the skills list

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove), // Keep only skills that don't match
    }));
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create the task data
      const taskData = {
        title: formData.title,
        description: formData.description,
        client_id: clientId,
        budget_min: parseInt(formData.minBudget),
        budget_max: parseInt(formData.maxBudget),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : null,
        status: 'open',
        created_at: new Date().toISOString()
      };

      // Post the task
      const taskResponse = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!taskResponse.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await taskResponse.json();

      // Create skills and link them to the task
      for (const skillName of formData.skills) {
        // First, create or get the skill
        const skillResponse = await fetch(`/api/clients/${clientId}/skills`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: skillName, task_id: newTask.id }),
        });

        if (!skillResponse.ok) {
          console.error(`Failed to create skill: ${skillName}`);
        }
      }

      // Navigate to dashboard
      alert('Task posted successfully!');
      navigate('/');

    } catch (error) {
      console.error('Error posting task:', error);
      alert('Failed to post task. Please try again.');
    }
  };

 
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>SkillBridge</h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-contracts')}>
            <Briefcase size={20} />
            <span>My Contracts</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-messages')}>
            <MessageSquare size={20} />
            <span>Messages</span>
          </div>
          <div className="nav-item active">
            <Plus size={20} />
            <span>Post a Job</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-profile')}>
            <User size={20} />
            <span>Your Profile</span>
          </div>
          <div className="nav-item">
            <CreditCard size={20} />
            <span>Payments</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content posttask-main">
        <div className="posttask-container">
          <div className="form-section">
        
           <h1 className="page-title">Post a New Task</h1>
            <p className="subtitle">
            Fill in the details below to post your task and start receiving proposals
            </p>

        
         <div className="card">
          <h2>Basic Information</h2>
          <label>Task Title *</label>
          <input
            type="text"
            placeholder="e.g., Full Stack Developer for SaaS Platform"
            value={formData.title} 
            onChange={(e) => handleInputChange("title", e.target.value)} 
          />
          <p className="hint">Write a clear, descriptive title for your task</p>


          
          <label>Description *</label>
          <textarea
            rows={5}
            placeholder="Describe the task in detail..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          ></textarea>

          
          <label>Required Skills *</label>
          <div className="skills-section">
            
            <input
              type="text"
              placeholder="Add a skill (e.g., React, Python)"
              value={formData.requiredSkill}
              onChange={(e) => handleInputChange("requiredSkill", e.target.value)}
            />
            
            <button type="button" onClick={handleAddSkill} className="add-skill-btn">
              +
            </button>
          </div>

          {/* Display list of added skills */}
          <div className="skills-list">
            {formData.skills.map((skill, index) => (
              <span key={index} className="skill-badge">
                {skill}
               
                <button
                  type="button"
                  className="remove-skill"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        
        <div className="card">
          <h2>Budget & Timeline</h2>

         

          
          <div className="budget-box">
            <div>
              <label>Minimum Budget *</label>
              <input
                type="number"
                value={formData.minBudget}
                onChange={(e) => handleInputChange("minBudget", e.target.value)}
              />
            </div>
            <div>
              <label>Maximum Budget *</label>
              <input
                type="number"
                value={formData.maxBudget}
                onChange={(e) => handleInputChange("maxBudget", e.target.value)}
              />
            </div>
          </div>

          

          
          <label>Deadline</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => handleInputChange("deadline", e.target.value)}
          />
        </div>

      </div>

     
     
     <div className="preview-section">
       <div className="card_preview">
         <h2>Task Preview</h2>
         
         <p className="preview-item">
           <strong>Title:</strong> {formData.title || "Full Stack Developer..."}
         </p>
         
         <p className="preview-item">
           <strong>Budget:</strong> ${formData.minBudget} - ${formData.maxBudget}
         </p>

         {formData.deadline && (
           <p className="preview-item">
             <strong>Deadline:</strong> {new Date(formData.deadline).toLocaleDateString('en-US', {
               year: 'numeric',
               month: 'short',
               day: 'numeric'
             })}
           </p>
         )}

         <p>
           <strong>Skills Required:</strong>{" "}
           {formData.skills.map((skill, index) => (
             <span key={index} className="skill-badge">
               {skill}
             </span>
           ))}
         </p>

         <button className="post-btn" onClick={handleSubmit}>Post Task</button>

         
         <div className="tip">
           <strong>Tip:</strong> Tasks with detailed descriptions and clear
           requirements receive 3x more quality proposals!
         </div>
       </div>
     </div>
     </div>
     </div>
   </div>
 );
}


export default PostTask;