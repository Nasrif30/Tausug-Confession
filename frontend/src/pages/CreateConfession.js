import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfessions } from '../context/ConfessionContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  BookOpenIcon, 
  PlusIcon,
  XIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const CreateConfession = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createConfession } = useConfessions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    isAnonymous: false
  });
  const [chapters, setChapters] = useState([
    { title: '', content: '' }
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleChapterChange = (index, field, value) => {
    const newChapters = [...chapters];
    newChapters[index][field] = value;
    setChapters(newChapters);
  };

  const addChapter = () => {
    setChapters([...chapters, { title: '', content: '' }]);
  };

  const removeChapter = (index) => {
    if (chapters.length > 1) {
      const newChapters = chapters.filter((_, i) => i !== index);
      setChapters(newChapters);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const confessionData = {
        ...formData,
        chapters: chapters.filter(chapter => chapter.title.trim() && chapter.content.trim())
      };
      
      await createConfession(confessionData);
      toast.success('Confession created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to create confession');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <BookOpenIcon className="w-16 h16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Please Login
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You need to be logged in to create confessions.
        </p>
        <Button onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Share Your Story
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new confession and let your voice be heard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h2>
          
          <div>
            <label className="form-label">Title *</label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a compelling title for your story"
              required
            />
          </div>

          <div>
            <label className="form-label">Description *</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Briefly describe what your story is about"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select a category</option>
              <option value="personal">Personal</option>
              <option value="relationships">Relationships</option>
              <option value="family">Family</option>
              <option value="work">Work</option>
              <option value="school">School</option>
              <option value="life-lessons">Life Lessons</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Share anonymously
            </label>
          </div>
        </div>

        {/* Chapters */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Chapters
            </h2>
            <Button
              type="button"
              onClick={addChapter}
              variant="outline"
              size="sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </div>

          {chapters.map((chapter, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Chapter {index + 1}
                </h3>
                {chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChapter(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div>
                <label className="form-label">Chapter Title</label>
                <Input
                  type="text"
                  value={chapter.title}
                  onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                  placeholder="Enter chapter title"
                />
              </div>

              <div>
                <label className="form-label">Chapter Content</label>
                <Textarea
                  value={chapter.content}
                  onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                  placeholder="Write your chapter content here..."
                  rows="6"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Confession'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateConfession;