import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AssetsList from './pages/AssetsList';
import TicketsList from './pages/TicketsList';
import Companies from './pages/Companies';
import Products from './pages/Products';
import Users from './pages/Users';
import Admin from './pages/Admin';
import RecycleBin from './pages/RecycleBin';
import Notifications from './pages/Notifications';
import MemberProfile from './pages/MemberProfile';
import Maintenance from './pages/Maintenance';
import SubmitTicket from './pages/employee/SubmitTicket';
import { ProtectedRoute } from './components/ProtectedRoute';
import EmployeeLayout from './components/layout/EmployeeLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyTickets from './pages/employee/MyTickets';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'user') return <Navigate to="/employee" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Base Redirect */}
            <Route path="/" element={
              <ProtectedRoute>
                <RootRedirect />
              </ProtectedRoute>
            } />
            
            {/* Admin Portal Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="assets" element={<AssetsList />} />
              <Route path="tickets" element={<TicketsList />} />
              <Route path="companies" element={<Companies />} />
              <Route path="products" element={<Products />} />
              <Route path="users" element={<Users />} />
              <Route path="users/:id" element={<MemberProfile />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="admin" element={<Admin />} />
              <Route path="recycle-bin" element={<RecycleBin />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Employee Portal Routes */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['user']}>
                <EmployeeLayout />
              </ProtectedRoute>
            }>
              <Route index element={<EmployeeDashboard />} />
              <Route path="tickets" element={<MyTickets />} />
              <Route path="submit-ticket" element={<SubmitTicket />} />
            </Route>

            <Route path="*" element={<div className="p-8 text-center text-slate-500">Page not found</div>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
