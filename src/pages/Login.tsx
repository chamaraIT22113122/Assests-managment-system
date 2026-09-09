import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Lock, Mail, ArrowRight, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('password123');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: isAdminLogin ? 'admin' : 'user',
          identifier,
          password
        })
      });

      const data = await response.json();
      
      if (data.success) {
        login(data.user);
        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/employee');
        }
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-100/50 dark:bg-blue-900/20 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-slate-200/40 dark:bg-slate-800/40 blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 relative z-10 border border-white/40 dark:border-slate-700 shadow-2xl shadow-blue-900/5">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#3b5998] flex items-center justify-center mb-4 shadow-lg">
              <Monitor size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {isAdminLogin ? 'Admin Portal' : 'Welcome to ASSETTO'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center">
              {isAdminLogin ? 'Sign in to manage the system.' : 'Sign in with your Member ID to access your portal.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                {isAdminLogin ? 'Admin Username' : 'Member ID'}
              </label>
              <div className="relative">
                {isAdminLogin ? (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                ) : (
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                )}
                <input 
                  type="text" 
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-[#3b5998] focus:ring-4 focus:ring-[#3b5998]/10 outline-none transition-all duration-200 dark:text-white"
                  placeholder={isAdminLogin ? "e.g. admin" : "e.g. COMP-1029"}
                />
              </div>
            </div>

            {isAdminLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required={isAdminLogin}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-[#3b5998] focus:ring-4 focus:ring-[#3b5998]/10 outline-none transition-all duration-200 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end mt-1.5">
                  <a href="#" className="text-xs text-[#3b5998] hover:text-blue-800 dark:text-blue-400 font-medium">Forgot password?</a>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#3b5998] hover:bg-blue-800 text-white py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsAdminLogin(!isAdminLogin);
                setIdentifier(isAdminLogin ? '' : 'admin');
                if (!isAdminLogin) setPassword('admin');
              }}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              {isAdminLogin ? 'Return to Member Login' : 'Admin Login'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
