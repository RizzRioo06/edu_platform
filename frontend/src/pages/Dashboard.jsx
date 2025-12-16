import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Educational Platform</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.email}!
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium text-gray-900">{user?.email}</p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-medium text-gray-900">{user?.role}</p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="text-sm text-gray-600">User ID</p>
              <p className="text-lg font-medium text-gray-900">{user?.id}</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🎉 Successfully Authenticated!</h3>
            <p className="text-blue-700">
              You can now access all the features of the educational platform.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
