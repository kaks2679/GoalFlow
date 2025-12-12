import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserTasks, createTask, updateTask, deleteTask, updateTaskStatus } from '../services/tasksService';
import { getUserGoals } from '../services/goalsService';
import { toast } from 'react-toastify';

function Tasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    goalId: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadTasks();
      loadGoals();
    }
  }, [currentUser]);

  const loadTasks = async () => {
    try {
      const data = await getUserTasks(currentUser.uid);
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const loadGoals = async () => {
    try {
      const data = await getUserGoals(currentUser.uid);
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(currentUser.uid, formData);
      toast.success('Task created!');
      setShowModal(false);
      setFormData({ title: '', description: '', dueDate: '', priority: 'medium', goalId: '' });
      loadTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(currentUser.uid, taskId, newStatus);
      loadTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask(currentUser.uid, id);
        toast.success('Task deleted');
        loadTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Task
        </button>
      </div>

      <div className="mb-6 flex space-x-2">
        {['all', 'todo', 'in progress', 'done'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={() => handleStatusChange(task.id, task.status === 'done' ? 'todo' : 'done')}
                className="h-5 w-5"
              />
              <div className="flex-1">
                <h3 className={`font-semibold ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h3>
                {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                {task.dueDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {new Date(task.dueDate).toLocaleString()}
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {task.priority}
              </span>
            </div>
            <button onClick={() => handleDelete(task.id)} className="text-red-600 ml-4">
              Delete
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Task Title (e.g., Study at 3pm)"
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
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <select
                value={formData.goalId}
                onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">No Goal (Optional)</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
              <div className="flex space-x-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

export default Tasks;
