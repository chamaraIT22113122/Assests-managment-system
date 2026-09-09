import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Ticket, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:5000/api/tickets/my/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setStats({
              total: data.length,
              inProgress: data.filter(t => t.status === 'In Progress' || t.status === 'Open').length,
              resolved: data.filter(t => t.status === 'Resolved' || t.status === 'Closed').length
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Welcome back, {user?.name}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">Here's an overview of your IT requests and assets.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <Ticket size={24} />
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 font-medium">Total Tickets</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
            {loading ? <span className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-12 rounded inline-block"></span> : stats.total}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 font-medium">In Progress</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
            {loading ? <span className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-12 rounded inline-block"></span> : stats.inProgress}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 font-medium">Resolved</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
            {loading ? <span className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-12 rounded inline-block"></span> : stats.resolved}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ticket size={28} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Need IT Support?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto text-sm sm:text-base">
          If you're experiencing hardware issues or need software access, raise a new ticket to get help from the IT team.
        </p>
        <Link 
          to="/employee/tickets" 
          className="inline-flex items-center justify-center px-6 py-3 bg-[#3b5998] hover:bg-blue-700 text-white rounded-xl font-medium transition-colors w-full sm:w-auto"
        >
          View My Tickets
        </Link>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
