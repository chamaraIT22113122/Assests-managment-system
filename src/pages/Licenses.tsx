import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit, Trash2, X, Key, Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Licenses = () => {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', key: '', seats: 1, renewalDate: '', company: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const canEdit = user?.role === 'admin' || user?.permissions?.['assets'] === 'edit';

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = () => {
    api.licenses.getAll().then(setLicenses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (editingId) {
      await api.licenses.update(editingId, formData);
    } else {
      await api.licenses.create(formData);
    }
    closeModal();
    loadLicenses();
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if(confirm('Are you sure you want to delete this license?')) {
      await api.licenses.delete(id);
      loadLicenses();
    }
  };

  const openModal = (license?: any) => {
    if (!canEdit) return;
    if (license) {
      setEditingId(license._id);
      setFormData({ 
        name: license.name, 
        key: license.key || '', 
        seats: license.seats || 1, 
        renewalDate: license.renewal_date ? new Date(license.renewal_date).toISOString().split('T')[0] : '',
        company: license.company || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', key: '', seats: 1, renewalDate: '', company: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const isExpiringSoon = (dateString: string) => {
    if (!dateString) return false;
    const renewal = new Date(dateString);
    const now = new Date();
    const daysLeft = (renewal.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return daysLeft <= 30 && daysLeft >= 0;
  };

  const isExpired = (dateString: string) => {
    if (!dateString) return false;
    const renewal = new Date(dateString);
    const now = new Date();
    return renewal.getTime() < now.getTime();
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Software Licenses</h1>
        {canEdit && (
          <button 
            onClick={() => openModal()}
            className="bg-[#3b5998] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} /> Add License
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Software Name</th>
              <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300">License Key</th>
              <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Seats</th>
              <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Company</th>
              <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Renewal Date</th>
              {canEdit && <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => (
              <tr key={license._id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {license.name}
                </td>
                <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                  {license.key ? (
                    <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs flex items-center gap-1 w-max">
                      <Key size={12} /> {license.key.length > 20 ? license.key.substring(0, 20) + '...' : license.key}
                    </span>
                  ) : '-'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{license.seats}</td>
                <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{license.company || '-'}</td>
                <td className="py-3 px-4 text-sm">
                  {license.renewal_date ? (
                    <span className={`flex items-center gap-1.5 w-max px-2.5 py-1 rounded-md text-xs font-semibold ${
                      isExpired(license.renewal_date) 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : isExpiringSoon(license.renewal_date)
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {(isExpired(license.renewal_date) || isExpiringSoon(license.renewal_date)) && <AlertTriangle size={14} />}
                      {new Date(license.renewal_date).toLocaleDateString()}
                    </span>
                  ) : '-'}
                </td>
                {canEdit && (
                  <td className="py-3 px-4 text-sm flex justify-end gap-2">
                    <button onClick={() => openModal(license)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(license._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 size={16} /></button>
                  </td>
                )}
              </tr>
            ))}
            {licenses.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 6 : 5} className="py-8 text-center text-slate-500 dark:text-slate-400">No licenses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && canEdit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingId ? 'Edit License' : 'Add License'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Software Name</label>
                <input 
                  type="text" required 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998]"
                  placeholder="e.g. Adobe Creative Cloud"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Key</label>
                <input 
                  type="text" 
                  value={formData.key} onChange={(e) => setFormData({...formData, key: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white font-mono outline-none focus:border-[#3b5998]"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Seats</label>
                  <input 
                    type="number" min="1" required
                    value={formData.seats} onChange={(e) => setFormData({...formData, seats: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Renewal Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                      type="date"
                      value={formData.renewalDate} onChange={(e) => setFormData({...formData, renewalDate: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998]"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company (Optional)</label>
                <input 
                  type="text" 
                  value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998]"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#3b5998] hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                  {editingId ? 'Save Changes' : 'Add License'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Licenses;
