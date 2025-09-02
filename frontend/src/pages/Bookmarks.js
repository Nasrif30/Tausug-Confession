import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  BookmarkIcon,
  HeartIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const Bookmarks = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
              const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://tausug-confession.onrender.com'}/api/users/bookmarks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.data || []);
      } else {
        // Fallback to mock data
        setBookmarks([
          {
            id: 1,
            confession: {
              id: 1,
              title: "My First Story",
              description: "A beautiful story about life...",
              author: { username: "StoryWriter" },
              total_views: 150,
              total_likes: 25
            },
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId) => {
    try {
              const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://tausug-confession.onrender.com'}/api/users/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        toast.success('Bookmark removed successfully');
      } else {
        toast.error('Failed to remove bookmark');
      }
    } catch (error) {
      toast.error('Error removing bookmark');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading bookmarks..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <BookmarkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Please Login
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You need to be logged in to view your bookmarks.
        </p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Bookmarks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your saved stories and confessions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {bookmarks.length} saved
          </span>
        </div>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-16">
          <BookmarkIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No bookmarks yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start exploring stories and save your favorites!
          </p>
          <Link to="/">
            <Button>Explore Stories</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {bookmark.confession.title}
                </h3>
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remove bookmark"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {bookmark.confession.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>by {bookmark.confession.author.username}</span>
                <span>{new Date(bookmark.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{bookmark.confession.total_views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HeartIcon className="w-4 h-4" />
                    <span>{bookmark.confession.total_likes}</span>
                  </div>
                </div>
              </div>
              
              <Link to={`/confession/${bookmark.confession.id}`}>
                <Button className="w-full" size="sm">
                  Read Story
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
