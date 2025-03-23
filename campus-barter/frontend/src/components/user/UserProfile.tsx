import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services';
import Button from '../common/Button';

interface UserProfileProps {
  userId: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would fetch user data from the API
        // For now, we'll use the current user if it matches the userId
        const currentUser = authService.getCurrentUser();
        
        if (currentUser && currentUser.id === userId) {
          setUser(currentUser);
          setIsCurrentUser(true);
        } else {
          // This would be replaced with an API call to get another user's profile
          // For now, we'll simulate it with a timeout
          setTimeout(() => {
            setUser({
              id: userId,
              name: `User ${userId}`,
              email: `user${userId}@example.com`,
              bio: 'This is a sample user profile.',
              reputation_score: 4.5,
              join_date: new Date().toISOString()
            });
            setIsCurrentUser(false);
          }, 500);
        }
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error || 'User not found'}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 h-32 relative"></div>
      
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-4">
          <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white overflow-hidden">
            {user.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                <span className="text-4xl font-bold">{user.name.charAt(0)}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">Member since {formatDate(user.join_date)}</p>
          </div>
          
          {isCurrentUser && (
            <div className="mt-4 sm:mt-0 sm:ml-auto">
              <Button
                onClick={() => navigate('/profile/edit')}
                variant="secondary"
                size="sm"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span className="font-medium">{user.reputation_score.toFixed(1)}</span>
          </div>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-gray-600">{user.email}</span>
        </div>
        
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-gray-700">{user.bio || 'No bio provided.'}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
