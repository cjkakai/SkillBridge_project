import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, ArrowLeft, User } from 'lucide-react';
import ClientSidebar from './ClientSidebar';
import { BASE_URL } from '../../config';
import './TaskEdit.css';

const TaskEdit = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [task, setTask] = useState({
    title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/tasks/${taskId}`);
      if (response.ok) {
        const taskData = await response.json();
        setTask({
          title: taskData.title || '',
          description: taskData.description || '',
          budget_min: taskData.budget_min || '',
          budget_max: taskData.budget_max || '',
          deadline: taskData.deadline ? new Date(taskData.deadline).toISOString().split('T')[0] : ''
        });
      } else {
        console.error('Failed to fetch task');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : null
        })
      });

      if (response.ok) {
        navigate('/client/dashboard');
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <ClientSidebar />
        <div className="main-content">
          <p>Loading task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <ClientSidebar />

      {/* Main Content */}
      <div className="main-content">
        <div className="task-edit-header">
          <h1>Edit Task</h1>
          <button
            className="back-btn"
            onClick={() => navigate('/client/dashboard')}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        <div className="task-edit-form-container">
          <form onSubmit={handleSubmit} className="task-edit-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={task.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={task.description}
                onChange={handleInputChange}
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget_min">Minimum Budget (KSH)</label>
                <input
                  type="number"
                  id="budget_min"
                  name="budget_min"
                  value={task.budget_min}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget_max">Maximum Budget (KSH)</label>
                <input
                  type="number"
                  id="budget_max"
                  name="budget_max"
                  value={task.budget_max}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Deadline</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={task.deadline}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/client-dashboard')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskEdit;