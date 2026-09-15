import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RefreshCw, Trash2, Box, Ticket, Building, Package, Users, Key, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RecycleBin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const canManage = user?.role === 'admin';

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await api.recycleBin.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load recycle bin', err);
    }
    setLoading(false);
  };

  const handleRestore = async (item: any) => {
    if (!canManage) return;
    await api.recycleBin.restore(item.tableName, item.id);
    loadItems();
  };

  const handlePermanentDelete = async (item: any) => {
    if (!canManage) return;
    if (confirm(`Permanently delete this ${item.type}? This cannot be undone.`)) {
      await api.recycleBin.permanentDelete(item.tableName, item.id);
      loadItems();
    }
  };

  const typeIcon = (type: string) => {
    const cls = 'shrink-0';
    switch (type) {
      case 'Asset': return <Box size={15} className={`${cls} text-blue-500`} />;
      case 'Ticket': return <Ticket size={15} className={`${cls} text-amber-500`} />;
      case 'Company': return <Building size={15} className={`${cls} text-indigo-500`} />;
      case 'Product Category': return <Package size={15} className={`${cls} text-emerald-500`} />;
      case 'User': return <Users size={15} className={`${cls} text-purple-500`} />;
      case 'License': return <Key size={15} className={`${cls} text-pink-500`} />;
      case 'Maintenance': return <Wrench size={15} className={`${cls} text-cyan-500`} />;
      default: return <Box size={15} className={`${cls} text-slate-800`} />;
    }
  };

  if (!canManage) {
    return (
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-6 text-[#000000] dark:text-[#e5e4e2]">Recycle Bin</h1>
        <div className="bg-[#e5e4e2] dark:bg-[#000000] p-12 rounded-xl shadow-md text-center border border-slate-300 dark:border-slate-700">
          <Trash2 size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Access Denied</h2>
          <p className="text-slate-700 dark:text-slate-400 mt-2">Only administrators can access the Recycle Bin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#000000] dark:text-[#e5e4e2] flex items-center gap-2">
            <Trash2 size={24} className="text-slate-800" /> Recycle Bin
          </h1>
          <p className="text-slate-700 text-sm mt-1">
            {items.length} deleted {items.length === 1 ? 'item' : 'items'} — restore or permanently remove them.
          </p>
        </div>
      </div>

      <div className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl shadow-md border border-slate-300 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e5e4e2] dark:bg-slate-700/50 border-b border-slate-300 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-400">
                <th className="py-3 px-5 font-medium whitespace-nowrap">Type</th>
                <th className="py-3 px-5 font-medium whitespace-nowrap">Name / Identifier</th>
                <th className="hidden sm:table-cell py-3 px-5 font-medium whitespace-nowrap">Deleted On</th>
                <th className="py-3 px-5 font-medium text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-800">Loading deleted items...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <Trash2 size={40} className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
                  <p className="text-slate-700 dark:text-slate-400 font-medium">The recycle bin is empty</p>
                  <p className="text-slate-800 dark:text-slate-500 text-sm mt-1">Deleted items from the system will appear here.</p>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={`${item.tableName}-${item.id}`} className="hover:bg-[#e5e4e2] dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-5 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-[#000000] rounded-lg text-slate-700 dark:text-slate-300 font-medium text-xs">
                      {typeIcon(item.type)}
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-sm font-semibold text-[#000000] dark:text-[#e5e4e2]">
                    {item.title || '—'}
                  </td>
                  <td className="hidden sm:table-cell py-3 px-5 text-sm text-slate-700 dark:text-slate-400">
                    {item.deletedAt ? new Date(item.deletedAt).toLocaleString() : '—'}
                  </td>
                  <td className="py-3 px-5 text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleRestore(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-medium text-xs transition-colors"
                      >
                        <RefreshCw size={13} /> Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 font-medium text-xs transition-colors"
                      >
                        <Trash2 size={13} /> Delete Forever
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default RecycleBin;
