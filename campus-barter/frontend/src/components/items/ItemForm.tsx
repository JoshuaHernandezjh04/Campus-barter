import React, { useState } from 'react';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { itemService } from '../../services';

interface ItemFormProps {
  onSuccess?: (itemId: number) => void;
  initialData?: any;
  isEditing?: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({ 
  onSuccess, 
  initialData = {}, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || '',
    condition: initialData.condition || '',
    images: initialData.images || [],
    tags: initialData.tags ? initialData.tags.join(', ') : ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await itemService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
    
    // Clear error when user types
    if (errors[id]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [id]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Process tags from comma-separated string to array
    const tagsArray = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];
    
    const itemData = {
      ...formData,
      tags: tagsArray
    };
    
    try {
      let response;
      
      if (isEditing && initialData.id) {
        response = await itemService.updateItem(initialData.id, itemData);
      } else {
        response = await itemService.createItem(itemData);
      }
      
      if (onSuccess) {
        onSuccess(response.id);
      }
    } catch (error: any) {
      setFormError(error.error || 'Failed to save item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{formError}</span>
        </div>
      )}
      
      <FormInput
        label="Title"
        type="text"
        id="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter item title"
        required
        error={errors.title}
      />
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your item or service"
          required
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={handleChange}
          required
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>
      
      <FormInput
        label="Condition (for physical items)"
        type="text"
        id="condition"
        value={formData.condition}
        onChange={handleChange}
        placeholder="e.g., New, Like New, Good, Fair"
        error={errors.condition}
      />
      
      <FormInput
        label="Tags (comma-separated)"
        type="text"
        id="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="e.g., textbook, math, electronics"
        error={errors.tags}
      />
      
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
      </Button>
    </form>
  );
};

export default ItemForm;
