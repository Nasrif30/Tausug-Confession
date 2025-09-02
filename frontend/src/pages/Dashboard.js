import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  FlagIcon,
  EyeIcon,
  HeartIcon,
  ChatIcon,
  ExclamationIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  TrashIcon,
  BanIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Add card styling
  const cardStyle = "bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConfessions: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    pendingReports: 0,
    userGrowth: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentConfessions, setRecentConfessions] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin, if not redirect to home
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    if (user && user.role === 'admin') {
      fetchDashboardData();
      fetchUsers();
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real-time stats from API
              const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://tausug-confession.onrender.com'}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data || data);
        setRecentUsers(data.data?.recentUsers || data.recentUsers || []);
        setRecentConfessions(data.data?.recentConfessions || data.recentConfessions || []);
      } else {
        // Fallback to mock data if API fails
        setStats({
          totalUsers: 1250,
          totalConfessions: 89,
          totalViews: 15420,
          totalLikes: 3420,
          totalComments: 567,
          pendingReports: 3,
          userGrowth: 45
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data
      setStats({
        totalUsers: 1250,
        totalConfessions: 89,
        totalViews: 15420,
        totalLikes: 3420,
        totalComments: 567,
        pendingReports: 3,
        userGrowth: 45
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
              const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://tausug-confession.onrender.com'}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      let endpoint = '';
      let method = 'PUT';

      switch (action) {
        case 'ban':
          endpoint = `/api/admin/users/${userId}/ban`;
          break;
        case 'role':
          endpoint = `/api/admin/users/${userId}/role`;
          break;
        case 'delete':
          endpoint = `/api/admin/users/${userId}`;
          method = 'DELETE';
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: method !== 'DELETE' ? JSON.stringify(data) : undefined
      });

      if (response.ok) {
        toast.success(`User ${action} successful`);
        fetchUsers(); // Refresh user list
      } else {
        toast.error(`Failed to ${action} user`);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: action })
      });

      if (response.ok) {
        toast.success(`Report ${action} successfully`);
        setPendingReports(prev => prev.filter(report => report.id !== reportId));
      } else {
        toast.error('Failed to update report');
      }
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  // Only allow admin access
  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <ExclamationIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Only administrators can access this dashboard.
        </p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, Admin! Full platform control and monitoring.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg">
            <ShieldCheckIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">ADMIN</span>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${cardStyle} p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30`}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Community Members</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{(stats.totalUsers || 0).toLocaleString()}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">+{stats.userGrowth || 0} this month</p>
            </div>
          </div>
        </div>

        <div className={`${cardStyle} p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30`}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Stories Shared</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{(stats.totalConfessions || 0).toLocaleString()}</p>
              <p className="text-xs text-green-600 dark:text-green-400">Total published</p>
            </div>
          </div>
        </div>

        <div className={`${cardStyle} p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30`}>
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-800 rounded-lg">
              <HeartIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Hearts Given</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200">{(stats.totalLikes || 0).toLocaleString()}</p>
              <p className="text-xs text-red-600 dark:text-red-400">Community love</p>
            </div>
          </div>
        </div>

        <div className={`${cardStyle} p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30`}>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg">
              <EyeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Views</p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{(stats.totalViews || 0).toLocaleString()}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Story engagement</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className={`${cardStyle} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            User Management
          </h2>
          <Button onClick={fetchUsers} loading={usersLoading}>
            <CogIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {usersLoading ? (
          <LoadingSpinner size="md" text="Loading users..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {allUsers.slice(0, 10).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={user.avatar_url || '/default-avatar.png'} 
                            alt={user.username}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.full_name || 'No name set'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.role} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {user.role !== 'admin' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'role', { role: 'moderator' })}
                              disabled={user.role === 'moderator'}
                            >
                              Promote
                            </Button>
                                                         <Button
                               size="sm"
                               variant="outline"
                               onClick={() => handleUserAction(user.id, 'ban', { is_banned: true })}
                               className="text-red-600 hover:text-red-700"
                             >
                               <BanIcon className="w-4 h-4" />
                             </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Reports */}
      <div className={`${cardStyle} p-6`}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Pending Reports ({stats.pendingReports})
        </h2>
        {pendingReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FlagIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>No pending reports at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReports.map((report) => (
              <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="error" size="sm">{report.type}</Badge>
                      <Badge variant="warning" size="sm">{report.status}</Badge>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{report.description}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReportAction(report.id, 'resolved')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReportAction(report.id, 'dismissed')}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className={`${cardStyle} p-6`}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <UsersIcon className="w-6 h-6 mb-2" />
            <span>Manage Users</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <DocumentTextIcon className="w-6 h-6 mb-2" />
            <span>Review Content</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <ChartBarIcon className="w-6 h-6 mb-2" />
            <span>View Analytics</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <FlagIcon className="w-6 h-6 mb-2" />
            <span>Handle Reports</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Badge component
const Badge = ({ variant = 'default', size = 'md', children }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    member: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    moderator: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs'
  };

  return (
    <span className={`${baseClasses} ${variants[variant] || variants.default} ${sizes[size]}`}>
      {children}
    </span>
  );
};

export default Dashboard;
