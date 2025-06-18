import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDisaster } from '../api/disasters';

const DisasterForm = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location_name: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const disaster = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim())
      };
      
      const result = await createDisaster(disaster, user.id);
      navigate(`/disasters/${result.id}`);
    } catch (error) {
      console.error('Error creating disaster:', error);
      alert('Failed to create disaster');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="disaster-form">
      <h2>Report New Disaster</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Location Name</label>
          <input
            type="text"
            name="location_name"
            value={formData.location_name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="flood, earthquake, urgent"
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default DisasterForm;
