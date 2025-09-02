import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { 
  HeartIcon, 
  ShieldCheckIcon, 
  UsersIcon, 
  BookOpenIcon,
  ChatIcon,
  StarIcon
} from '@heroicons/react/outline';

const About = () => {
  const features = [
    {
      icon: <HeartIcon className="w-8 h-8" />,
      title: 'Safe Space',
      description: 'A secure environment where you can share your thoughts and experiences without fear of judgment.'
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: 'Privacy First',
      description: 'Your identity is protected. Share anonymously or with your chosen username.'
    },
    {
      icon: <UsersIcon className="w-8 h-8" />,
      title: 'Community Support',
      description: 'Connect with others who understand your experiences and offer support.'
    },
    {
      icon: <BookOpenIcon className="w-8 h-8" />,
      title: 'Story Sharing',
      description: 'Share your confessions, experiences, and life lessons in a creative format.'
    },
    {
      icon: <ChatIcon className="w-8 h-8" />,
      title: 'Open Discussion',
      description: 'Engage in meaningful conversations through comments and discussions.'
    },
    {
      icon: <StarIcon className="w-8 h-8" />,
      title: 'Quality Content',
      description: 'Curated stories that inspire, educate, and bring people together.'
    }
  ];

  const values = [
    {
      title: 'Empathy',
      description: 'We believe in understanding and supporting each other through life\'s challenges and triumphs.'
    },
    {
      title: 'Respect',
      description: 'Every story matters, every voice deserves to be heard with dignity and respect.'
    },
    {
      title: 'Authenticity',
      description: 'We encourage genuine, honest sharing that helps others feel less alone.'
    },
    {
      title: 'Growth',
      description: 'Through sharing and listening, we help each other grow and learn from experiences.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-16">
        <h1 className="text-5xl md:text-7xl font-bold gradient-text">
          About Tausug Confession
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
          A digital sanctuary for the Tausug community and beyond, where stories find their voice and hearts find their home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button size="lg">
              Join Our Community
            </Button>
          </Link>
          <Link to="/creator">
            <Button variant="outline" size="lg">
              Meet the Creator
            </Button>
          </Link>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="card p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Our Mission
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Tausug Confession was created to provide a safe, supportive platform where people can share their stories, 
          confessions, and life experiences. We believe that every story has the power to heal, inspire, and connect us 
          as human beings. Whether you're sharing your own experiences or reading others' stories, you're part of a 
          community that values authenticity, empathy, and growth.
        </p>
      </div>

      {/* Features Grid */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          What We Offer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-purple-600 dark:text-purple-400 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Our Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <div key={index} className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="card p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-dashed border-purple-200 dark:border-purple-800">
        <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-4 text-center">
          Community Guidelines
        </h2>
        <div className="space-y-4 text-purple-700 dark:text-purple-300">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Be respectful and kind to everyone in the community</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Share authentic experiences and avoid harmful content</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Respect privacy and don't share personal information about others</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Engage in constructive discussions and support each other</p>
          </div>
        </div>
      </div>

      {/* Get Started Section */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Ready to Start Your Journey?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Join thousands of others who have found comfort, inspiration, and connection through sharing their stories.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button size="lg">
              Create Your Account
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg">
              Explore Stories
            </Button>
          </Link>
        </div>
      </div>

      {/* Contact Section */}
      <div className="card p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Have Questions?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're here to help! If you have any questions about the platform or need support, 
          please don't hesitate to reach out.
        </p>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
          <p>Created with ❤️ by NAS KILABOT</p>
          <p>For support and inquiries, contact the platform administrator</p>
        </div>
      </div>
    </div>
  );
};

export default About;
