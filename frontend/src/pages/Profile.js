import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  UserIcon, 
  PencilIcon, 
  CameraIcon,
  BookOpenIcon,
  HeartIcon,
  EyeIcon,
  ChatIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Add card styling
  const cardStyle = "bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700";
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    email: user?.email || ''
  });

  const [stats, setStats] = useState({
    totalConfessions: 0,
    totalLikes: 0,
    totalViews: 0,
    totalComments: 0
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.updateProfile(formData);
      updateUser(response.user);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      await authService.updateAvatar(formData);
      toast.success('Profile picture updated successfully!');
      // Refresh user data to show new avatar
      window.location.reload();
    } catch (error) {
      toast.error(error.message || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };



  if (!user) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className={`${cardStyle} p-8`}>
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar 
                src={user.avatar_url} 
                name={user.username} 
                size="2xl"
                className="ring-4 ring-purple-200 dark:ring-purple-800"
              />
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors cursor-pointer"
              >
                <CameraIcon className="w-4 h-4" />
              </label>
            </div>
            <Badge variant={user.role} size="md" />
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                onClick={() => setEditing(!editing)}
                variant="outline"
                size="sm"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Username</label>
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    className="form-input min-h-[100px] resize-none"
                    rows="4"
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" loading={loading}>
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {user.bio ? (
                  <p className="text-gray-700 dark:text-gray-300">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-500 italic">
                    No bio yet. Click edit to add one!
                  </p>
                )}
                

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${cardStyle} p-6 text-center`}>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalConfessions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Stories
          </div>
        </div>
        <div className={`${cardStyle} p-6 text-center`}>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.totalLikes}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Likes Received
          </div>
        </div>
        <div className={`${cardStyle} p-6 text-center`}>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalViews}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Views
          </div>
        </div>
        <div className={`${cardStyle} p-6 text-center`}>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.totalComments}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Comments
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${cardStyle} p-6`}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <BookOpenIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p>No recent activity yet.</p>
          <p className="text-sm">Start sharing your stories to see your activity here!</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
