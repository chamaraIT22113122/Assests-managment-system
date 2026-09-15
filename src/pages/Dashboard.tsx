import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Monitor, Users, Ticket, Building2, Package, AlertTriangle,
  CheckCircle, Clock, TrendingUp, Activity, ArrowRight,
  Wrench, ShieldAlert, CircleDot, BarChart3, PieChart
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// ── Stat Card ────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, bg, onClick }: any) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -4, scale: 1.01 }}
    onClick={onClick}
    className={`${bg} rounded-2xl p-5 border border-slate-300 dark:border-slate-700 shadow-md cursor-pointer transition-all`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      {onClick && <ArrowRight size={16} className="text-slate-800 mt-1" />}
    </div>
    <p className="text-3xl font-bold text-[#000000] dark:text-[#e5e4e2]">{value}</p>
    <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-slate-800 dark:text-slate-500 mt-1">{sub}</p>}
  </motion.div>
);

// ── Mini Bar ─────────────────────────────────────────────
const MiniBar = ({ label, count, total, color }: any) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-slate-700 dark:text-slate-400 w-28 shrink-0">{label}</span>
    <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full ${color}`} style={{ width: total ? `${(count / total) * 100}%` : '0%' }} />
    </div>
    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6 text-right">{count}</span>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, t, c, u] = await Promise.all([
          fetch('/api/assets').then(r => r.json()),
          fetch('/api/tickets').then(r => r.json()),
          fetch('/api/companies').then(r => r.json()),
          fetch('/api/users').then(r => r.json()),
        ]);
        setAssets(Array.isArray(a) ? a : []);
        setTickets(Array.isArray(t) ? t : []);
        setCompanies(Array.isArray(c) ? c : []);
        setUsers(Array.isArray(u) ? u : []);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // ── Computed Stats ──
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
  const criticalTickets = tickets.filter(t => t.priority === 'Critical' || t.priority === 'High').length;

  const conditionCounts: Record<string, number> = {};
  assets.forEach(a => { conditionCounts[a.status] = (conditionCounts[a.status] || 0) + 1; });

  const categoryMap: Record<string, number> = {};
  assets.forEach(a => { categoryMap[a.category] = (categoryMap[a.category] || 0) + 1; });
  const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const recentTickets = [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recentAssets = [...assets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const STATUS_PRIORITY = [
    { label: 'Open', color: 'bg-amber-400' },
    { label: 'In Progress', color: 'bg-blue-500' },
    { label: 'Resolved', color: 'bg-emerald-500' },
    { label: 'Closed', color: 'bg-slate-400' },
  ];

  const CONDITION_COLORS: Record<string, string> = {
    'Brand New': 'bg-emerald-500',
    'Reconditioned': 'bg-blue-500',
    'Good Condition': 'bg-teal-500',
    'Fair Condition': 'bg-yellow-500',
    'Needs Repair': 'bg-orange-500',
    'Not Functional': 'bg-red-500',
    'Need Replacement': 'bg-red-700',
    'Under Maintenance': 'bg-purple-500',
    'Retired': 'bg-[#e5e4e2]0',
  };

  if (loading) {
    return (
      <div className="py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 dark:bg-[#000000] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      className="py-8 space-y-8">

      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-[#000000] dark:text-[#e5e4e2]">System Overview</h1>
        <p className="text-sm text-slate-700 dark:text-slate-400 mt-1">Full overview of your IT assets, tickets, companies, and members.</p>
      </motion.div>

      {/* ── Top Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Monitor} label="Total Assets" value={assets.length}
          sub={`${topCategories[0]?.[0] || 'N/A'} is top category`}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          bg="bg-[#e5e4e2] dark:bg-[#000000]"
          onClick={() => navigate('/admin/assets')} />
        <StatCard icon={Ticket} label="Open Tickets" value={openTickets}
          sub={`${inProgressTickets} in progress · ${resolvedTickets} resolved`}
          color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
          bg="bg-[#e5e4e2] dark:bg-[#000000]"
          onClick={() => navigate('/admin/tickets')} />
        <StatCard icon={Users} label="Members" value={users.length}
          sub={`Across ${companies.length} companies`}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          bg="bg-[#e5e4e2] dark:bg-[#000000]"
          onClick={() => navigate('/admin/users')} />
        <StatCard icon={ShieldAlert} label="High Priority" value={criticalTickets}
          sub="Critical & high tickets open"
          color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          bg="bg-[#e5e4e2] dark:bg-[#000000]"
          onClick={() => navigate('/admin/tickets')} />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Ticket Status Breakdown */}
        <motion.div variants={fadeUp} className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl p-6 border border-slate-300 dark:border-slate-700 shadow-md">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={18} className="text-[#fcaf17]" />
            <h2 className="font-bold text-[#000000] dark:text-[#e5e4e2] text-sm">Ticket Status</h2>
          </div>
          <div className="space-y-3">
            {STATUS_PRIORITY.map(s => (
              <MiniBar key={s.label} label={s.label}
                count={tickets.filter(t => t.status === s.label).length}
                total={tickets.length || 1} color={s.color} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700 flex justify-between text-xs text-slate-700">
            <span>Total: <strong className="text-slate-700 dark:text-[#e5e4e2]">{tickets.length}</strong></span>
            <button onClick={() => navigate('/admin/tickets')} className="text-[#fcaf17] hover:underline font-medium">View all →</button>
          </div>
        </motion.div>

        {/* Asset Conditions */}
        <motion.div variants={fadeUp} className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl p-6 border border-slate-300 dark:border-slate-700 shadow-md">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-[#fcaf17]" />
            <h2 className="font-bold text-[#000000] dark:text-[#e5e4e2] text-sm">Asset Conditions</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(conditionCounts).slice(0, 6).map(([status, count]) => (
              <MiniBar key={status} label={status} count={count} total={assets.length || 1}
                color={CONDITION_COLORS[status] || 'bg-slate-400'} />
            ))}
            {Object.keys(conditionCounts).length === 0 && (
              <p className="text-xs text-slate-800 text-center py-4">No assets yet</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700 flex justify-between text-xs text-slate-700">
            <span>Total: <strong className="text-slate-700 dark:text-[#e5e4e2]">{assets.length}</strong></span>
            <button onClick={() => navigate('/admin/assets')} className="text-[#fcaf17] hover:underline font-medium">View all →</button>
          </div>
        </motion.div>

        {/* Companies Overview */}
        <motion.div variants={fadeUp} className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl p-6 border border-slate-300 dark:border-slate-700 shadow-md">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={18} className="text-[#fcaf17]" />
            <h2 className="font-bold text-[#000000] dark:text-[#e5e4e2] text-sm">Companies</h2>
          </div>
          <div className="space-y-3">
            {companies.slice(0, 5).map((c: any) => {
              const companyAssets = assets.filter(a => a.company?.toLowerCase() === c.name?.toLowerCase()).length;
              const companyMembers = users.filter(u => u.company_name?.toLowerCase() === c.name?.toLowerCase()).length;
              return (
                <div key={c._id} className="flex items-center gap-3">
                  {c.logo ? (
                    <img src={c.logo} alt={c.name} className="w-8 h-8 object-contain rounded-lg border border-slate-300 dark:border-slate-700 bg-[#e5e4e2]" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#fcaf17] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#000000] dark:text-[#e5e4e2] truncate">{c.name}</p>
                    <p className="text-xs text-slate-800">{companyAssets} assets</p>
                  </div>
                </div>
              );
            })}
            {companies.length === 0 && <p className="text-xs text-slate-800 text-center py-4">No companies yet</p>}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700 flex justify-end text-xs">
            <button onClick={() => navigate('/admin/companies')} className="text-[#fcaf17] hover:underline font-medium">Manage →</button>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row: Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Tickets */}
        <motion.div variants={fadeUp} className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Ticket size={16} className="text-[#fcaf17]" />
              <h2 className="font-bold text-[#000000] dark:text-[#e5e4e2] text-sm">Recent Tickets</h2>
            </div>
            <button onClick={() => navigate('/admin/tickets')} className="text-xs text-[#fcaf17] hover:underline font-medium">View all</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {recentTickets.length === 0 && <p className="text-xs text-slate-800 text-center py-8">No tickets yet</p>}
            {recentTickets.map(t => (
              <div key={t._id} className="px-6 py-3 flex items-center gap-3 hover:bg-[#e5e4e2] dark:hover:bg-slate-700/20 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  t.status === 'Open' ? 'bg-amber-400' :
                  t.status === 'In Progress' ? 'bg-blue-500' :
                  t.status === 'Resolved' ? 'bg-emerald-500' : 'bg-slate-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#000000] dark:text-[#e5e4e2] truncate">{t.title}</p>
                  <p className="text-xs text-slate-800">{t.submittedBy?.name || 'Unknown'} · {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  t.priority === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' :
                  t.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  t.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-slate-100 text-slate-800 border-slate-400'
                }`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Members Quick View */}
        <motion.div variants={fadeUp} className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#fcaf17]" />
              <h2 className="font-bold text-[#000000] dark:text-[#e5e4e2] text-sm">Members</h2>
            </div>
            <button onClick={() => navigate('/admin/users')} className="text-xs text-[#fcaf17] hover:underline font-medium">View all</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {users.length === 0 && <p className="text-xs text-slate-800 text-center py-8">No members yet</p>}
            {users.slice(0, 6).map((u: any) => {
              const memberTickets = tickets.filter(t => t.submittedBy?.id === u.id || t.submittedBy === u.id).length;
              const memberAssets = assets.filter(a => a.assignedTo === u.name).length;
              return (
                <div key={u._id}
                  onClick={() => navigate(`/admin/users/${u.id || u._id}`)}
                  className="px-6 py-3 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-[#fcaf17] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#000000] dark:text-[#e5e4e2] group-hover:text-[#fcaf17] dark:group-hover:text-blue-400 transition-colors truncate">{u.name}</p>
                    <p className="text-xs text-slate-800 font-mono">{u.companyId || u.company_id}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-700">{memberAssets} assets</p>
                    <p className="text-xs text-slate-800">{memberTickets} tickets</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-[#fcaf17] transition-colors shrink-0" />
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Asset Categories ── */}
      <motion.div variants={fadeUp} className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl p-6 border border-slate-300 dark:border-slate-700 shadow-md">
        <div className="flex items-center gap-2 mb-5">
          <Package size={18} className="text-[#fcaf17]" />
          <h2 className="font-bold text-[#000000] dark:text-[#e5e4e2] text-sm">Assets by Category</h2>
        </div>
        {topCategories.length === 0 ? (
          <p className="text-xs text-slate-800 text-center py-4">No assets yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {topCategories.map(([cat, count]) => (
              <div key={cat} onClick={() => navigate('/admin/assets')}
                className="bg-[#e5e4e2] dark:bg-[#000000]/50 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border border-slate-300 dark:border-slate-700">
                <p className="text-2xl font-bold text-[#fcaf17] dark:text-blue-400">{count}</p>
                <p className="text-xs text-slate-800 dark:text-slate-400 mt-1 font-medium truncate">{cat}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
