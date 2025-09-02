import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const GoogleAuth = ({ onSuccess, variant = 'default', size = 'md', className = '' }) => {
  const { login } = useAuth();
  
  // Check if Google OAuth is configured
  const isGoogleConfigured = process.env.REACT_APP_GOOGLE_CLIENT_ID && 
                            process.env.REACT_APP_GOOGLE_CLIENT_ID !== 'your-google-oauth-client-id-here';

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Send the access token to your backend
        const result = await login('google', response.access_token);
        if (onSuccess) {
          onSuccess(result);
        }
        toast.success('Successfully signed in with Google!');
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Failed to sign in with Google');
      }
    },
    onError: () => {
      toast.error('Google sign-in failed');
    }
  });

  const buttonVariants = {
    default: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
    outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white'
  };

  const buttonSizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // If Google OAuth is not configured, show disabled button
  if (!isGoogleConfigured) {
    return (
      <Button
        disabled
        variant="outline"
        size={size}
        className={`${buttonVariants[variant]} ${buttonSizes[size]} ${className} flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed`}
        title="Google OAuth not configured"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Google OAuth Not Configured</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => googleLogin()}
      variant="outline"
      size={size}
      className={`${buttonVariants[variant]} ${buttonSizes[size]} ${className} flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-md`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>Continue with Google</span>
    </Button>
  );
};

export default GoogleAuth;
