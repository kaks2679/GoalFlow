import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserGoals, createGoal, updateGoal, deleteGoal } from '../services/goalsService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function Goals() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    deadline: '',
    priority: 'medium',
    tags: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadGoals();
    }
  }, [currentUser]);

  const loadGoals = async () => {
    try {
      const data = await getUserGoals(currentUser.uid);
      setGoals(data);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const goalData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };

      if (editingGoal) {
        await updateGoal(currentUser.uid, editingGoal.id, goalData);
        toast.success('Goal updated!');
      } else {
        await createGoal(currentUser.uid, goalData);
        toast.success('Goal created!');
      }

      setShowModal(false);
      setEditingGoal(null);
      setFormData({ title: '', description: '', category: 'personal', deadline: '', priority: 'medium', tags: '' });
      loadGoals();
    } catch (error) {
      toast.error('Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await deleteGoal(currentUser.uid, id);
        toast.success('Goal deleted');
        loadGoals();
      } catch (error) {
        toast.error('Failed to delete goal');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Goals</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Goal
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <div key={goal.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
              <p className="text-gray-600 mb-4">{goal.description}</p>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span className="font-bold">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm capitalize">{goal.category}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setFormData({
                        title: goal.title,
                        description: goal.description,
                        category: goal.category,
                        deadline: goal.deadline,
                        priority: goal.priority,
                        tags: goal.tags?.join(', ') || ''
                      });
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingGoal ? 'Edit Goal' : 'New Goal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Goal Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="3"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="personal">Personal</option>
                <option value="study">Study</option>
                <option value="fitness">Fitness</option>
                <option value="finance">Finance</option>
                <option value="habit">Habit</option>
                <option value="career">Career</option>
              </select>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex space-x-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingGoal(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;
