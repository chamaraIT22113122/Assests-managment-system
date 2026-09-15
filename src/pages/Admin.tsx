import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2, Shield, Eye, PenSquare, Ban, Crown, Key } from 'lucide-react';
import { motion } from 'framer-motion';

// ── All sections with permissions ──────────────────────────
const SECTIONS = [
  { key: 'dashboard',    label: 'Dashboard',    icon: '📊' },
  { key: 'assets',       label: 'Assets',       icon: '🖥️' },
  { key: 'tickets',      label: 'Tickets',      icon: '🎫' },
  { key: 'maintenance',  label: 'Maintenance',  icon: '🔧' },
  { key: 'companies',    label: 'Companies',    icon: '🏢' },
  { key: 'products',     label: 'Products',     icon: '📦' },
  { key: 'licenses',     label: 'Licenses',     icon: '🔑' },
  { key: 'users',        label: 'Members',      icon: '👥' },
  { key: 'recycle',      label: 'Recycle Bin',  icon: '🗑️' },
  { key: 'notifications',label: 'Notifications',icon: '🔔' },
];

const ACCESS_LEVELS = [
  { value: 'edit', label: 'Full Access', description: 'Can view and edit', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: <PenSquare size={13} /> },
  { value: 'view', label: 'View Only',   description: 'Can view but not edit', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', icon: <Eye size={13} /> },
  { value: 'none', label: 'No Access',   description: 'Hidden from admin', color: 'text-slate-700 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700 border-slate-400 dark:border-slate-600', icon: <Ban size={13} /> },
];

const defaultPermissions = Object.fromEntries(SECTIONS.map(s => [s.key, s.key === 'assets' || s.key === 'tickets' ? 'edit' : 'view']));

// ── Permission Badge ──────────────────────────────────────
const PermBadge = ({ level }: { level: string }) => {
  const al = ACCESS_LEVELS.find(a => a.value === level) || ACCESS_LEVELS[2];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${al.bg} ${al.color}`}>
      {al.icon} {al.label}
    </span>
  );
};

// ── Admin Form Modal ──────────────────────────────────────
const AdminModal = ({ admin, onClose, onSaved }: any) => {
  const isEdit = !!admin;
  const [form, setForm] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    password: '',
    permissions: { ...defaultPermissions, ...(admin?.permissions || {}) },
  });
  const [saving, setSaving] = useState(false);

  const setPermission = (key: string, value: string) =>
    setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `/api/admins/${admin._id}` : '/api/admins';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { onSaved(); onClose(); }
      else alert(data.error || 'Failed to save');
    } catch { alert('Server error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-300 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fcaf17] flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#000000] dark:text-[#e5e4e2]">{isEdit ? 'Edit Admin Account' : 'Create Admin Account'}</h2>
              <p className="text-xs text-slate-700">Set credentials and section-level access permissions</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-800 hover:text-slate-700 dark:hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-400 dark:border-slate-700 rounded-xl dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-[#fcaf17] text-sm"
                  placeholder="e.g. John Silva" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email / Username *</label>
                <input required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-400 dark:border-slate-700 rounded-xl dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-[#fcaf17] text-sm"
                  placeholder="e.g. john@company.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password {isEdit && <span className="text-slate-800 font-normal">(leave blank to keep current)</span>}
              </label>
              <div className="relative">
                <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-800" />
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  required={!isEdit}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-400 dark:border-slate-700 rounded-xl dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-[#fcaf17] text-sm"
                  placeholder={isEdit ? 'Leave blank to keep unchanged' : 'Set a strong password'} />
              </div>
            </div>

            {/* Permissions Grid */}
            <div>
              <h3 className="text-sm font-bold text-[#000000] dark:text-[#e5e4e2] mb-3 flex items-center gap-2">
                <Shield size={15} className="text-[#fcaf17]" /> Section Access Permissions
              </h3>
              <div className="space-y-2 bg-[#e5e4e2] dark:bg-[#000000]/50 rounded-xl p-4 border border-slate-300 dark:border-slate-700">
                {SECTIONS.map(sec => (
                  <div key={sec.key} className="flex flex-col sm:flex-row sm:items-center gap-3 border-b sm:border-0 border-slate-300 dark:border-slate-800 pb-3 sm:pb-0 last:border-0 last:pb-0">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 w-36 shrink-0">
                      {sec.icon} {sec.label}
                    </span>
                    <div className="flex flex-wrap gap-2 sm:flex-1 sm:justify-end">
                      {ACCESS_LEVELS.map(al => (
                        <button key={al.value} type="button"
                          onClick={() => setPermission(sec.key, al.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            form.permissions[sec.key] === al.value
                              ? `${al.bg} ${al.color} ring-2 ring-offset-1 ring-current dark:ring-offset-slate-900`
                              : 'bg-[#e5e4e2] dark:bg-[#000000] text-slate-700 border-slate-400 dark:border-slate-600 hover:border-slate-400'
                          }`}>
                          <span className="flex items-center gap-1">{al.icon} {al.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-300 dark:border-slate-700 flex justify-end gap-3 shrink-0 bg-[#e5e4e2] dark:bg-[#000000]/80">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#fcaf17] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
              {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Admin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────
const DeleteModal = ({ admin, onClose, onDeleted }: any) => {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admins/${admin._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) alert(data.error);
      else { onDeleted(); onClose(); }
    } catch { alert('Server error'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 size={22} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#000000] dark:text-[#e5e4e2]">Delete Admin Account</h2>
            <p className="text-sm text-slate-700">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-5">
          <p className="text-sm text-red-700 dark:text-red-400">
            You are about to permanently delete the admin account for <strong>{admin.name}</strong> ({admin.email}).
            All their permissions will be removed.
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
          </label>
          <input value={confirm} onChange={e => setConfirm(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-400 dark:border-slate-700 rounded-xl dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-red-500 text-sm font-mono"
            placeholder="Type DELETE" />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-medium">Cancel</button>
          <button
            onClick={handleDelete}
            disabled={confirm !== 'DELETE' || deleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
            {deleting ? 'Deleting...' : '🗑️ Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Admin Page ───────────────────────────────────────
const Admin = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState<any>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<any>(null);

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admins');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Deduplicate: keep only one System Administrator
        const seen = new Set<string>();
        const deduped = data.filter(a => {
          const key = a.email + '|' + a.name;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setAdmins(deduped);
      } else setAdmins([]);
    } catch { setAdmins([]); }
    finally { setLoading(false); }
  };

  const openEdit = (admin: any) => { setEditAdmin(admin); setShowModal(true); };
  const openCreate = () => { setEditAdmin(null); setShowModal(true); };

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#000000] dark:text-[#e5e4e2] flex items-center gap-2">
            <Shield size={22} className="text-[#fcaf17]" /> Admin Controls
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-400 mt-1">
            Create admin accounts and manage section-level access permissions across all {SECTIONS.length} modules.
          </p>
        </div>
        <button onClick={openCreate}
          className="bg-[#fcaf17] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors shadow-md">
          <Plus size={17} /> Add Admin
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 p-4 bg-[#e5e4e2] dark:bg-[#000000] rounded-xl border border-slate-300 dark:border-slate-700 items-center">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-400 mr-1">Permission Levels:</span>
        {ACCESS_LEVELS.map(al => (
          <span key={al.value} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${al.bg} ${al.color}`}>
            {al.icon} <span className="font-bold">{al.label}</span> — {al.description}
          </span>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl shadow-md border border-slate-300 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-[#e5e4e2] dark:bg-slate-700/40 border-b border-slate-300 dark:border-slate-700">
                <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-[#e5e4e2] dark:bg-slate-700/40 z-10 min-w-[180px]">Admin</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider min-w-[170px]">Email / Username</th>
                {SECTIONS.map(s => (
                  <th key={s.key} className="py-3 px-2 text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider text-center whitespace-nowrap min-w-[110px]">
                    {s.icon} {s.label}
                  </th>
                ))}
                <th className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider text-right sticky right-0 bg-[#e5e4e2] dark:bg-slate-700/40 z-10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                    {[...Array(SECTIONS.length + 3)].map((_, j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={SECTIONS.length + 3} className="py-12 text-center text-slate-700">
                    No admin accounts found. Create one above.
                  </td>
                </tr>
              ) : admins.map(admin => {
                const isMaster = admin.name === 'System Administrator';
                const perms = { ...defaultPermissions, ...(admin.permissions || {}) };
                return (
                  <tr key={admin._id}
                    className="border-b border-slate-50 dark:border-slate-700/40 hover:bg-[#e5e4e2] dark:hover:bg-slate-700/20 transition-colors">

                    {/* Name */}
                    <td className="py-3 px-4 sticky left-0 bg-[#e5e4e2] dark:bg-[#000000] z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isMaster ? 'bg-amber-400 text-white' : 'bg-[#fcaf17] text-white'}`}>
                          {isMaster ? <Crown size={16} /> : admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#000000] dark:text-[#e5e4e2] leading-tight">{admin.name}</p>
                          {isMaster
                            ? <span className="text-xs text-amber-500 font-bold">👑 Super Admin</span>
                            : <span className="text-xs text-slate-800">Admin</span>}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-sm text-slate-800 dark:text-slate-400">{admin.email || '—'}</td>

                    {/* Permission Cells */}
                    {SECTIONS.map(s => (
                      <td key={s.key} className="py-3 px-2 text-center">
                        {isMaster ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                            <Crown size={10} /> All
                          </span>
                        ) : (
                          <PermBadge level={perms[s.key] || 'none'} />
                        )}
                      </td>
                    ))}

                    {/* Actions */}
                    <td className="py-3 px-4 sticky right-0 bg-[#e5e4e2] dark:bg-[#000000] z-10">
                      <div className="flex justify-end items-center gap-1">
                        <button onClick={() => openEdit(admin)} title="Edit permissions"
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <Edit size={16} />
                        </button>
                        {!isMaster ? (
                          <button onClick={() => setDeleteAdmin(admin)} title="Delete account"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-slate-600" title="System Administrator cannot be deleted">
                            <Shield size={14} />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && admins.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-300 dark:border-slate-700 text-xs text-slate-800 flex items-center justify-between">
            <span>{admins.length} admin account{admins.length !== 1 ? 's' : ''} · {SECTIONS.length} sections managed</span>
            <span className="text-amber-500 flex items-center gap-1"><Crown size={11} /> System Administrator cannot be deleted</span>
          </div>
        )}
      </motion.div>

      {showModal && (
        <AdminModal
          admin={editAdmin}
          onClose={() => { setShowModal(false); setEditAdmin(null); }}
          onSaved={fetchAdmins}
        />
      )}

      {deleteAdmin && (
        <DeleteModal
          admin={deleteAdmin}
          onClose={() => setDeleteAdmin(null)}
          onDeleted={fetchAdmins}
        />
      )}
    </div>
  );
};

export default Admin;
