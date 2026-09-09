import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Monitor, Ticket, Building2, Clock,
  CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Package
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  'Open': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Closed': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400',
};

const PRIORITY_COLORS: Record<string, string> = {
  'Low': 'bg-slate-100 text-slate-600 border-slate-200',
  'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
  'High': 'bg-rose-50 text-rose-700 border-rose-200',
  'Critical': 'bg-red-100 text-red-700 border-red-200',
};

const CONDITION_COLORS: Record<string, string> = {
  'Brand New': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Reconditioned': 'bg-blue-100 text-blue-700 border-blue-200',
  'Good Condition': 'bg-teal-100 text-teal-700 border-teal-200',
  'Fair Condition': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Needs Repair': 'bg-orange-100 text-orange-700 border-orange-200',
  'Not Functional': 'bg-red-100 text-red-700 border-red-200',
  'Need Replacement': 'bg-red-200 text-red-800 border-red-300',
  'Under Maintenance': 'bg-purple-100 text-purple-700 border-purple-200',
  'Retired': 'bg-slate-100 text-slate-600 border-slate-200',
};

const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usersRes, assetsRes, ticketsRes] = await Promise.all([
          fetch('/api/users').then(r => r.json()),
          fetch('/api/assets').then(r => r.json()),
          fetch('/api/tickets').then(r => r.json()),
        ]);

        const users = Array.isArray(usersRes) ? usersRes : [];
        const allAssets = Array.isArray(assetsRes) ? assetsRes : [];
        const allTickets = Array.isArray(ticketsRes) ? ticketsRes : [];

        const found = users.find((u: any) => u.id === id || u._id === id);
        setMember(found);
        setAllUsers(users);

        if (found) {
          // Assets assigned to this member by name
          const memberAssets = allAssets.filter((a: any) =>
            a.assignedTo && a.assignedTo.toLowerCase() === found.name?.toLowerCase()
          );
          setAssets(memberAssets);

          // Tickets submitted by this member
          const memberTickets = allTickets.filter((t: any) =>
            t.submittedBy?.id === found.id ||
            t.submittedBy === found.id ||
            t.submittedBy?.name?.toLowerCase() === found.name?.toLowerCase()
          );
          setTickets(memberTickets);
        }
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-8 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-500">Member not found.</p>
        <button onClick={() => navigate('/admin/users')} className="mt-4 text-[#3b5998] hover:underline text-sm">← Back to Members</button>
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="py-8 space-y-6">

      {/* Back */}
      <button onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#3b5998] dark:hover:text-blue-400 transition-colors font-medium">
        <ArrowLeft size={16} /> Back to Members
      </button>

      {/* ── Profile Header ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3b5998] to-blue-400 flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {member.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{member.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-[#3b5998] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg text-xs border border-blue-100 dark:border-blue-800">
                  {member.companyId || member.company_id}
                </span>
              </span>
              {member.email && (
                <span className="text-sm text-slate-500 dark:text-slate-400">{member.email}</span>
              )}
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-4 text-center shrink-0">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{assets.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assets</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{openTickets}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Open</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resolvedTickets}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Assigned Assets ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <Monitor size={17} className="text-[#3b5998]" />
          <h2 className="font-bold text-slate-800 dark:text-white">Assigned Assets ({assets.length})</h2>
        </div>
        {assets.length === 0 ? (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">No assets assigned to this member yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Asset</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Code</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Condition</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Serial</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, i) => (
                  <tr key={asset._id} className={`border-b border-slate-50 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-800/20' : ''}`}>
                    <td className="px-5 py-3 font-semibold text-sm text-slate-800 dark:text-white">{asset.name}</td>
                    <td className="px-5 py-3 text-xs font-mono text-[#3b5998] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-fit">{asset.assetCode}</td>
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{asset.category}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CONDITION_COLORS[asset.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">{asset.location || '—'}</td>
                    <td className="px-5 py-3 text-xs font-mono text-slate-500">{asset.serialNumber || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Tickets ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <Ticket size={17} className="text-[#3b5998]" />
          <h2 className="font-bold text-slate-800 dark:text-white">Support Tickets ({tickets.length})</h2>
        </div>
        {tickets.length === 0 ? (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">No tickets raised by this member yet.</div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {tickets.map(ticket => (
              <div key={ticket._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <div
                  className="px-5 py-4 flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedTicket(expandedTicket === ticket._id ? null : ticket._id)}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    ticket.status === 'Open' ? 'bg-amber-400' :
                    ticket.status === 'In Progress' ? 'bg-blue-500' :
                    ticket.status === 'Resolved' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{ticket.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={11} className="text-slate-400" />
                      <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS['Medium']}`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[ticket.status] || STATUS_COLORS['Open']}`}>
                      {ticket.status}
                    </span>
                    {expandedTicket === ticket._id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedTicket === ticket._id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="px-5 pb-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mt-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {ticket.description}
                    </div>
                    {ticket.history?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Timeline</p>
                        <div className="space-y-2">
                          {ticket.history.map((h: any, i: number) => (
                            <div key={i} className="flex gap-2 text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#3b5998] mt-1.5 shrink-0" />
                              <div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{h.action}</span>
                                <span className="text-slate-400"> by {h.user}</span>
                                {h.note && <p className="text-slate-500 mt-0.5">{h.note}</p>}
                                <p className="text-slate-400">{new Date(h.date).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MemberProfile;
