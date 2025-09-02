import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  UserIcon,
  DocumentTextIcon,
  HeartIcon,
  BookmarkIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Add card styling
  const cardStyle = "bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700";
  const [userStats, setUserStats] = useState({
    totalStories: 0,
    totalLikes: 0,
    totalViews: 0,
    totalBookmarks: 0
  });
  const [recentStories, setRecentStories] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user-specific data from API
              const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://tausug-confession.onrender.com'}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data.data.stats || {});
        setRecentStories(data.data.recentStories || []);
        setUserBookmarks(data.data.bookmarks || []);
      } else {
        // Fallback to mock data
        setUserStats({
          totalStories: 3,
          totalLikes: 45,
          totalViews: 120,
          totalBookmarks: 8
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to mock data
      setUserStats({
        totalStories: 3,
        totalLikes: 45,
        totalViews: 120,
        totalBookmarks: 8
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Please Login
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You need to be logged in to view your dashboard.
        </p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.username}! Here's your activity overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={user.role} size="md" />
        </div>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${cardStyle} p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30`}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">My Stories</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{userStats.totalStories}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Published</p>
            </div>
          </div>
        </div>

        <div className={`${cardStyle} p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30`}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
              <HeartIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Likes</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{userStats.totalLikes}</p>
              <p className="text-xs text-green-600 dark:text-green-400">Received</p>
            </div>
          </div>
        </div>

        <div className={`${cardStyle} p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30`}>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Views</p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{userStats.totalViews}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Story views</p>
            </div>
          </div>
        </div>

        <div className={`${cardStyle} p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30`}>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
              <BookmarkIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Bookmarks</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{userStats.totalBookmarks}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Saved stories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${cardStyle} p-6`}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/create">
            <Button variant="outline" className="h-20 flex-col w-full">
              <PlusIcon className="w-6 h-6 mb-2" />
              <span>Share Story</span>
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" className="h-20 flex-col w-full">
              <UserIcon className="w-6 h-6 mb-2" />
              <span>Edit Profile</span>
            </Button>
          </Link>
          <Link to="/bookmarks">
            <Button variant="outline" className="h-20 flex-col w-full">
              <BookmarkIcon className="w-6 h-6 mb-2" />
              <span>My Bookmarks</span>
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" className="h-20 flex-col w-full">
              <CogIcon className="w-6 h-6 mb-2" />
              <span>Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Stories */}
        <div className={`${cardStyle} p-6`}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            My Recent Stories
          </h2>
          {recentStories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No stories yet. Start sharing your experiences!</p>
              <Link to="/create" className="mt-4 inline-block">
                <Button size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Write First Story
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentStories.map((story) => (
                <div key={story.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{story.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {story.views} views • {story.likes} likes
                    </p>
                  </div>
                  <Badge variant={story.status === 'published' ? 'success' : 'warning'} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookmarks */}
        <div className={`${cardStyle} p-6`}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Bookmarks
          </h2>
          {userBookmarks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookmarkIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No bookmarks yet. Start saving your favorite stories!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userBookmarks.slice(0, 5).map((bookmark) => (
                <div key={bookmark.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{bookmark.confession.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      by {bookmark.confession.author.username}
                    </p>
                  </div>
                  <Link to={`/confession/${bookmark.confession.id}`}>
                    <Button size="sm" variant="outline">
                      Read
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
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

export default UserDashboard;
