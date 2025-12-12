import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const EventModal = ({ isOpen, onClose, onSubmit, editingEvent = null, defaultDate = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: defaultDate ? format(new Date(defaultDate), 'yyyy-MM-dd') : '',
    startTime: '09:00',
    endTime: '10:00',
    type: 'meeting',
    color: '#3b82f6',
  });
  const [loading, setLoading] = useState(false);

  // Populate form when editing or default date changes
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        date: editingEvent.date || '',
        startTime: editingEvent.startTime || '09:00',
        endTime: editingEvent.endTime || '10:00',
        type: editingEvent.type || 'meeting',
        color: editingEvent.color || '#3b82f6',
      });
    } else if (defaultDate) {
      setFormData(prev => ({
        ...prev,
        date: format(new Date(defaultDate), 'yyyy-MM-dd')
      }));
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        type: 'meeting',
        color: '#3b82f6',
      });
    }
  }, [editingEvent, defaultDate, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return;
    }

    if (!formData.date) {
      toast.error('Event date is required');
      return;
    }

    // Validate time range
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        toast.error('End time must be after start time');
        return;
      }
    }

    setLoading(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        color: formData.color,
      };

      await onSubmit(eventData);
      
      // Reset form and close
      setFormData({
        title: '',
        description: '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        type: 'meeting',
        color: '#3b82f6',
      });
      onClose();
      
      toast.success(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
    } catch (error) {
      console.error('Error submitting event:', error);
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Team meeting"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Event details..."
              disabled={loading}
            />
          </div>

          {/* Date and Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="meeting">Meeting</option>
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
                <option value="deadline">Deadline</option>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Color
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                disabled={loading}
              />
              <span className="text-sm text-gray-600">{formData.color}</span>
              <div className="flex space-x-2">
                {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition"
                    style={{ backgroundColor: color }}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
