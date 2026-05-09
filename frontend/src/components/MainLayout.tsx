import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  BookOpen,
  LogOut,
} from 'lucide-react';

const MainLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/chores', icon: ClipboardList, label: 'Chores' },
    { to: '/shopping-lists', icon: ShoppingCart, label: 'Shopping' },
    { to: '/recipes', icon: BookOpen, label: 'Recipes' },
  ];

  return (
    <div className="flex flex-1 min-h-full bg-gray-50 dark:bg-gray-900 text-left">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h1 className="text-xl font-bold text-purple-600">Homed</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 w-full h-full ${
                  isActive ? 'text-purple-600' : 'text-gray-500'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 w-full h-full text-gray-500"
          >
            <LogOut size={20} />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
