import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  MenuIcon, 
  XIcon, 
  UserIcon, 
  CogIcon, 
  LogoutIcon,
  BookmarkIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/outline';
import { Menu } from '@headlessui/react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navLinkClasses = (isActive) => `
    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
    ${isActive 
      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
      : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700'
    }
  `;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Tausug Confession
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={navLinkClasses(isActiveRoute('/'))}>
              Home
            </Link>
            
            <Link to="/about" className={navLinkClasses(isActiveRoute('/about'))}>
              About
            </Link>

            {user && (
              <>
                {user.role === 'member' && (
                  <Link to="/create" className={navLinkClasses(isActiveRoute('/create'))}>
                    Create Story
                  </Link>
                )}
                
                {user.role === 'admin' && (
                  <Link to="/dashboard" className={navLinkClasses(isActiveRoute('/dashboard'))}>
                    Admin Dashboard
                  </Link>
                )}
                
                {user.role !== 'admin' && (
                  <Link to="/user-dashboard" className={navLinkClasses(isActiveRoute('/user-dashboard'))}>
                    My Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu and Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                </Menu.Button>

                {/* User dropdown menu */}
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          } flex px-4 py-2 text-sm items-center`}
                        >
                          <UserIcon className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to={user.role === 'admin' ? '/dashboard' : '/user-dashboard'}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          } flex px-4 py-2 text-sm items-center`}
                        >
                          {user.role === 'admin' ? (
                            <>
                              <ChartBarIcon className="w-4 h-4 mr-3" />
                              Admin Dashboard
                            </>
                          ) : (
                            <>
                              <UserIcon className="w-4 h-4 mr-3" />
                              My Dashboard
                            </>
                          )}
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/bookmarks"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          } flex px-4 py-2 text-sm items-center`}
                        >
                          <BookmarkIcon className="w-4 h-4 mr-3" />
                          Bookmarks
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          } flex w-full px-4 py-2 text-sm items-center`}
                        >
                          <LogoutIcon className="w-4 h-4 mr-3" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <Link to="/" className={navLinkClasses(isActiveRoute('/'))}>
              Home
            </Link>
            
            <Link to="/about" className={navLinkClasses(isActiveRoute('/about'))}>
              About
            </Link>

            {user && (
              <>
                {user.role === 'member' && (
                  <Link to="/create" className={navLinkClasses(isActiveRoute('/create'))}>
                    Create Story
                  </Link>
                )}
                
                {user.role === 'admin' && (
                  <Link to="/dashboard" className={navLinkClasses(isActiveRoute('/dashboard'))}>
                    Admin Dashboard
                  </Link>
                )}
                
                {user.role !== 'admin' && (
                  <Link to="/user-dashboard" className={navLinkClasses(isActiveRoute('/user-dashboard'))}>
                    My Dashboard
                  </Link>
                )}
              </>
            )}

            {user ? (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Welcome, {user.username}
                </div>
                <Link to="/profile" className={navLinkClasses(isActiveRoute('/profile'))}>
                  Profile
                </Link>
                <Link to="/bookmarks" className={navLinkClasses(isActiveRoute('/bookmarks'))}>
                  Bookmarks
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Link to="/login" className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="block px-3 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
