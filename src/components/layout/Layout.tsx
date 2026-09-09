import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar with mobile toggle prop */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 dark:text-slate-300 p-1">
              <Menu size={24} />
            </button>
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">ASSETTO</span>
          </div>
          <button onClick={toggleTheme} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto relative z-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating credit */}
      <div className="fixed bottom-3 right-4 pointer-events-none z-50">
        <span className="text-[11px] text-slate-400/70 dark:text-slate-500/70 select-none">
          © Developed by Megakem
        </span>
      </div>
    </div>
  );
};

export default Layout;
