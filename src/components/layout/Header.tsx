import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 bg-[#e5e4e2] dark:bg-[#000000] border-b border-slate-400 dark:border-slate-700 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
          AMS
        </div>
        <h1 className="text-lg font-bold text-[#000000] dark:text-[#e5e4e2] hidden sm:block tracking-wide">
          Asset Management System
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-700 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors hidden sm:block">
          Contact Us
        </button>

        <div className="flex items-center gap-2 pl-4 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-full pr-2 cursor-pointer border border-transparent hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
          <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col pr-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-[#e5e4e2] leading-tight">{user?.name}</span>
            <span className="text-[10px] text-slate-700 dark:text-slate-400 capitalize leading-tight">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
