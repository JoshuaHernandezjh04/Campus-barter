import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ItemForm from '../../components/items/ItemForm';
import { itemService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const ItemFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const isEditing = !!id;

  useEffect(() => {
    // If editing, fetch the item data
    if (isEditing) {
      const fetchItem = async () => {
        try {
          setIsLoading(true);
          const itemData = await itemService.getItemById(parseInt(id!));
          
          // Check if the current user owns this item
          if (itemData.user_id !== currentUser?.id) {
            setError('You do not have permission to edit this item');
            return;
          }
          
          setItem(itemData);
        } catch (err: any) {
          setError(err.error || 'Failed to load item');
          console.error('Error fetching item:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchItem();
    }
  }, [id, isEditing, currentUser]);

  const handleSubmit = async (formData: any) => {
    try {
      let response;
      
      if (isEditing) {
        response = await itemService.updateItem(parseInt(id!), formData);
      } else {
        response = await itemService.createItem(formData);
      }
      
      // Navigate to the item detail page
      navigate(`/items/${response.id}`);
    } catch (err: any) {
      setError(err.error || 'Failed to save item');
      console.error('Error saving item:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Item' : 'List a New Item'}
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <ItemForm 
            onSuccess={handleSubmit}
            initialData={item}
            isEditing={isEditing}
          />
        </div>
      </div>
    </div>
  );
};

export default ItemFormPage;
