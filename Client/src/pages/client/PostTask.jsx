import React, { useState } from "react";
import "./PostTask.css";

 
function PostTask() {
 
  // This state holds all the information the user enters in the form
  const [formData, setFormData] = useState({
    jobTitle: "", 
    category: "", 
    jobDescription: "", 
    requiredSkill: "", 
    skills: ["React", "Node.js"], 
    budgetType: "fixed", 
    minBudget: "500", 
    maxBudget: "1000", 
    projectDuration: "", 
    deadline: "", 
    experienceLevel: "", 
    locationPreference: "", 
  });

  
  // It updates the formData state with the new value for the given field
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  
  // When a file is selected, it updates the attachment in formData
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the first file selected
    setFormData((prev) => ({ ...prev, attachment: file }));
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

 
  return (
   
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
            value={formData.jobTitle} 
            onChange={(e) => handleInputChange("jobTitle", e.target.value)} 
          />
          <p className="hint">Write a clear, descriptive title for your task</p>

          <label>Category *</label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
          >
            <option value="">Select a category</option>
            <option value="web-development">Web Development</option>
            <option value="mobile-development">Mobile Development</option>
            <option value="design">Design</option>
            <option value="writing">Writing</option>
            <option value="marketing">Marketing</option>
          </select>

          
          <label>Description *</label>
          <textarea
            rows={5}
            placeholder="Describe the task in detail..."
            value={formData.jobDescription}
            onChange={(e) => handleInputChange("jobDescription", e.target.value)}
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

         
          <label>Budget Type *</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="budgetType"
                value="fixed"
                checked={formData.budgetType === "fixed"} // Checked if state matches
                onChange={(e) => handleInputChange("budgetType", e.target.value)}
              />
              Fixed Price
            </label>
            <label>
              <input
                type="radio"
                name="budgetType"
                value="hourly"
                checked={formData.budgetType === "hourly"}
                onChange={(e) => handleInputChange("budgetType", e.target.value)}
              />
              Hourly Rate
            </label>
          </div>

          
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

          
          <label>Project Duration *</label>
          <select
            value={formData.projectDuration}
            onChange={(e) => handleInputChange("projectDuration", e.target.value)}
          >
            <option value="">Select duration</option>
            <option value="less-than-1-week">Less than 1 week</option>
            <option value="1-2-weeks">1-2 weeks</option>
            <option value="2-4-weeks">2-4 weeks</option>
            <option value="1-3-months">1-3 months</option>
            <option value="3-6-months">3-6 months</option>
            <option value="more-than-6-months">More than 6 months</option>
          </select>

          
          <label>Deadline (Optional)</label>
          <input
            type="text"
            placeholder="mm/dd/yyyy"
            value={formData.deadline}
            onChange={(e) => handleInputChange("deadline", e.target.value)}
          />
        </div>

        <div className="card">
          <h2>Attachments (Optional)</h2>
          <div className="upload-box">
            <p>Click to upload or drag and drop</p>
            <p className="upload-hint">PDF, DOC, or images up to 10MB</p>
            <input type="file" onChange={handleFileChange} /> {/* File input */}
          </div>
         
          {formData.attachment && (
            <p className="file-name">
              Attached: <strong>{formData.attachment.name}</strong>
            </p>
          )}
        </div>
      </div>

     
     
     <div className="preview-section">
       <div className="card preview">
         <h2>Task Preview</h2>
         
         <p className="preview-item">
           <strong>Title:</strong> {formData.jobTitle || "Full Stack Developer..."}
         </p>
         
         <p className="preview-item">
           <strong>Budget:</strong> ${formData.minBudget} - ${formData.maxBudget}{" "}
           {formData.budgetType === "fixed" ? "Fixed" : "Hourly"}
         </p>
        
         <p>
           <strong>Skills Required:</strong>{" "}
           {formData.skills.map((skill, index) => (
             <span key={index} className="skill-badge">
               {skill}
             </span>
           ))}
         </p>

         <button className="post-btn">Post Task</button>
         <button className="draft-btn">Save as Draft</button>

         
         <div className="tip">
           <strong>Tip:</strong> Tasks with detailed descriptions and clear
           requirements receive 3x more quality proposals!
         </div>
       </div>
     </div>
   </div>
 );
}


export default PostTask;