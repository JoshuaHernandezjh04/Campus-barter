import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserProfile from '../../components/user/UserProfile';
import { userService } from '../../services';
import { useAuth } from '../../context/AuthContext';

interface ProfileProps {
  isEditing?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // If we're in edit mode, use the current user's ID
    if (isEditing) {
      if (!currentUser) {
        navigate('/login', { state: { from: '/profile/edit' } });
        return;
      }
      setUserId(currentUser.id);
    } 
    // Otherwise, use the ID from the URL params
    else if (id) {
      setUserId(parseInt(id));
    }
    // If neither is available, redirect to dashboard
    else {
      navigate('/dashboard');
    }
  }, [id, isEditing, currentUser, navigate]);

  const handleProfileUpdate = async (userData: any) => {
    try {
      const updatedUser = await userService.updateProfile(userData);
      updateUserProfile(updatedUser);
      navigate(`/profile/${updatedUser.id}`);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Handle error (could show an error message)
    }
  };

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfile 
        userId={userId} 
        isEditing={isEditing}
        onUpdate={isEditing ? handleProfileUpdate : undefined}
      />
    </div>
  );
};

export default Profile;
