// client/src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { confessionService } from '../services/confessions';
import ConfessionCard from '../components/cards/ConfessionCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  SearchIcon, 
  FilterIcon, 
  PlusIcon,
  HeartIcon,
  UsersIcon,
  BookOpenIcon,
  TrendingUpIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [confessions, setConfessions] = useState([]);
  
  // Add card styling
  const cardStyle = "bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700";
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStories: 0,
    totalLikes: 0
  });

  const categories = [
    { value: 'all', label: 'All Stories', icon: '📚' },
    { value: 'general', label: 'General', icon: '💭' },
    { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { value: 'love', label: 'Love & Relationships', icon: '💝' },
    { value: 'friendship', label: 'Friendship', icon: '👫' },
    { value: 'school', label: 'School & Education', icon: '🎓' },
    { value: 'work', label: 'Work & Career', icon: '💼' },
    { value: 'personal', label: 'Personal Growth', icon: '🌱' },
    { value: 'culture', label: 'Culture & Tradition', icon: '🏛️' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Newest First', icon: '🕒' },
    { value: 'total_likes', label: 'Most Liked', icon: '❤️' },
    { value: 'total_views', label: 'Most Viewed', icon: '👁️' },
    { value: 'total_comments', label: 'Most Discussed', icon: '💬' }
  ];

  useEffect(() => {
    fetchConfessions();
    fetchStats();
  }, [selectedCategory, sortBy]);

  const fetchConfessions = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      
      const params = {
        page,
        limit: pagination.limit,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy
      };

      const response = await confessionService.getConfessions(params);
      
      if (append) {
        setConfessions(prev => [...prev, ...response.confessions]);
      } else {
        setConfessions(response.confessions);
      }
      
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load stories');
      console.error('Fetch confessions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // In a real app, fetch from API
      // For now, using mock data
      setStats({
        totalUsers: 1250,
        totalStories: pagination.total || 89,
        totalLikes: 3420
      });
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchConfessions(1, false);
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchConfessions(pagination.page + 1, true);
    }
  };

  const handleLike = async (confessionId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like stories');
      return;
    }

    try {
      const response = await confessionService.likeConfession(confessionId);
      
      setConfessions(prev => prev.map(confession => 
        confession.id === confessionId 
          ? { 
              ...confession, 
              total_likes: response.liked 
                ? confession.total_likes + 1 
                : confession.total_likes - 1,
              isLiked: response.liked
            }
          : confession
      ));
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 sm:space-y-6 py-8 sm:py-12">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold gradient-text">
            Tausug Confession
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto px-4">
            A safe space to share your stories, connect with others, and find comfort in knowing you're not alone.
          </p>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-500">
            Every story matters, every voice is heard.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          {isAuthenticated ? (
            <>
              <Link to="/create">
                <Button size="lg" className="w-full sm:w-auto">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Share Your Story
                </Button>
              </Link>
              <Link to={user.role === 'admin' ? '/dashboard' : '/user-dashboard'}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {user.role === 'admin' ? (
                    <>
                      <ChartBarIcon className="w-5 h-5 mr-2" />
                      Admin Dashboard
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-5 h-5 mr-2" />
                      My Dashboard
                    </>
                  )}
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Browse Library
              </Button>
            </>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Join Our Community
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 max-w-3xl mx-auto px-4">
          <div className={`text-center p-4 sm:p-6 ${cardStyle}`}>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalStories}+
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
              Stories Shared
            </div>
          </div>
          <div className={`text-center p-4 sm:p-6 ${cardStyle}`}>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.totalUsers}+
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
              Community Members
            </div>
          </div>
          <div className={`text-center p-4 sm:p-6 ${cardStyle}`}>
            <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.totalLikes}+
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
              Hearts Given
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`${cardStyle} p-4 sm:p-6`}>
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stories by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <Button type="submit" size="lg" className="lg:w-auto w-full">
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FilterIcon className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TrendingUpIcon className="w-4 h-4 inline mr-1" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Stories Grid */}
      {loading && confessions.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading stories..." />
        </div>
      ) : (
        <>
          {confessions.length === 0 ? (
            <div className={`text-center py-16 ${cardStyle}`}>
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No stories found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search criteria or check back later for new stories.
              </p>
              {isAuthenticated && (
                <Link to="/create">
                  <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Be the first to share
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Stories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {confessions.map((confession) => (
                  <ConfessionCard 
                    key={confession.id} 
                    confession={confession}
                    onLike={handleLike}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {pagination.page < pagination.totalPages && (
                <div className="text-center pt-8">
                  <Button 
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    loading={loading}
                  >
                    Load More Stories
                  </Button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Showing {confessions.length} of {pagination.total} stories
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Community Guidelines */}
      {!isAuthenticated && (
        <div className={`${cardStyle} p-6 sm:p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-dashed border-purple-200 dark:border-purple-800`}>
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-4">
              Join Our Community
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Become part of a supportive community where your stories matter. Share your experiences, 
              connect with others, and find comfort in knowing you're not alone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;