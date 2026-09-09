import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, MessageSquare, Clock, X, Monitor, Wifi, Lock, HelpCircle, Package, Printer, AlertTriangle, ChevronDown, Wrench, CheckCircle } from 'lucide-react';

const IT_CATEGORIES = [
  { label: 'Hardware Issue', icon: Monitor, color: 'text-blue-500', description: 'Computer, laptop, printer, keyboard, mouse not working' },
  { label: 'Software / Application', icon: Package, color: 'text-purple-500', description: 'App crashes, software not opening, license errors' },
  { label: 'Network / Internet', icon: Wifi, color: 'text-emerald-500', description: 'No internet, slow connection, VPN, Wi-Fi issues' },
  { label: 'Access & Permissions', icon: Lock, color: 'text-amber-500', description: 'Cannot login, locked out, need folder or system access' },
  { label: 'Printer / Scanner', icon: Printer, color: 'text-rose-500', description: 'Printer offline, paper jam, scan not working' },
  { label: 'Email / Communication', icon: MessageSquare, color: 'text-cyan-500', description: 'Email not receiving, Teams/Zoom issues' },
  { label: 'Security / Virus', icon: AlertTriangle, color: 'text-red-500', description: 'Suspicious activity, malware, phishing email' },
  { label: 'Other / General', icon: HelpCircle, color: 'text-slate-500', description: 'Anything else not listed above' },
];

const STATUS_COLORS: Record<string, string> = {
  'Open': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
  'Resolved': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
  'Closed': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  'Low': 'bg-slate-100 text-slate-600 border-slate-200',
  'Medium': 'bg-amber-50 text-amber-600 border-amber-200',
  'High': 'bg-rose-50 text-rose-600 border-rose-200',
  'Critical': 'bg-red-100 text-red-700 border-red-200',
};

const MAINT_STAGES = ['Received', 'Diagnosing', 'In Repair', 'Testing', 'Completed'];
const STAGE_ICONS: Record<string, string> = {
  Received: '📥', Diagnosing: '🔍', 'In Repair': '🔧', Testing: '🧪', Completed: '✅'
};

