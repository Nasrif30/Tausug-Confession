import React, { createContext, useState, useContext } from 'react';
import { confessionService } from '../services/confessions';
import toast from 'react-hot-toast';

const ConfessionContext = createContext();

export const useConfessions = () => {
  const context = useContext(ConfessionContext);
  if (!context) {
    throw new Error('useConfessions must be used within a ConfessionProvider');
  }
  return context;
};

export const ConfessionProvider = ({ children }) => {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchConfessions = async (params = {}) => {
    setLoading(true);
    try {
      const response = await confessionService.getConfessions(params);
      setConfessions(response.confessions);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load confessions');
    } finally {
      setLoading(false);
    }
  };

  const createConfession = async (confessionData) => {
    try {
      const response = await confessionService.createConfession(confessionData);
      toast.success('Confession created successfully!');
      return response.confession;
    } catch (error) {
      toast.error(error.message || 'Failed to create confession');
      throw error;
    }
  };

  const likeConfession = async (confessionId) => {
    try {
      const response = await confessionService.likeConfession(confessionId);
      
      // Update local state
      setConfessions(prev => prev.map(confession => 
        confession.id === confessionId 
          ? { 
              ...confession, 
              total_likes: response.liked 
                ? confession.total_likes + 1 
                : confession.total_likes - 1,
              isLiked: response.liked
            }
          : confession
      ));
      
      return response;
    } catch (error) {
      toast.error('Failed to update like');
      throw error;
    }
  };

  const value = {
    confessions,
    loading,
    pagination,
    fetchConfessions,
    createConfession,
    likeConfession
  };

  return (
    <ConfessionContext.Provider value={value}>
      {children}
    </ConfessionContext.Provider>
  );
};

export default ConfessionContext;