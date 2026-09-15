import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Building2, Package, Users, Settings, UserCircle, Trash, Bell, ChevronDown, ChevronRight, Sun, Moon, Briefcase, HeadphonesIcon, LogOut, Wrench, X, Key } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ icon: Icon, label, to, isDropdown, onClick }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      {isDropdown ? (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
        >
          <div className="flex items-center gap-3">
            <Icon size={18} />
            <span>{label}</span>
          </div>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      ) : (
        <NavLink 
          to={to}
          end={to === '/admin'}
          onClick={onClick}
          className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[#fcaf17] text-white' : 'text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white'}`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      )}
    </div>
  );
};

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: any) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => {
    if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const hasAccess = (sectionKey: string) => {
    if (!user) return false;
    if (user.name === 'System Administrator') return true;
    const perms = user.permissions || {};
    // If permission is not strictly 'none', they can at least view it
    return perms[sectionKey] !== 'none';
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#000000] border-r border-slate-400 dark:border-slate-800 flex flex-col shadow-xl md:shadow-none md:relative transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex items-center justify-between mt-6 mb-8 px-6">
        <div className="flex items-center gap-2 text-[#fcaf17] dark:text-blue-400">
          <Briefcase size={24} className="fill-current" />
          <h1 className="text-xl font-bold tracking-wider">AssetCo</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="hidden md:block text-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={closeMenu} className="md:hidden text-slate-800 hover:text-slate-800 dark:hover:text-white p-1">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="mb-2 px-6 text-xs font-semibold text-slate-800 uppercase tracking-wider">Menu</div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 custom-scrollbar">
        {hasAccess('dashboard') && <NavItem to="/admin" icon={LayoutGrid} label="Dashboard" onClick={closeMenu} />}
        {hasAccess('companies') && <NavItem to="/admin/companies" icon={Building2} label="Companies" onClick={closeMenu} />}
        {hasAccess('products') && <NavItem to="/admin/products" icon={Package} label="Products" onClick={closeMenu} />}
        {hasAccess('users') && <NavItem to="/admin/users" icon={Users} label="Members" onClick={closeMenu} />}
        {hasAccess('assets') && <NavItem to="/admin/assets" icon={Settings} label="Assets" onClick={closeMenu} />}
        {hasAccess('assets') && <NavItem to="/admin/licenses" icon={Key} label="Licenses" onClick={closeMenu} />}
        {hasAccess('tickets') && <NavItem to="/admin/tickets" icon={HeadphonesIcon} label="Tickets" onClick={closeMenu} />}
        {hasAccess('maintenance') && <NavItem to="/admin/maintenance" icon={Wrench} label="Maintenance" onClick={closeMenu} />}
        
        {/* Only System Admin can access Admin controls */}
        {user?.name === 'System Administrator' && <NavItem to="/admin/admin" icon={UserCircle} label="Admin Controls" onClick={closeMenu} />}
        
        {hasAccess('recycle') && <NavItem to="/admin/recycle-bin" icon={Trash} label="Recycle Bin" onClick={closeMenu} />}
        {hasAccess('notifications') && <NavItem to="/admin/notifications" icon={Bell} label="Notifications" onClick={closeMenu} />}
      </nav>

      {/* Logged-in user + Logout */}
      <div className="mt-4 py-4 px-4 border-t border-slate-300 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#fcaf17] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#000000] dark:text-[#e5e4e2] truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-800 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
        >
          <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