// ── Maintenance Progress Block ────────────────────────────
const MaintenanceProgress = ({ ticketId }: { ticketId: string }) => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/maintenance/by-ticket/${ticketId}`)
      .then(r => r.json())
      .then(d => { setJob(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ticketId]);

  if (loading) return <div className="mt-3 h-10 animate-pulse bg-slate-100 dark:bg-slate-700 rounded-xl" />;
  if (!job) return null;

  const stageIdx = MAINT_STAGES.indexOf(job.stage);
  const pct = Math.round(((stageIdx + 1) / MAINT_STAGES.length) * 100);
  const isComplete = job.stage === 'Completed';

  return (
    <div className={`mt-4 rounded-xl border p-4 ${isComplete ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/40'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Wrench size={15} className={isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'} />
        <span className={`text-xs font-bold uppercase tracking-wider ${isComplete ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400'}`}>
          🔧 Maintenance in Progress
        </span>
        {isComplete && <CheckCircle size={14} className="text-emerald-500 ml-auto" />}
      </div>

      {/* Stage pills */}
      <div className="flex items-center gap-1 flex-wrap mb-3">
        {MAINT_STAGES.map((s, i) => (
          <React.Fragment key={s}>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${
              i < stageIdx ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
              i === stageIdx ? (isComplete ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-blue-500 text-white border-blue-500') :
              'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              {STAGE_ICONS[s]} {s}
            </span>
            {i < MAINT_STAGES.length - 1 && <span className="text-slate-300 dark:text-slate-600 text-xs">›</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-xs font-bold w-10 text-right ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>{pct}%</span>
      </div>

      {/* Technician & latest note */}
      {(job.assigned_to || job.notes?.length > 0) && (
        <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800/40 space-y-1">
          {job.assigned_to && (
            <p className="text-xs text-slate-600 dark:text-slate-400">👷 Assigned to: <strong>{job.assigned_to}</strong></p>
          )}
          {job.notes?.length > 0 && (
            <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/60 rounded-lg px-3 py-2 mt-1 border border-slate-100 dark:border-slate-700">
              <span className="font-semibold">Latest update:</span> {job.notes[job.notes.length - 1]?.text}
              <span className="text-slate-400 ml-1">— {job.notes[job.notes.length - 1]?.by}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Raise Ticket Modal ────────────────────────────────────
const RaiseTicketModal = ({ onClose, onSubmitted, user }: any) => {
  const [step, setStep] = useState(1);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: '', title: '', priority: 'Medium',
    assetId: '', assetName: '', location: '', description: '',
    stepsToReproduce: '', urgencyReason: '',
  });

  useEffect(() => {
    fetch('/api/assets').then(r => r.json()).then(d => setAssets(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const handleCategorySelect = (cat: string) => { setForm({ ...form, category: cat, title: cat + ' - ' }); setStep(2); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fullDescription = [
      `**Category:** ${form.category}`,
      `**Related Asset:** ${form.assetName || 'N/A'}`,
      `**Location:** ${form.location || 'N/A'}`,
      ``, `**Issue Description:**`, form.description,
      form.stepsToReproduce ? `\n**Steps / How it happened:**\n${form.stepsToReproduce}` : '',
      form.urgencyReason ? `\n**Urgency Reason:**\n${form.urgencyReason}` : '',
    ].filter(Boolean).join('\n');
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, description: fullDescription, priority: form.priority, submittedBy: user?.id }),
      });
      const data = await res.json();
      if (data.success) { onSubmitted(); onClose(); }
      else alert(data.error || 'Failed to submit');
    } catch { alert('Error connecting to server'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{step === 1 ? 'What do you need help with?' : 'Raise IT Support Ticket'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{step === 1 ? 'Select the type of IT issue you are facing.' : `Category: ${form.category}`}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {IT_CATEGORIES.map(cat => (
                <button key={cat.label} onClick={() => handleCategorySelect(cat.label)}
                  className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#3b5998] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group">
                  <div className={`mt-0.5 ${cat.color}`}><cat.icon size={22} /></div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-[#3b5998] dark:group-hover:text-blue-400 transition-colors">{cat.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{cat.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <form id="ticket-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Issue Title <span className="text-red-500">*</span></label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998]"
                  placeholder="e.g. Hardware Issue - Laptop screen flickering" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Priority <span className="text-red-500">*</span></label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998]">
                    <option value="Low">🟢 Low</option><option value="Medium">🟡 Medium</option>
                    <option value="High">🔴 High</option><option value="Critical">🚨 Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Related Asset / Device</label>
                  <select value={form.assetId} onChange={e => { const s = assets.find(a => a._id === e.target.value); setForm({...form, assetId: e.target.value, assetName: s ? `${s.name} (${s.assetCode})` : ''}); }}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998]">
                    <option value="">— Select device —</option>
                    {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetCode})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Your Location</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998]"
                  placeholder="e.g. Finance Dept, 2nd Floor" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Describe the Issue <span className="text-red-500">*</span></label>
                <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] resize-none"
                  placeholder="Describe the problem in detail..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">How did it happen? <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea value={form.stepsToReproduce} onChange={e => setForm({...form, stepsToReproduce: e.target.value})} rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] resize-none"
                  placeholder="e.g. Started after Windows update..." />
              </div>
              {(form.priority === 'High' || form.priority === 'Critical') && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-red-700 dark:text-red-400 mb-1.5">Why is this urgent? <span className="text-red-500">*</span></label>
                  <textarea required value={form.urgencyReason} onChange={e => setForm({...form, urgencyReason: e.target.value})} rows={2}
                    className="w-full px-4 py-2.5 border border-red-200 rounded-xl bg-white dark:bg-slate-900 dark:text-white outline-none resize-none" />
                </div>
              )}
            </form>
          )}
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 shrink-0 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
          <button type="button" onClick={step === 1 ? onClose : () => setStep(1)}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step === 2 && (
            <button type="submit" form="ticket-form" disabled={loading}
              className="px-6 py-2.5 bg-[#3b5998] hover:bg-blue-700 disabled:opacity-70 text-white font-semibold rounded-xl transition-colors">
              {loading ? 'Submitting...' : '📨 Submit Ticket'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main MyTickets Page ───────────────────────────────────
const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/my/${user?.id}`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch { setTickets([]); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { if (user?.id) fetchTickets(); }, [fetchTickets, user?.id]);

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Tickets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track the status of your IT support requests.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-[#3b5998] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={18} /> Raise Ticket
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4">{[1,2,3].map(i => <div key={i} className="animate-pulse h-20 bg-slate-100 dark:bg-slate-700 rounded-xl" />)}</div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-5">
              <MessageSquare className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No tickets yet</h3>
            <p className="text-slate-500 max-w-sm mb-6">Having an IT issue? Raise a ticket and our IT team will get back to you.</p>
            <button onClick={() => setShowModal(true)} className="bg-[#3b5998] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              + Raise My First Ticket
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {tickets.map(ticket => (
              <div key={ticket._id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === ticket._id ? null : ticket._id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        #{ticket._id?.slice(-8).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS['Medium']}`}>
                        {ticket.priority}
                      </span>
                      {/* Show "In Maintenance" badge when status is In Progress */}
                      {ticket.status === 'In Progress' && (
                        <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded flex items-center gap-1">
                          🔧 In Maintenance
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white truncate">{ticket.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${STATUS_COLORS[ticket.status] || STATUS_COLORS['Open']}`}>
                      {ticket.status}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedId === ticket._id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedId === ticket._id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {ticket.description}
                    </div>

                    {/* 🔧 Maintenance progress — shown if ticket has a linked maintenance job */}
                    <MaintenanceProgress ticketId={ticket._id} />

                    {ticket.history?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Timeline</h4>
                        <div className="space-y-3">
                          {ticket.history.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3 text-sm relative">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#3b5998] mt-1 shrink-0 z-10" />
                              {idx !== ticket.history.length - 1 && (
                                <div className="absolute left-[4px] top-3 bottom-[-12px] w-0.5 bg-slate-200 dark:bg-slate-700" />
                              )}
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                  {item.action} <span className="font-normal text-slate-500">by {item.user}</span>
                                </p>
                                {item.note && <p className="text-slate-600 dark:text-slate-400 mt-0.5">{item.note}</p>}
                                <span className="text-xs text-slate-400">{new Date(item.date).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <RaiseTicketModal user={user} onClose={() => setShowModal(false)} onSubmitted={fetchTickets} />}
    </div>
  );
};

export default MyTickets;

