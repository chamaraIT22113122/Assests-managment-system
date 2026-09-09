import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Search, Eye, Trash2, Edit, Clock, User, Filter, ChevronDown, MessageSquare, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];

const STATUS_STYLES: Record<string, string> = {
  'Open': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700',
  'Resolved': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700',
  'Closed': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-600',
};

const PRIORITY_STYLES: Record<string, string> = {
  'Low': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  'Medium': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  'High': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
  'Critical': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

const PRIORITY_DOT: Record<string, string> = {
  'Low': 'bg-slate-400',
  'Medium': 'bg-amber-400',
  'High': 'bg-rose-500',
  'Critical': 'bg-red-600',
};

// ── View / Update Ticket Modal ─────────────────────────────
const TicketModal = ({ ticket, onClose, onSaved, canEdit }: any) => {
  const [status, setStatus] = useState(ticket.status);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingMaint, setSendingMaint] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`http://localhost:5000/api/tickets/${ticket._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, newNote, adminName: 'Admin' }),
      });
      onSaved();
      onClose();
    } catch {
      alert('Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleSendToMaintenance = async () => {
    if (!confirm('Send this ticket to the Maintenance queue?')) return;
    setSendingMaint(true);
    try {
      await fetch('http://localhost:5000/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket._id,
          title: ticket.title,
          description: ticket.description,
          reportedBy: ticket.submittedBy?.name || 'Unknown',
          priority: ticket.priority || 'Medium',
        }),
      });
      onSaved();
      onClose();
      window.location.href = '/admin/maintenance';
    } catch {
      alert('Failed to send to maintenance');
    } finally {
      setSendingMaint(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                #{ticket._id?.slice(-8).toUpperCase()}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES['Medium']}`}>
                {ticket.priority}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{ticket.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitted by <span className="font-semibold">{ticket.submittedBy?.name || 'Unknown'}</span> · {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white mt-1">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Issue Description</h3>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-700">
              {ticket.description}
            </div>
          </div>

          {/* Timeline */}
          {ticket.history?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Timeline</h3>
              <div className="space-y-3">
                {ticket.history.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3 text-sm relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3b5998] mt-1.5 shrink-0 z-10" />
                    {idx !== ticket.history.length - 1 && (
                      <div className="absolute left-[4px] top-4 bottom-[-12px] w-0.5 bg-slate-200 dark:bg-slate-700" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.action} <span className="font-normal text-slate-500">by {item.user}</span>
                        </p>
                        <span className="text-xs text-slate-400 shrink-0 ml-2">{new Date(item.date).toLocaleString()}</span>
                      </div>
                      {item.note && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Update Form */}
        {canEdit && (
          <form onSubmit={handleSave} className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 shrink-0 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Update Ticket</h3>
            <div className="flex gap-3">
              <div className="w-1/3">
                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm">
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Add Note (optional)</label>
                <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)}
                  placeholder="Type a note or update for the employee..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm" />
              </div>
            </div>
            <div className="flex justify-between items-center gap-3 pt-1">
              <button type="button"
                onClick={handleSendToMaintenance}
                disabled={sendingMaint}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors">
                🔧 {sendingMaint ? 'Sending...' : 'Send to Maintenance'}
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-[#3b5998] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Create Ticket Modal (Admin) ─────────────────────────────
const CreateTicketModal = ({ onClose, onSaved }: any) => {
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', status: 'Open' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      onSaved();
      onClose();
    } catch {
      alert('Failed to create ticket');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Create New Ticket</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm"
              placeholder="e.g. Network / Internet - Cannot connect to VPN" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm">
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm">
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
            <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={4} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm resize-none"
              placeholder="Describe the issue in detail..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#3b5998] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main TicketsList Page ──────────────────────────────────
const TicketsList = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);

  const canEdit = user?.name === 'System Administrator' || user?.permissions?.['tickets'] === 'edit';

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/tickets');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (!confirm('Delete this ticket permanently?')) return;
    await fetch(`http://localhost:5000/api/tickets/${id}`, { method: 'DELETE' });
    fetchTickets();
  };

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.submittedBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t._id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  // Stats
  const stats = [
    { label: 'Total', count: tickets.length, color: 'text-slate-700 dark:text-white', bg: 'bg-slate-100 dark:bg-slate-700' },
    { label: 'Open', count: tickets.filter(t => t.status === 'Open').length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    { label: 'In Progress', count: tickets.filter(t => t.status === 'In Progress').length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Resolved', count: tickets.filter(t => t.status === 'Resolved').length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Support Tickets</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and respond to all IT support requests.</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowCreate(true)}
            className="bg-[#3b5998] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
            <Plus size={17} /> Create Ticket
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-slate-100 dark:border-slate-700`}>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:border-[#3b5998] text-sm"
            placeholder="Search by title, member name, or ID..." />
        </div>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm focus:border-[#3b5998]">
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm focus:border-[#3b5998]">
            <option value="All">All Priority</option>
            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket ID</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted By</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare size={32} className="text-slate-300 dark:text-slate-600" />
                      <p className="font-medium">No tickets found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((ticket, idx) => (
                  <tr key={ticket._id}
                    className={`border-b border-slate-50 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-slate-800/30'}`}>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                        #{ticket._id?.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[220px]">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{ticket.title}</p>
                      {ticket.history?.length > 0 && (
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MessageSquare size={10} /> {ticket.history.filter((h:any) => h.action === 'Note Added').length} notes
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#3b5998]/10 text-[#3b5998] dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {(ticket.submittedBy?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                          {ticket.submittedBy?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES['Medium']}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[ticket.priority] || 'bg-amber-400'}`} />
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[ticket.status] || STATUS_STYLES['Open']}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setSelectedTicket(ticket)}
                          title={canEdit ? "View & Update" : "View Details"}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <Eye size={16} />
                        </button>
                        {canEdit && (
                          <button onClick={() => handleDelete(ticket._id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer row count */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
            Showing {filtered.length} of {tickets.length} tickets
          </div>
        )}
      </motion.div>

      {selectedTicket && (
        <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onSaved={fetchTickets} canEdit={canEdit} />
      )}
      {showCreate && (
        <CreateTicketModal onClose={() => setShowCreate(false)} onSaved={fetchTickets} />
      )}
    </div>
  );
};

export default TicketsList;
