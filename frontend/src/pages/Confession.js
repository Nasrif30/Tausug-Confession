import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { confessionService } from '../services/confessions';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { HeartIcon, EyeIcon, ChatIcon, BookOpenIcon, ArrowLeftIcon, BookmarkIcon } from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/solid';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Confession = () => {
  const { id } = useParams();
  const { user, isAuthenticated, canLike, canComment, canBookmark } = useAuth();
  const [confession, setConfession] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    fetchConfession();
  }, [id]);

  const fetchConfession = async () => {
    try {
      const response = await confessionService.getConfessionById(id);
      setConfession(response.confession);
      
      // Auto-select first chapter if available
      if (response.confession.chapters && response.confession.chapters.length > 0) {
        setSelectedChapter(0);
      }
    } catch (error) {
      toast.error('Failed to load confession');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like stories');
      return;
    }

    setLikeLoading(true);
    try {
      const response = await confessionService.likeConfession(id);
      setConfession(prev => ({
        ...prev,
        total_likes: response.liked ? prev.total_likes + 1 : prev.total_likes - 1,
        isLiked: response.liked
      }));
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark stories');
      return;
    }

    setBookmarkLoading(true);
    try {
      const response = await confessionService.toggleBookmark(id);
      setConfession(prev => ({
        ...prev,
        isBookmarked: response.bookmarked
      }));
      toast.success(response.bookmarked ? 'Story bookmarked!' : 'Bookmark removed');
    } catch (error) {
      toast.error('Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!confession) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Story Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The story you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const currentChapter = confession.chapters?.[selectedChapter];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-4 sm:mb-6">
        <Link 
          to="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Back to Stories</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {/* Sidebar - Story Info & Chapters */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="sticky top-6 space-y-4 sm:space-y-6">
            {/* Story Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              {/* Cover Image */}
              {confession.cover_image_url && (
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <img
                    src={confession.cover_image_url}
                    alt={confession.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
                {confession.title}
              </h1>

              {/* Author */}
              <div className="flex items-center mb-4">
                <Avatar 
                  src={confession.profiles?.avatar_url} 
                  name={confession.profiles?.username}
                  size="sm"
                />
                <div className="ml-3">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {confession.profiles?.username}
                    </p>
                    <Badge variant={confession.profiles?.role} size="xs" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(confession.created_at)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {confession.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {confession.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-3 sm:space-x-4">
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
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Like Button */}
                <Button
                  onClick={handleLike}
                  disabled={!isAuthenticated || likeLoading}
                  variant={confession.isLiked ? "danger" : "outline"}
                  className="w-full"
                  loading={likeLoading}
                  size="sm"
                >
                  {confession.isLiked ? (
                    <HeartSolidIcon className="w-4 h-4 mr-2" />
                  ) : (
                    <HeartIcon className="w-4 h-4 mr-2" />
                  )}
                  {confession.total_likes} Likes
                </Button>

                {/* Bookmark Button */}
                <Button
                  onClick={handleBookmark}
                  disabled={!isAuthenticated || bookmarkLoading}
                  variant={confession.isBookmarked ? "primary" : "outline"}
                  className="w-full"
                  loading={bookmarkLoading}
                  size="sm"
                >
                  {confession.isBookmarked ? (
                    <BookmarkSolidIcon className="w-4 h-4 mr-2" />
                  ) : (
                    <BookmarkIcon className="w-4 h-4 mr-2" />
                  )}
                  {confession.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>

              {/* Category & Tags */}
              <div className="space-y-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  {confession.category}
                </span>
                {confession.tags && confession.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {confession.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chapters List */}
            {confession.chapters && confession.chapters.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Chapters ({confession.chapters.length})
                </h3>
                <div className="space-y-2">
                  {confession.chapters.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      onClick={() => setSelectedChapter(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedChapter === index
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        Chapter {chapter.chapter_number}
                      </div>
                      <div className="text-xs opacity-75 truncate">
                        {chapter.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Chapter */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {currentChapter ? (
              <div className="p-4 sm:p-6 lg:p-8">
                {/* Chapter Header */}
                <div className="mb-6 sm:mb-8">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                    Chapter {currentChapter.chapter_number}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {currentChapter.title}
                  </h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Published on {formatDate(currentChapter.created_at)} • {currentChapter.views} views
                  </div>
                </div>

                {/* Chapter Content */}
                <div className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none">
                  <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {currentChapter.content}
                  </div>
                </div>

                {/* Chapter Navigation */}
                {confession.chapters.length > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700 gap-4">
                    <Button
                      variant="outline"
                      disabled={selectedChapter === 0}
                      onClick={() => setSelectedChapter(prev => prev - 1)}
                      className="w-full sm:w-auto"
                    >
                      Previous Chapter
                    </Button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedChapter + 1} of {confession.chapters.length}
                    </span>
                    <Button
                      variant="outline"
                      disabled={selectedChapter === confession.chapters.length - 1}
                      onClick={() => setSelectedChapter(prev => prev + 1)}
                      className="w-full sm:w-auto"
                    >
                      Next Chapter
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Chapters Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This story hasn't been published yet. Check back later for updates.
                </p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-6 sm:mt-8 p-4 sm:p-6 lg:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6">
              Comments ({confession.total_comments})
            </h3>
            
            {isAuthenticated && canComment ? (
              <div className="mb-6">
                <textarea
                  placeholder="Share your thoughts about this story..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                />
                <div className="mt-3 flex justify-end">
                  <Button size="sm">Post Comment</Button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {isAuthenticated ? (
                    'You need permission to comment on stories'
                  ) : (
                    <>
                      <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Login
                      </Link> to join the discussion
                    </>
                  )}
                </p>
              </div>
            )}

            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <ChatIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Comments feature coming soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confession;