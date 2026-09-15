import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Ticket, Clock, CheckCircle, Plus, ChevronRight, Activity, Zap, Monitor, Laptop, Server, Smartphone, HeadphonesIcon, Printer, Cpu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/tickets/my/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setTickets(sorted);
            setStats({
              total: data.length,
              inProgress: data.filter(t => t.status === 'In Progress' || t.status === 'Open').length,
              resolved: data.filter(t => t.status === 'Resolved' || t.status === 'Closed').length
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
        
      if (user?.name) {
        fetch('/api/assets')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setAssets(data.filter((a: any) => a.assignedTo?.toLowerCase() === user.name.toLowerCase()));
            }
            setLoadingAssets(false);
          })
          .catch(() => setLoadingAssets(false));
      }
    }
  }, [user]);

  const getAssetIcon = (category: string) => {
    if (!category) return <Monitor size={24} />;
    const cat = category.toLowerCase();
    if (cat.includes('laptop')) return <Laptop size={24} />;
    if (cat.includes('server')) return <Server size={24} />;
    if (cat.includes('phone') || cat.includes('mobile')) return <Smartphone size={24} />;
    if (cat.includes('audio') || cat.includes('headset')) return <HeadphonesIcon size={24} />;
    if (cat.includes('print')) return <Printer size={24} />;
    if (cat.includes('network') || cat.includes('router')) return <Activity size={24} />;
    if (cat.includes('component') || cat.includes('part')) return <Cpu size={24} />;
    return <Monitor size={24} />;
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Welcome Banner */}
      <motion.div variants={item} className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fcaf17] to-amber-600 shadow-xl p-8 sm:p-10 text-white border border-white/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20 pointer-events-none">
          <Zap size={250} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight text-white drop-shadow-sm">Welcome back, {user?.name}!</h1>
            <p className="text-white/90 text-lg max-w-xl font-medium">
              Your centralized hub for IT support and asset management. Everything is running smoothly.
            </p>
          </div>
          <button 
            onClick={() => navigate('/employee/tickets')}
            className="shrink-0 bg-white text-amber-600 hover:bg-slate-50 px-6 py-3 rounded-2xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/40"
          >
            <Plus size={20} /> Raise a Ticket
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#e5e4e2] dark:bg-[#000000] p-6 rounded-3xl shadow-md border border-slate-300 dark:border-slate-700 hover:border-[#fcaf17] dark:hover:border-[#fcaf17]/50 transition-colors group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors pointer-events-none"></div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-200 dark:border-blue-800">
            <Ticket size={24} />
          </div>
          <h3 className="text-slate-700 dark:text-slate-400 font-medium">Total Tickets</h3>
          <p className="text-4xl font-bold text-[#000000] dark:text-[#e5e4e2] mt-1">
            {loading ? <span className="animate-pulse bg-slate-300 dark:bg-slate-800 h-10 w-16 rounded inline-block"></span> : stats.total}
          </p>
        </div>
        
        <div className="bg-[#e5e4e2] dark:bg-[#000000] p-6 rounded-3xl shadow-md border border-slate-300 dark:border-slate-700 hover:border-[#fcaf17] dark:hover:border-[#fcaf17]/50 transition-colors group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors pointer-events-none"></div>
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-amber-200 dark:border-amber-800">
            <Clock size={24} />
          </div>
          <h3 className="text-slate-700 dark:text-slate-400 font-medium">In Progress</h3>
          <p className="text-4xl font-bold text-[#000000] dark:text-[#e5e4e2] mt-1">
            {loading ? <span className="animate-pulse bg-slate-300 dark:bg-slate-800 h-10 w-16 rounded inline-block"></span> : stats.inProgress}
          </p>
        </div>

        <div className="bg-[#e5e4e2] dark:bg-[#000000] p-6 rounded-3xl shadow-md border border-slate-300 dark:border-slate-700 hover:border-[#fcaf17] dark:hover:border-[#fcaf17]/50 transition-colors group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none"></div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-emerald-200 dark:border-emerald-800">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-slate-700 dark:text-slate-400 font-medium">Resolved</h3>
          <p className="text-4xl font-bold text-[#000000] dark:text-[#e5e4e2] mt-1">
            {loading ? <span className="animate-pulse bg-slate-300 dark:bg-slate-800 h-10 w-16 rounded inline-block"></span> : stats.resolved}
          </p>
        </div>
      </motion.div>

      {/* My Assets Section */}
      <motion.div variants={item} className="mb-8 bg-[#e5e4e2] dark:bg-[#000000] rounded-3xl shadow-md border border-slate-300 dark:border-slate-700 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <Laptop size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#000000] dark:text-[#e5e4e2]">My Assigned Assets</h2>
              <p className="text-sm text-slate-700 dark:text-slate-400">Devices and equipment currently assigned to you</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8">
          {loadingAssets ? (
            <div className="flex justify-center py-8"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div></div>
          ) : assets.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Monitor className="text-slate-400 dark:text-slate-500" size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#000000] dark:text-[#e5e4e2] mb-1">No assets assigned</h3>
              <p className="text-slate-700 max-w-sm">You don't have any IT assets currently assigned to your profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map(asset => (
                <div key={asset._id} className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-[#fcaf17]/50 transition-all group flex items-center gap-4">
                  <div className="w-12 h-12 shrink-0 bg-slate-100 dark:bg-[#000000] rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-400 group-hover:text-[#fcaf17] transition-colors shadow-inner border border-slate-200 dark:border-slate-700">
                    {getAssetIcon(asset.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-base text-[#000000] dark:text-[#e5e4e2] truncate mb-1">{asset.name}</h4>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate" title="Serial Number / Asset Code">
                      SN: {asset.serialNumber || asset.assetCode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Tickets Section */}
      <motion.div variants={item} className="bg-[#e5e4e2] dark:bg-[#000000] rounded-3xl shadow-md border border-slate-300 dark:border-slate-700 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#fcaf17]/20 text-[#fcaf17] rounded-2xl flex items-center justify-center border border-[#fcaf17]/30">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#000000] dark:text-[#e5e4e2]">Recent Activity</h2>
              <p className="text-sm text-slate-700 dark:text-slate-400">Your latest support requests</p>
            </div>
          </div>
          <Link to="/employee/tickets" className="text-sm font-semibold text-[#fcaf17] hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 group bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
            View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="divide-y divide-slate-300 dark:divide-slate-700">
          {loading ? (
            <div className="p-12 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-[#fcaf17] border-t-transparent animate-spin"></div></div>
          ) : tickets.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center bg-white/20 dark:bg-white/5">
              <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <Ticket className="text-slate-400 dark:text-slate-500" size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#000000] dark:text-[#e5e4e2] mb-2">No recent tickets</h3>
              <p className="text-slate-700 max-w-sm">You don't have any support requests yet. If you need help, feel free to raise a new ticket.</p>
            </div>
          ) : (
            tickets.slice(0, 3).map(ticket => (
              <Link key={ticket._id} to="/employee/tickets" className="block p-6 hover:bg-white dark:hover:bg-slate-900/80 transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200 dark:bg-[#1a1a1a] px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 shadow-sm">
                        #{ticket._id?.slice(-8).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        ticket.status === 'Open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200' :
                        ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg text-[#000000] dark:text-[#e5e4e2] group-hover:text-[#fcaf17] transition-colors">{ticket.title}</h4>
                  </div>
                  <div className="shrink-0 flex items-center gap-4 text-slate-700">
                    <span className="text-sm font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center group-hover:bg-[#fcaf17] group-hover:text-white transition-colors">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeDashboard;
