import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { 
  HeartIcon, 
  CodeIcon, 
  LightBulbIcon, 
  UserGroupIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/outline';

const Creator = () => {
  const skills = [
    'React.js', 'Node.js', 'Express.js', 'Supabase', 'Tailwind CSS', 'JavaScript', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Authentication', 'File Uploads', 'Real-time Features'
  ];

  const achievements = [
    {
      title: 'Full-Stack Development',
      description: 'Built a complete web application from frontend to backend with modern technologies.'
    },
    {
      title: 'User Experience Design',
      description: 'Created an intuitive and beautiful interface that prioritizes user comfort and engagement.'
    },
    {
      title: 'Security Implementation',
      description: 'Implemented robust authentication, authorization, and data protection measures.'
    },
    {
      title: 'Community Platform',
      description: 'Developed a platform that fosters meaningful connections and storytelling.'
    }
  ];

  const vision = [
    'Creating safe digital spaces for communities to connect and share',
    'Building platforms that prioritize user privacy and well-being',
    'Developing technology that brings people together rather than apart',
    'Empowering individuals to share their stories and experiences'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-16">
        <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto flex items-center justify-center mb-8">
          <span className="text-4xl font-bold text-white">NK</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold gradient-text">
          Meet NAS KILABOT
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
          The creative mind and developer behind Tausug Confession Platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg">
              Explore the Platform
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Creator Story */}
      <div className="card p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          The Story Behind Tausug Confession
        </h2>
        <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            Tausug Confession was born from a simple yet powerful idea: creating a safe space where people can share 
            their stories, experiences, and confessions without fear of judgment. As a developer passionate about 
            building meaningful applications, I wanted to create something that would bring people together and 
            provide comfort through shared experiences.
          </p>
          <p>
            The platform is designed with the Tausug community in mind, but it's open to everyone who believes in 
            the power of storytelling and community support. Every feature, from the user interface to the backend 
            architecture, has been carefully crafted to ensure a seamless and secure experience for all users.
          </p>
          <p>
            My goal is to create a platform where people feel heard, supported, and connected. Whether you're 
            sharing your own story or reading others', you're part of a community that values authenticity, 
            empathy, and growth.
          </p>
        </div>
      </div>

      {/* Technical Skills */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Technical Expertise
        </h2>
        <div className="card p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {skills.map((skill, index) => (
              <div key={index} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-lg text-center text-sm font-medium">
                {skill}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          What I've Built
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {achievements.map((achievement, index) => (
            <div key={index} className="card p-6">
              <div className="text-purple-600 dark:text-purple-400 mb-4">
                <SparklesIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {achievement.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Vision & Mission
        </h2>
        <div className="card p-8">
          <div className="space-y-4">
            {vision.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Development Philosophy */}
      <div className="card p-12 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-dashed border-purple-200 dark:border-purple-800">
        <h2 className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-6 text-center">
          Development Philosophy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CodeIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-2">
              Clean Code
            </h3>
            <p className="text-purple-700 dark:text-purple-300">
              Writing maintainable, readable, and efficient code that others can easily understand and build upon.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <LightBulbIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-2">
              User-First Design
            </h3>
            <p className="text-purple-700 dark:text-purple-300">
              Prioritizing user experience and needs in every design decision and feature implementation.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <HeartIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-2">
              Purpose-Driven
            </h3>
            <p className="text-purple-700 dark:text-purple-300">
              Building applications that serve a meaningful purpose and make a positive impact on people's lives.
            </p>
          </div>
        </div>
      </div>

      {/* Get in Touch */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Let's Connect
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          I'm always interested in hearing about new projects, collaboration opportunities, or just connecting 
          with fellow developers and creators.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg">
              Explore the Platform
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="lg">
              Learn About the Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-500">
          Built with ❤️ and lots of ☕ by NAS KILABOT
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-600 mt-2">
          Thank you for being part of this journey
        </p>
      </div>
    </div>
  );
};

export default Creator;
