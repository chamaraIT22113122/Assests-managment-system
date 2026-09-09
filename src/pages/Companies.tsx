import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Companies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', industry: '', contactEmail: '', logo: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const canEdit = user?.name === 'System Administrator' || user?.permissions?.['companies'] === 'edit';

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = () => {
    api.companies.getAll().then(setCompanies);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (editingId) {
      await api.companies.update(editingId, formData);
    } else {
      await api.companies.create(formData);
    }
    closeModal();
    loadCompanies();
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if(confirm('Are you sure you want to delete this company?')) {
      await api.companies.delete(id);
      loadCompanies();
    }
  };

  const openModal = (company?: any) => {
    if (!canEdit) return;
    if (company) {
      setEditingId(company._id);
      setFormData({ name: company.name, industry: company.industry || '', contactEmail: company.contactEmail || '', logo: company.logo || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', industry: '', contactEmail: '', logo: '' });
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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Companies Management</h1>
        {canEdit && (
          <button 
            onClick={() => openModal()}
            className="bg-[#3b5998] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} /> Add Company
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Company Name</th>
              <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Industry</th>
              <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Contact Email</th>
              {canEdit && <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company._id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {company.name}
                </td>
                <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{company.industry}</td>
                <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{company.contactEmail}</td>
                {canEdit && (
                  <td className="py-3 px-4 text-sm flex justify-end gap-2">
                    <button onClick={() => openModal(company)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(company._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 size={16} /></button>
                  </td>
                )}
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 4 : 3} className="py-8 text-center text-slate-500 dark:text-slate-400">No companies found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && canEdit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingId ? 'Edit Company' : 'Add Company'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              
              <div className="flex items-center gap-4 mb-4">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs text-center p-2 border border-dashed border-slate-300 dark:border-slate-600">
                    No Logo
                  </div>
                )}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Logo</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400 cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Industry</label>
                <input type="text" value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
                <input type="email" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white outline-none focus:border-[#3b5998]" />
              </div>
              <div className="pt-4 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#3b5998] hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
