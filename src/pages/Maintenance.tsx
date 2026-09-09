import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Wrench, ChevronRight, Trash2, MessageSquare, Clock, User, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Workflow Stages ───────────────────────────────────────
const STAGES = [
  { key: 'Received',     label: 'Received',       icon: '📥', color: 'bg-slate-500',  light: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300' },
  { key: 'Diagnosing',   label: 'Diagnosing',      icon: '🔍', color: 'bg-blue-500',   light: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
  { key: 'In Repair',    label: 'In Repair',       icon: '🔧', color: 'bg-amber-500',  light: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' },
  { key: 'Testing',      label: 'Testing',         icon: '🧪', color: 'bg-purple-500', light: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
  { key: 'Completed',    label: 'Completed',       icon: '✅', color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' },
];

const PRIORITY_STYLES: Record<string, string> = {
  'Low': 'bg-slate-100 text-slate-600 border-slate-200',
  'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
  'High': 'bg-rose-50 text-rose-700 border-rose-200',
  'Critical': 'bg-red-100 text-red-700 border-red-200',
};

// ── Progress Bar ──────────────────────────────────────────
const ProgressBar = ({ stage }: { stage: string }) => {
  const idx = STAGES.findIndex(s => s.key === stage);
  const pct = Math.round(((idx + 1) / STAGES.length) * 100);
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-[#3b5998] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  );
};

// ── Stage Stepper ─────────────────────────────────────────
const StageStepper = ({ current, onChange }: { current: string, onChange: (s: string) => void }) => {
  const idx = STAGES.findIndex(s => s.key === current);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STAGES.map((s, i) => (
        <React.Fragment key={s.key}>
          <button
            onClick={() => onChange(s.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              i === idx ? `${s.light} ring-2 ring-offset-1 ring-current` :
              i < idx ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 opacity-70' :
              'bg-white dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-400'
            }`}
          >
            {s.icon} {s.label}
          </button>
          {i < STAGES.length - 1 && <ChevronRight size={12} className="text-slate-300 dark:text-slate-600 shrink-0" />}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Job Detail Modal ──────────────────────────────────────
const JobModal = ({ job, onClose, onSaved, canEdit }: any) => {
  const [stage, setStage] = useState(job.stage || 'Received');
  const [assignedTo, setAssignedTo] = useState(job.assigned_to || '');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const status = stage === 'Completed' ? 'Completed' : stage === 'Received' ? 'Pending' : 'In Progress';
    await fetch(`/api/maintenance/${job._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, status, assignedTo, note: note || undefined }),
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[job.priority] || PRIORITY_STYLES['Medium']}`}>
                {job.priority}
              </span>
              {job.ticket_id && (
                <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-semibold">
                  🎫 From Ticket
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{job.title}</h2>
            {job.asset_name && (
              <p className="text-sm text-slate-500 mt-0.5">🖥️ {job.asset_name} {job.asset_code && `(${job.asset_code})`}</p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Description */}
          {job.description && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Issue Description</h3>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-700">
                {job.description}
              </div>
            </div>
          )}

          {/* Progress Stepper */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Processing Stage</h3>
            {canEdit ? (
              <StageStepper current={stage} onChange={setStage} />
            ) : (
              <StageStepper current={stage} onChange={() => {}} />
            )}
            <ProgressBar stage={stage} />
          </div>

          {/* Assigned Technician */}
          {canEdit ? (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Assigned Technician</label>
              <input value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm"
                placeholder="Enter technician name..." />
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Assigned Technician</label>
              <div className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-slate-300 text-sm">
                {assignedTo || 'Unassigned'}
              </div>
            </div>
          )}

          {/* Notes Log */}
          {job.notes?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Progress Notes</h3>
              <div className="space-y-2">
                {job.notes.map((n: any, i: number) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-[#3b5998] mt-1.5 shrink-0" />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-700">
                      <p className="text-slate-700 dark:text-slate-300">{n.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{n.by} · {new Date(n.date).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Note */}
          {canEdit && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Add Progress Note</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm resize-none"
                placeholder="e.g. Replaced faulty RAM module. Testing now..." />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 shrink-0 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors">Close</button>
          {canEdit && (
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 bg-[#3b5998] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Update'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Create Job Modal ──────────────────────────────────────
const CreateJobModal = ({ onClose, onSaved }: any) => {
  const [form, setForm] = useState({ title: '', description: '', assetName: '', assetCode: '', assignedTo: '', priority: 'Medium' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">🔧 Create Maintenance Job</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Job Title *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm"
              placeholder="e.g. Replace broken laptop screen" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Asset Name</label>
              <input value={form.assetName} onChange={e => setForm({...form, assetName: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm"
                placeholder="e.g. Dell Latitude" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Asset Code</label>
              <input value={form.assetCode} onChange={e => setForm({...form, assetCode: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm font-mono"
                placeholder="e.g. AST-1001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm">
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Assigned To</label>
              <input value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm"
                placeholder="Technician name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998] text-sm resize-none"
              placeholder="Describe the maintenance work needed..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#3b5998] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Maintenance Page ─────────────────────────────────
const Maintenance = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('All');

  const canEdit = user?.name === 'System Administrator' || user?.permissions?.['maintenance'] === 'edit';

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/maintenance');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch { setJobs([]); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (!confirm('Delete this maintenance job?')) return;
    await fetch(`/api/maintenance/${id}`, { method: 'DELETE' });
    fetchJobs();
  };

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !search || j.title?.toLowerCase().includes(q) || j.asset_name?.toLowerCase().includes(q) || j.asset_code?.toLowerCase().includes(q);
    const matchStage = filterStage === 'All' || j.stage === filterStage;
    return matchSearch && matchStage;
  });

  // Stats per stage
  const stageCounts = STAGES.map(s => ({ ...s, count: jobs.filter(j => j.stage === s.key).length }));

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Wrench size={24} className="text-[#3b5998]" /> Maintenance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track and manage all IT hardware maintenance jobs.</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowCreate(true)}
            className="bg-[#3b5998] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={17} /> New Job
          </button>
        )}
      </div>

      {/* Stage Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stageCounts.map(s => (
          <button key={s.key}
            onClick={() => setFilterStage(filterStage === s.key ? 'All' : s.key)}
            className={`rounded-xl p-4 border text-left transition-all ${filterStage === s.key ? `${s.light} ring-2 ring-current` : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300'}`}>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.count}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{s.icon} {s.label}</p>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:border-[#3b5998] text-sm"
            placeholder="Search by title, asset name or code..." />
        </div>
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm focus:border-[#3b5998]">
          <option value="All">All Stages</option>
          {STAGES.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
        </select>
      </div>

      {/* Pipeline / Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Wrench size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="font-semibold text-slate-500">No maintenance jobs found</p>
            <p className="text-sm text-slate-400 mt-1">Create a new job or escalate from a support ticket.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {filtered.map(job => {
              const stageObj = STAGES.find(s => s.key === job.stage) || STAGES[0];
              const stageIdx = STAGES.findIndex(s => s.key === job.stage);
              const pct = Math.round(((stageIdx + 1) / STAGES.length) * 100);
              return (
                <motion.div key={job._id} layout
                  className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors cursor-pointer group"
                  onClick={() => setSelectedJob(job)}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Left info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-[#3b5998] transition-colors">{job.title}</h3>
                        {job.ticket_id && (
                          <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded font-bold">TICKET</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        {job.asset_name && <span className="flex items-center gap-1">🖥️ {job.asset_name} {job.asset_code && `· ${job.asset_code}`}</span>}
                        {job.assigned_to && <span className="flex items-center gap-1"><User size={11} /> {job.assigned_to}</span>}
                        <span className="flex items-center gap-1"><Clock size={11} /> {new Date(job.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                        {job.notes?.length > 0 && <span className="flex items-center gap-1"><MessageSquare size={11} /> {job.notes.length}</span>}
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2 mt-2 max-w-xs">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${stageObj.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stageObj.light}`}>{stageObj.icon} {job.stage}</span>
                      </div>
                    </div>

                    {/* Right: Priority + Actions */}
                    <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[job.priority] || PRIORITY_STYLES['Medium']}`}>
                        {job.priority}
                      </span>
                      {/* Quick stage advance */}
                      {canEdit && stageIdx < STAGES.length - 1 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const next = STAGES[stageIdx + 1];
                            await fetch(`/api/maintenance/${job._id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ stage: next.key, status: next.key === 'Completed' ? 'Completed' : 'In Progress' }),
                            });
                            fetchJobs();
                          }}
                          title={`Advance to ${STAGES[stageIdx + 1]?.label}`}
                          className="px-2.5 py-1 bg-[#3b5998] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
                          → {STAGES[stageIdx + 1]?.label}
                        </button>
                      )}
                      {stageIdx === STAGES.length - 1 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle size={14} /> Done
                        </span>
                      )}
                      {canEdit && (
                        <button onClick={() => handleDelete(job._id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400">
            {filtered.length} job{filtered.length !== 1 ? 's' : ''} · Click any row to update stage & add notes
          </div>
        )}
      </div>

      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} onSaved={fetchJobs} canEdit={canEdit} />}
      {showCreate && <CreateJobModal onClose={() => setShowCreate(false)} onSaved={fetchJobs} />}
    </div>
  );
};

export default Maintenance;
