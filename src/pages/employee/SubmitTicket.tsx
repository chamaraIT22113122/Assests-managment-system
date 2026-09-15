import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SubmitTicket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          submittedBy: user?.id
        })
      });
      const data = await response.json();
      if (data.success) {
        navigate('/employee/tickets');
      } else {
        alert('Failed to submit ticket');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-[#000000] dark:text-[#e5e4e2]">Submit a Support Ticket</h1>
      <form onSubmit={handleSubmit} className="bg-[#e5e4e2] dark:bg-[#000000] p-8 rounded-xl shadow-md border border-slate-300 dark:border-slate-700 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Issue Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-[#fcaf17]"
            placeholder="e.g. Laptop won't turn on"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
          <select 
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-[#fcaf17]"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] h-32 outline-none focus:border-[#fcaf17]"
            placeholder="Please describe the issue in detail..."
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#fcaf17] hover:bg-blue-700 disabled:opacity-70 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Ticket to Admin'}
        </button>
      </form>
    </div>
  );
};
export default SubmitTicket;
