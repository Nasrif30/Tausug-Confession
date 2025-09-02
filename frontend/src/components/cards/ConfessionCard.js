// client/src/components/cards/ConfessionCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  HeartIcon, 
  EyeIcon, 
  ChatIcon, 
  BookOpenIcon,
  ClockIcon,
  DotsVerticalIcon
} from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid';
import { useAuth } from '../../context/AuthContext';

const ConfessionCard = ({ confession, onLike, onDelete, showActions = false }) => {
  const { user, isAuthenticated } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      return;
    }
    
    setIsLiking(true);
    try {
      await onLike(confession.id);
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      family: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      love: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      friendship: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      school: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      work: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      culture: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };
    return colors[category] || colors.general;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: '💭',
      family: '👨‍👩‍👧‍👦',
      love: '💝',
      friendship: '👫',
      school: '🎓',
      work: '💼',
      personal: '🌱',
      culture: '🏛️'
    };
    return icons[category] || '📝';
  };

  return (
    <div className="card-hover group">
      {/* Cover Image */}
      {confession.cover_image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={confession.cover_image_url}
            alt={confession.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar 
              src={confession.profiles?.avatar_url} 
              name={confession.profiles?.username}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {confession.profiles?.username}
                </p>
                <Badge variant={confession.profiles?.role} size="xs" />
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <ClockIcon className="w-3 h-3 mr-1" />
                {formatDate(confession.created_at)}
              </div>
            </div>
          </div>
          
          {/* Action Menu */}
          {showActions && user?.id === confession.author_id && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <DotsVerticalIcon className="w-5 h-5 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <Link
                    to={`/edit/${confession.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    Edit Story
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete && onDelete(confession.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    Delete Story
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <Link to={`/confession/${confession.id}`} className="block">
          <div className="space-y-3">
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {confession.title}
            </h3>
            
            {/* Description */}
            {confession.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                {truncateText(confession.description)}
              </p>
            )}

            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(confession.category)}`}>
                <span className="mr-1">{getCategoryIcon(confession.category)}</span>
                {confession.category}
              </span>
              
              {confession.tags?.slice(0, 2).map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  #{tag}
                </span>
              ))}
              
              {confession.tags?.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{confession.tags.length - 2} more
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <BookOpenIcon className="w-4 h-4" />
              <span>{confession.total_chapters}</span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon className="w-4 h-4" />
              <span>{confession.total_views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChatIcon className="w-4 h-4" />
              <span>{confession.total_comments}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isLiking}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                confession.isLiked
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-red-900 dark:hover:text-red-400'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              title={!isAuthenticated ? 'Login to like stories' : confession.isLiked ? 'Unlike' : 'Like'}
            >
              {isLiking ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : confession.isLiked ? (
                <HeartSolidIcon className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
              <span>{confession.total_likes}</span>
            </button>

            {/* Read More Button */}
            <Link to={`/confession/${confession.id}`}>
              <Button size="sm" variant="outline" className="hover:scale-105 transition-transform">
                Read More
              </Button>
            </Link>
          </div>
        </div>

        {/* Reading Progress Indicator */}
        {confession.total_chapters > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {confession.total_chapters} {confession.total_chapters === 1 ? 'chapter' : 'chapters'}
              </span>
              <span className="flex items-center">
                <BookOpenIcon className="w-3 h-3 mr-1" />
                {confession.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
    </div>
  );
};

export default ConfessionCard;