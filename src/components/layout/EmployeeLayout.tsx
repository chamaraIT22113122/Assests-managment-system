import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, LogOut, Moon, Sun, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const EmployeeLayout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/employee' },
    { icon: Ticket, label: 'My Tickets', path: '/employee/tickets' },
  ];

  return (
    <div className={`flex h-screen bg-white dark:bg-[#0f172a] text-[#000000] dark:text-slate-100 font-sans transition-colors duration-200 overflow-hidden`}>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#000000]/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1e293b] border-r border-slate-400 dark:border-slate-800 flex flex-col shadow-xl md:shadow-md md:relative transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-[#000000] dark:text-[#e5e4e2]">
            <div className="w-8 h-8 rounded-lg bg-[#fcaf17] flex items-center justify-center shrink-0">
              <span className="font-bold text-white text-sm">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight">AssetCo</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className="text-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors p-1">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-800 hover:text-slate-800 dark:hover:text-white p-1">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#000000]/50 m-4 rounded-xl border border-slate-300 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fcaf17]/10 flex items-center justify-center shrink-0">
              <User size={20} className="text-[#fcaf17] dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#000000] dark:text-[#e5e4e2] truncate">{user?.name}</p>
              <p className="text-xs text-slate-700 dark:text-slate-400">Employee Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/employee'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#fcaf17] text-white shadow-md'
                    : 'text-slate-800 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-[#000000] dark:hover:text-white'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-400 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-800 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 font-medium group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-[#1e293b] border-b border-slate-400 dark:border-slate-800 px-4 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-800 dark:text-slate-300 p-1">
              <Menu size={24} />
            </button>
            <span className="text-lg font-bold tracking-tight text-[#000000] dark:text-[#e5e4e2]">AssetCo</span>
          </div>
          <button onClick={toggleDarkMode} className="text-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors p-1">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-white dark:bg-[#0f172a]">
          <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-blue-50 to-transparent dark:from-slate-800/50 dark:to-transparent pointer-events-none"></div>
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Floating credit */}
      <div className="fixed bottom-3 right-4 pointer-events-none z-50">
        <span className="text-[11px] text-slate-800/70 dark:text-slate-500/70 select-none">
          © Developed by Megakem
        </span>
      </div>
    </div>
  );
};

export default EmployeeLayout;
