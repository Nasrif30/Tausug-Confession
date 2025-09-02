import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

import { EyeIcon, EyeOffIcon, LockClosedIcon, UserIcon } from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Try regular login first
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        await login('email', formData);
        
        // Check if this is an admin account
        if (data.user && data.user.role === 'admin') {
          toast.success('Welcome back, Admin!');
          navigate('/dashboard'); // Admin dashboard
        } else {
          toast.success('Login successful!');
          navigate('/user-dashboard'); // User dashboard
        }
        return; // Exit early if regular login succeeds
      }

      // If regular login fails, try admin login
      console.log('Regular login failed, trying admin login...');
      const adminResponse = await fetch('http://localhost:5000/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('Admin login successful:', adminData);
        
        // Store token first
        localStorage.setItem('token', adminData.token);
        console.log('Token stored in localStorage');
        
        // Update the auth context with admin user data
        try {
          console.log('Setting user in auth context:', adminData.user);
          setUser(adminData.user);
          console.log('Auth context updated with admin user');
          
          // Wait for state to update and then redirect
          setTimeout(() => {
            console.log('Redirecting to dashboard...');
            console.log('Current user state should be:', adminData.user);
            navigate('/dashboard');
          }, 500); // Increased delay to ensure state update
        } catch (error) {
          console.error('Error updating auth context:', error);
          // Fallback redirect
          window.location.href = '/dashboard';
        }
        
        toast.success('Admin access granted!');
        
        // Debug the redirect
        console.log('Attempting to redirect to /dashboard...');
        console.log('Current location:', window.location.pathname);
      } else {
        // Both logins failed
        const errorData = await adminResponse.json();
        console.log('Admin login failed:', errorData);
        toast.error(errorData.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back to Tausug Confession
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                                 <Input
                   id="email"
                   name="email"
                   type="email"
                   autoComplete="email"
                   required
                   value={formData.email}
                   onChange={handleChange}
                   placeholder="Enter your email"
                   className="pl-10"
                 />
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                                 <Input
                   id="password"
                   name="password"
                   type={showPassword ? 'text' : 'password'}
                   autoComplete="current-password"
                   required
                   value={formData.password}
                   onChange={handleChange}
                   placeholder="Enter your password"
                   className="pl-10 pr-10"
                 />
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
                         <Button
               type="submit"
               loading={loading}
               className="w-full"
               size="lg"
             >
               Sign In
             </Button>
          </div>



                     <div className="text-center">
             <p className="text-sm text-gray-600 dark:text-gray-400">
               Don't have an account?{' '}
               <Link
                 to="/signup"
                 className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
               >
                 Sign up
               </Link>
             </p>
           </div>
        </form>
      </div>
    </div>
  );
};

export default Login;