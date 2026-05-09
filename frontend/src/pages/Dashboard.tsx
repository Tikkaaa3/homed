import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome back, {user?.displayName || 'Friend'}!
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        This is your household dashboard. Use the sidebar to navigate between
        features.
      </p>
    </div>
  );
};

export default Dashboard;
