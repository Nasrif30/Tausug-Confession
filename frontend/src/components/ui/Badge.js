// client/src/components/ui/Badge.js
import React from 'react';

const Badge = ({ variant = 'default', size = 'md', children, className = '' }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    member: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    moderator: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  const roleLabels = {
    user: 'User',
    member: 'Member',
    moderator: 'Moderator',
    admin: 'Admin'
  };

  const displayText = roleLabels[variant] || children || variant;

  return (
    <span className={`${baseClasses} ${variants[variant] || variants.default} ${sizes[size]} ${className}`}>
      {displayText}
    </span>
  );
};

export default Badge;