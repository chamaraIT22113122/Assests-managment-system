import { useState, useEffect } from 'react';
import { Monitor, Search, Filter, MoreVertical, Plus, Edit, Trash2, X, Eye, Activity, Box, User, Calendar } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';

import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AssetsList = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  
  // Searchable dropdown state
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);

  const canEdit = user?.name === 'System Administrator' || user?.permissions?.['assets'] === 'edit';

  const downloadQR = () => {
    const canvas = document.getElementById('asset-qr-code') as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${selectedAsset.assetCode}-QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const printQR = () => {
    const canvas = document.getElementById('asset-qr-code') as HTMLCanvasElement;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const assetCompany = companies.find(c => c.name?.trim().toLowerCase() === selectedAsset.company?.trim().toLowerCase());
    const logoHtml = assetCompany?.logo ? `<img src="${assetCompany.logo}" style="max-width:180px; max-height:50px; margin-top:20px; object-fit:contain;" />` : '';
    
    const windowContent = `
      <!DOCTYPE html>
      <html>
      <head><title>Print QR - ${selectedAsset.assetCode}</title></head>
      <body style="display:flex; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif;">
        <div style="text-align:center;">
          <img src="${dataUrl}" style="width:250px;height:250px;" />
          <h2 style="margin:10px 0 5px 0;">${selectedAsset.name}</h2>
          <p style="margin:0; color:#666;">Code: ${selectedAsset.assetCode}</p>
          <p style="margin:0; color:#666;">Serial: ${selectedAsset.serialNumber}</p>
          ${logoHtml}
        </div>
      </body>
      </html>
    `;
    const printWin = window.open('', '', 'width=600,height=600');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(windowContent);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        printWin.close();
      }, 250);
    }
  };
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    company: '',
    assignedTo: '',
    serialNumber: '',
    location: '',
        status: 'Brand New',
    lifecycleState: 'Procured',
    warrantyStart: '',
    warrantyEnd: '',
    ownershipType: 'Owned',
    rentalPeriod: 'Monthly',
    customRentalPeriod: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [assetsData, companiesData, usersData, categoriesData] = await Promise.all([
      api.assets.getAll(),
      api.companies.getAll(),
      api.users.getAll(),
      api.products.getAll() // products act as categories
    ]);
    setAssets(assetsData);
    setCompanies(companiesData);
    setUsers(usersData);
    setCategories(categoriesData);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, company: e.target.value, assignedTo: '' });
    setMemberSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (editingId) {
      await api.assets.update(editingId, { ...formData, adminName: user?.name || 'Admin' });
    } else {
      await api.assets.create(formData);
    }
    closeModal();
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if(confirm('Are you sure you want to delete this asset?')) {
      await api.assets.delete(id);
      loadData();
    }
  };

  const openModal = (asset?: any) => {
    if (!canEdit) return;
    if (asset) {
      setEditingId(asset._id);
      // Map old legacy status values to new condition options
      const legacyMap: Record<string, string> = {
        'Functional': 'Good Condition',
        'Not Functional': 'Not Functional',
        'Need Replacement': 'Need Replacement',
      };
      const validStatuses = ['Brand New','Reconditioned','Good Condition','Fair Condition','Needs Repair','Not Functional','Need Replacement','Under Maintenance','Retired'];
      const rawStatus = asset.status || '';
      const mappedStatus = validStatuses.includes(rawStatus) ? rawStatus : (legacyMap[rawStatus] || 'Brand New');
      setFormData({
        name: asset.name || '',
        category: asset.category || '',
        company: asset.company || '',
        assignedTo: asset.assignedTo || '',
        serialNumber: asset.serialNumber || '',
        location: asset.location || '',
        status: mappedStatus,
        lifecycleState: asset.lifecycleState || 'Procured',
        warrantyStart: asset.warrantyStart ? asset.warrantyStart.split('T')[0] : '',
        warrantyEnd: asset.warrantyEnd ? asset.warrantyEnd.split('T')[0] : '',
        ownershipType: asset.specs?.ownershipType || 'Owned',
        rentalPeriod: asset.specs?.rentalPeriod || 'Monthly',
        customRentalPeriod: asset.specs?.customRentalPeriod || ''
      });
      setMemberSearchQuery(asset.assignedTo || '');
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: '',
        company: '',
        assignedTo: '',
        serialNumber: '',
        location: '',
            status: 'Brand New',
        lifecycleState: 'Procured',
        warrantyStart: '',
        warrantyEnd: '',
        ownershipType: 'Owned',
        rentalPeriod: 'Monthly',
        customRentalPeriod: ''
      });
      setMemberSearchQuery('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const openDetails = (asset: any) => {
    setSelectedAsset(asset);
    setIsDetailsOpen(true);
  };

  const renderIcon = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    const iconName = category ? category.icon : 'Box';
    // @ts-ignore
    const IconComponent = LucideIcons[iconName] || LucideIcons.Box;
    return <IconComponent size={18} />;
  };

  // Show all members in dropdown — filter by name or employee ID search query
  const filteredUsers = users.filter(u =>
    !memberSearchQuery ||
    u.name?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    (u.companyId && u.companyId.toLowerCase().includes(memberSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#000000] dark:text-[#e5e4e2]">Assets Inventory</h1>
          <p className="text-slate-700 text-sm mt-1">Manage and track all company hardware and equipment.</p>
        </div>
        {canEdit && (
          <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md flex items-center gap-2">
            <Plus size={18} />
            Add Asset
          </button>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl shadow-md border border-slate-300 dark:border-slate-700 overflow-hidden"
      >
        {/* ... Search ... */}
        <div className="p-4 border-b border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-[#e5e4e2]/50 dark:bg-[#000000]/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-800" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or user..." 
              className="w-full pl-10 pr-4 py-2 bg-[#e5e4e2] dark:bg-[#000000] border border-slate-400 dark:border-slate-700 rounded-lg text-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all dark:text-[#e5e4e2]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#e5e4e2] dark:bg-[#000000] border border-slate-400 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-[#e5e4e2] dark:hover:bg-slate-700 transition-colors">
            <Filter size={18} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e5e4e2] dark:bg-[#000000] border-b border-slate-300 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-400">
                <th className="px-4 sm:px-6 py-4 font-medium">Asset ID & Name</th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-4 font-medium">Category</th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-4 font-medium">Company</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Assigned To</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Status</th>
                <th className="hidden lg:table-cell px-4 sm:px-6 py-4 font-medium">Warranty Ends</th>
                <th className="px-4 sm:px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {assets.map((asset) => (
                <tr key={asset._id} className="hover:bg-[#e5e4e2]/80 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        {renderIcon(asset.category)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#000000] dark:text-[#e5e4e2] text-sm transition-colors cursor-pointer truncate" onClick={() => openDetails(asset)}>{asset.name}</p>
                        <p className="text-xs text-slate-700 dark:text-slate-400 font-mono truncate">{asset.assetCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-slate-800 dark:text-slate-300">{asset.category}</td>
                  <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-slate-800 dark:text-slate-300">{asset.company || '-'}</td>
                  <td className="px-4 sm:px-6 py-4">
                    {!asset.assignedTo ? (
                      <span className="text-slate-800 text-sm italic">Unassigned</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {asset.assignedTo.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate max-w-[100px] sm:max-w-none">{asset.assignedTo}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium border whitespace-nowrap ${
                      asset.status === 'Brand New' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' :
                      asset.status === 'Reconditioned' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                      asset.status === 'Good Condition' || asset.status === 'Functional' ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800/50' :
                      asset.status === 'Fair Condition' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50' :
                      asset.status === 'Needs Repair' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50' :
                      asset.status === 'Not Functional' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50' :
                      asset.status === 'Need Replacement' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' :
                      asset.status === 'Under Maintenance' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50' :
                      asset.status === 'Retired' ? 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-[#000000] dark:text-slate-400 dark:border-slate-700' :
                      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-4 sm:px-6 py-4 text-sm text-slate-800 dark:text-slate-400">
                    {asset.warrantyEnd ? new Date(asset.warrantyEnd).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right flex justify-end gap-1">
                    <button onClick={() => openDetails(asset)} className="p-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-md transition-colors shrink-0" title="View Details"><Eye size={16} /></button>
                    {canEdit && (
                      <>
                        <button onClick={() => openModal(asset)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors shrink-0" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(asset._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors shrink-0" title="Delete"><Trash2 size={16} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-700 dark:text-slate-400">No assets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* View Details Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedAsset && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-300 dark:border-slate-700 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    {renderIcon(selectedAsset.category)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#000000] dark:text-[#e5e4e2]">{selectedAsset.name}</h2>
                    <p className="text-sm text-slate-700 dark:text-slate-400 font-mono">{selectedAsset.assetCode}</p>
                  </div>
                </div>
                <button onClick={() => setIsDetailsOpen(false)} className="text-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"><X size={24} /></button>
              </div>

              <div className="flex flex-col md:flex-row overflow-y-auto custom-scrollbar flex-1">
                {/* Left Column: Asset Info & QR */}
                <div className="md:w-1/3 p-6 bg-[#e5e4e2]/50 dark:bg-[#000000]/50 border-r border-slate-300 dark:border-slate-700">
                  <div className="bg-[#e5e4e2] dark:bg-[#000000] p-6 rounded-xl border border-slate-400 dark:border-slate-700 shadow-md flex flex-col items-center text-center mb-6">
                    <div className="bg-[#e5e4e2] p-3 rounded-lg shadow-md border border-slate-300 mb-4 inline-flex flex-col items-center">
                      <QRCodeCanvas 
                        id="asset-qr-code"
                        value={selectedAsset.qrData || `Asset: ${selectedAsset.name}\nSerial: ${selectedAsset.serialNumber}\nCode: ${selectedAsset.assetCode}\nCompany: ${selectedAsset.company}`} 
                        size={140} 
                        level="H" 
                        includeMargin={true}
                      />
                      {(() => {
                        const matchedCompany = companies.find(c => c.name?.trim().toLowerCase() === selectedAsset.company?.trim().toLowerCase());
                        if (matchedCompany?.logo) {
                          return (
                            <img 
                              src={matchedCompany.logo} 
                              alt={selectedAsset.company} 
                              className="mt-2 max-h-12 max-w-[120px] object-contain" 
                            />
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="flex gap-2 w-full mt-2 mb-4">
                      <button onClick={downloadQR} className="flex-1 px-3 py-2 bg-slate-100 dark:bg-[#000000] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors">
                        Download
                      </button>
                      <button onClick={printQR} className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors">
                        Print Label
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-400 mb-1">Scan for asset details</p>
                    <p className="text-[10px] text-slate-800 dark:text-slate-500 break-all">{selectedAsset.serialNumber}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">Details</h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 items-start">
                          <Box size={16} className="text-slate-800 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-700">Category</p>
                            <p className="text-sm font-medium text-[#000000] dark:text-[#e5e4e2]">{selectedAsset.category}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-start">
                          <User size={16} className="text-slate-800 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-700">Owner Company</p>
                            <p className="text-sm font-medium text-[#000000] dark:text-[#e5e4e2]">{selectedAsset.company || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-start">
                          <Calendar size={16} className="text-slate-800 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-700">Warranty Range</p>
                            <p className="text-sm font-medium text-[#000000] dark:text-[#e5e4e2]">
                              {selectedAsset.warrantyStart ? new Date(selectedAsset.warrantyStart).toLocaleDateString() : '-'} to {selectedAsset.warrantyEnd ? new Date(selectedAsset.warrantyEnd).toLocaleDateString() : '-'}
                            </p>
                          </div>
                        </div>
                        {selectedAsset.specs?.ownershipType === 'Rental' && (
                          <div className="flex gap-3 items-start">
                            <Box size={16} className="text-slate-800 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-700">Rental Period</p>
                              <p className="text-sm font-medium text-[#000000] dark:text-[#e5e4e2]">
                                {selectedAsset.specs?.rentalPeriod === 'Custom' 
                                  ? selectedAsset.specs?.customRentalPeriod 
                                  : selectedAsset.specs?.rentalPeriod}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: History */}
                <div className="md:w-2/3 p-6">
                  <h3 className="text-lg font-bold text-[#000000] dark:text-[#e5e4e2] mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-blue-500" />
                    Asset History
                  </h3>

                  <div className="relative pl-6 border-l-2 border-slate-400 dark:border-slate-700 space-y-8">
                    {(!selectedAsset.history || selectedAsset.history.length === 0) ? (
                      <p className="text-sm text-slate-700">No history recorded yet.</p>
                    ) : (
                      [...selectedAsset.history].reverse().map((record: any, idx: number) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-[#e5e4e2] dark:bg-[#000000] border-2 border-blue-500 ring-4 ring-white dark:ring-slate-800"></div>
                          <div className="bg-[#e5e4e2] dark:bg-[#000000] p-4 rounded-xl border border-slate-300 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {record.action}
                              </span>
                              <span className="text-xs text-slate-800">
                                {new Date(record.date).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-[#000000] dark:text-[#e5e4e2] font-medium mb-1">{record.note}</p>
                            <p className="text-xs text-slate-700">By: {record.user}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Asset Modal */}
      <AnimatePresence>
        {isModalOpen && canEdit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#e5e4e2] dark:bg-[#000000] rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-300 dark:border-slate-700 shrink-0">
                <h2 className="text-xl font-bold text-[#000000] dark:text-[#e5e4e2]">{editingId ? 'Edit Asset' : 'Add Asset'}</h2>
                <button onClick={closeModal} className="text-slate-800 hover:text-slate-800 dark:hover:text-slate-200"><X size={20} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="asset-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asset Name / Model</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500" placeholder="e.g. Dell XPS 15 9500" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Category</label>
                      <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500">
                        <option value="" disabled>Select category</option>
                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Serial Number</label>
                      <input required type="text" value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500" placeholder="SN-XXXX-YYYY" />
                    </div>
                  </div>

                  {/* Assignment Info */}
                  <div className="p-4 bg-[#e5e4e2] dark:bg-[#000000]/50 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company</label>
                      <select required value={formData.company} onChange={handleCompanyChange} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500">
                        <option value="" disabled>Select company</option>
                        {companies.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned To (Member)</label>
                      <input 
                        type="text" 
                        placeholder={formData.company ? "Search by name or ID..." : "Select a company first"}
                        value={memberSearchQuery}
                        onChange={(e) => {
                          setMemberSearchQuery(e.target.value);
                          setIsMemberDropdownOpen(true);
                          if (e.target.value === '') {
                            setFormData({...formData, assignedTo: ''});
                          }
                        }}
                        onFocus={() => setIsMemberDropdownOpen(true)}
                        onBlur={() => {
                          setTimeout(() => setIsMemberDropdownOpen(false), 200);
                        }}
                        className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500"
                      />
                      
                      {/* Suggestions Dropdown */}
                      {isMemberDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-[#e5e4e2] dark:bg-[#000000] border border-slate-400 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({...formData, assignedTo: ''});
                              setMemberSearchQuery('');
                              setIsMemberDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-800 dark:text-slate-400 hover:bg-[#e5e4e2] dark:hover:bg-slate-700/50 italic border-b border-slate-300 dark:border-slate-700"
                          >
                            Unassigned
                          </button>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map(u => (
                              <button
                                key={u._id}
                                type="button"
                                onClick={() => {
                                  setFormData({...formData, assignedTo: u.name});
                                  setMemberSearchQuery(`${u.name} (${u.companyId})`);
                                  setIsMemberDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20 outline-none flex justify-between items-center transition-colors"
                              >
                                <span className="font-medium text-[#000000] dark:text-[#e5e4e2]">{u.name}</span>
                                <span className="text-xs text-slate-700 dark:text-slate-400 font-mono">{u.companyId}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-slate-700 text-center">No members found</div>
                          )}
                        </div>
                      )}
                      
                      {users.length === 0 && <p className="text-xs text-amber-500 mt-1">No members yet — add members in the Users tab first.</p>}
                    </div>
                  </div>

                  {/* Warranty, Status & Ownership */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ownership Type</label>
                      <select required value={formData.ownershipType} onChange={(e) => setFormData({...formData, ownershipType: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500">
                        <option value="Owned">Owned</option>
                        <option value="Rental">Rental</option>
                      </select>
                    </div>

                    {formData.ownershipType === 'Rental' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rental Period</label>
                        <select required value={formData.rentalPeriod} onChange={(e) => setFormData({...formData, rentalPeriod: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500">
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                          <option value="Custom">Customizable</option>
                        </select>
                      </div>
                    )}

                    {formData.ownershipType === 'Rental' && formData.rentalPeriod === 'Custom' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom Rental Period</label>
                        <input required type="text" value={formData.customRentalPeriod} onChange={(e) => setFormData({...formData, customRentalPeriod: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500" placeholder="e.g. 6 Months, Bi-Weekly" />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Warranty Start Date</label>
                      <input type="date" value={formData.warrantyStart} onChange={(e) => setFormData({...formData, warrantyStart: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Warranty End Date</label>
                      <input type="date" value={formData.warrantyEnd} onChange={(e) => setFormData({...formData, warrantyEnd: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Physical Location</label>
                      <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500" placeholder="e.g. Server Room A" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condition</label>
                      <select required value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 rounded-lg dark:bg-[#000000] dark:text-[#e5e4e2] outline-none focus:border-blue-500">
                        <option value="Brand New">🟢 Brand New</option>
                        <option value="Reconditioned">🔵 Reconditioned</option>
                        <option value="Good Condition">🟩 Good Condition</option>
                        <option value="Fair Condition">🟡 Fair Condition</option>
                        <option value="Needs Repair">🟠 Needs Repair</option>
                        <option value="Not Functional">🔴 Not Functional</option>
                        <option value="Need Replacement">⛔ Need Replacement</option>
                        <option value="Under Maintenance">🔧 Under Maintenance</option>
                        <option value="Retired">⚫ Retired</option>
                      </select>
                    </div>
                  </div>

                </form>
              </div>
              
              <div className="p-6 border-t border-slate-300 dark:border-slate-700 shrink-0 bg-[#e5e4e2] dark:bg-[#000000] flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-800 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" form="asset-form" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md">
                  {editingId ? 'Save Changes' : 'Add Asset'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssetsList;
