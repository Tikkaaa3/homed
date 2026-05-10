import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

interface House {
  id: string;
  name: string;
  joinCode: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouse = async () => {
      try {
        const res = await client.get('/houses/current');
        setHouse(res.data);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    fetchHouse();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome back, {user?.displayName || 'Friend'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This is your household dashboard. Use the sidebar to navigate between
          features.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : house ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            {house.name}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg px-5 py-4 border border-purple-100 dark:border-purple-800">
            <span className="text-purple-700 dark:text-purple-300 font-medium">
              Invite your roommates using this code:
            </span>
            <span className="inline-block font-mono text-xl font-bold text-purple-800 dark:text-purple-200 bg-white dark:bg-gray-900 px-4 py-2 rounded-md border-2 border-purple-200 dark:border-purple-700 tracking-wider">
              {house.joinCode}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
