import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, Edit, Trash2, X, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', companyId: '', companyName: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const canEdit = user?.name === 'System Administrator' || user?.permissions?.['users'] === 'edit';

  useEffect(() => {
    loadUsers();
    loadCompanies();
  }, []);

  const loadUsers = () => {
    api.users.getAll().then(setUsers);
  };
  
  const loadCompanies = () => {
    api.companies.getAll().then(setCompanies);
  };

  const handleCompanySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCompName = e.target.value;
    const company = companies.find(c => c.name === selectedCompName);
    // Auto generate a company ID for the user if they pick a company
    const generatedId = `COMP-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      ...formData,
      companyName: selectedCompName,
      companyId: formData.companyId || generatedId
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (editingId) {
      await api.users.update(editingId, formData);
    } else {
      await api.users.create({ ...formData, role: 'user' });
    }
    closeModal();
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if(confirm('Are you sure you want to delete this user?')) {
      await api.users.delete(id);
      loadUsers();
    }
  };

  const openModal = (userObj?: any) => {
    if (!canEdit) return;
    if (userObj) {
      setEditingId(userObj._id);
      setFormData({ 
        name: userObj.name, 
        companyId: userObj.companyId || '', 
        companyName: userObj.companyName || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', companyId: '', companyName: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#000000] dark:text-[#e5e4e2]">User Management</h1>
          <p className="text-slate-700 text-sm mt-1">Manage members and assign them to companies. Members log in using their Employee ID only.</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => openModal()}
            className="bg-[#fcaf17] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Member
          </button>
        )}
      </div>

      <div className="bg-[#e5e4e2] dark:bg-[#000000] rounded-xl shadow-md border border-slate-300 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e5e4e2] dark:bg-slate-700/50 border-b border-slate-300 dark:border-slate-700">
                <th className="py-3 px-4 font-semibold text-sm text-slate-800 dark:text-slate-300 whitespace-nowrap">Member Name</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-800 dark:text-slate-300 whitespace-nowrap">Company ID</th>
                <th className="hidden sm:table-cell py-3 px-4 font-semibold text-sm text-slate-800 dark:text-slate-300 whitespace-nowrap">Company</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-800 dark:text-slate-300 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer"
                onClick={() => navigate(`/admin/users/${u.id || u._id}`)}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#fcaf17] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-[#000000] dark:text-[#e5e4e2] group-hover:text-[#fcaf17] dark:group-hover:text-blue-400 transition-colors">{u.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm font-mono text-[#fcaf17] dark:text-blue-400">{u.companyId}</td>
                <td className="hidden sm:table-cell py-3 px-4 text-sm text-slate-700 dark:text-slate-400">{u.companyName || '—'}</td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => navigate(`/admin/users/${u.id || u._id}`)} title="View Profile"
                      className="p-1.5 text-[#fcaf17] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"><Eye size={16} /></button>
                    {canEdit && (
                      <>
                        <button onClick={() => openModal(u)} title="Edit"
                          className="p-1.5 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(u._id)} title="Delete"
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-700 dark:text-slate-400">No members found.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {isModalOpen && canEdit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-300 dark:border-slate-700">
              <h2 className="text-xl font-bold text-[#000000] dark:text-[#e5e4e2]">{editingId ? 'Edit Member' : 'Add Member'}</h2>
              <button onClick={closeModal} className="text-slate-800 hover:text-slate-800 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Member Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-[#fcaf17]" placeholder="e.g. John Doe" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign to Company</label>
                <select 
                  required
                  value={formData.companyName} 
                  onChange={handleCompanySelect}
                  className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-[#fcaf17]"
                >
                  <option value="" disabled>Select a company</option>
                  {companies.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {companies.length === 0 && <p className="text-xs text-red-500 mt-1">Please add a Company in the Companies tab first.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employee / Member ID</label>
                <input required type="text" value={formData.companyId} onChange={(e) => setFormData({...formData, companyId: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-[#fcaf17] font-mono" placeholder="e.g. BIT-10008" />
                <p className="text-xs text-slate-700 mt-1">🔑 Members use this ID to log into the employee portal. No password needed.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-800 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={companies.length === 0} className="px-4 py-2 bg-[#fcaf17] hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                  {editingId ? 'Update Member' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
