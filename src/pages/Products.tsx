import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ICONS_LIST = [
  'Monitor',
  'Printer',
  'Laptop',
  'Router',
  'Network',
  'Shield',
  'Cpu',
  'Smartphone',
  'Tablet',
  'Server',
  'Database',
  'HardDrive',
  'Headphones'
];

const Products = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: 'Box' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const canEdit = user?.name === 'System Administrator' || user?.permissions?.['products'] === 'edit';

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    api.products.getAll().then(setCategories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (editingId) {
      await api.products.update(editingId, formData);
    } else {
      await api.products.create(formData);
    }
    closeModal();
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if(confirm('Are you sure you want to delete this category? This will affect assets assigned to it.')) {
      await api.products.delete(id);
      loadCategories();
    }
  };

  const openModal = (category?: any) => {
    if (!canEdit) return;
    if (category) {
      setEditingId(category._id);
      setFormData({ name: category.name, icon: category.icon || 'Box' });
    } else {
      setEditingId(null);
      setFormData({ name: '', icon: 'Monitor' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const renderIcon = (iconName: string) => {
    // @ts-ignore
    const IconComponent = LucideIcons[iconName] || LucideIcons.Box;
    return <IconComponent size={20} className="text-[#fcaf17] dark:text-blue-400" />;
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#000000] dark:text-[#e5e4e2]">Asset Categories</h1>
          <p className="text-slate-700 text-sm mt-1">Manage the categories that appear on the Asset Dashboard.</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => openModal()}
            className="bg-[#fcaf17] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Category
          </button>
        )}
      </div>

      <div className="bg-[#e5e4e2] dark:bg-[#000000] rounded-xl shadow-md border border-slate-300 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e5e4e2] dark:bg-slate-700/50 border-b border-slate-300 dark:border-slate-700">
                <th className="py-3 px-4 font-semibold text-sm text-slate-800 dark:text-slate-300 w-16">Icon</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-800 dark:text-slate-300 whitespace-nowrap">Category Name</th>
                {canEdit && <th className="py-3 px-4 font-semibold text-sm text-slate-800 dark:text-slate-300 text-right whitespace-nowrap">Actions</th>}
              </tr>
            </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-[#e5e4e2] dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    {renderIcon(category.icon)}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm font-medium text-[#000000] dark:text-[#e5e4e2]">{category.name}</td>
                {canEdit && (
                  <td className="py-3 px-4 text-sm flex justify-end gap-2 items-center h-16">
                    <button onClick={() => openModal(category)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(category._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 size={16} /></button>
                  </td>
                )}
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 3 : 2} className="py-8 text-center text-slate-700 dark:text-slate-400">No categories found.</td>
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
              <h2 className="text-xl font-bold text-[#000000] dark:text-[#e5e4e2]">{editingId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={closeModal} className="text-slate-800 hover:text-slate-800 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-[#fcaf17]" placeholder="e.g. Desktop" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Icon</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {ICONS_LIST.map(iconName => {
                    // @ts-ignore
                    const IconComp = LucideIcons[iconName] || LucideIcons.Box;
                    const isSelected = formData.icon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormData({...formData, icon: iconName})}
                        className={`p-3 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-[#fcaf17] text-white shadow-md scale-105' : 'bg-[#e5e4e2] dark:bg-slate-700 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                      >
                        <IconComp size={20} />
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-800 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#fcaf17] hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
