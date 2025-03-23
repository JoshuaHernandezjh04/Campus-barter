import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemService, authService } from '../../services';
import Button from '../../components/common/Button';

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const itemData = await itemService.getItemById(parseInt(id));
        setItem(itemData);
        
        // In a real implementation, this would fetch the owner's data
        // For now, we'll simulate it
        setOwner({
          id: itemData.user_id,
          name: `User ${itemData.user_id}`,
          reputation_score: 4.8
        });
        
        // Get current user
        const user = authService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to fetch item details:', err);
        setError('Failed to load item details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  const handleProposeTradeClick = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/items/${id}` } });
      return;
    }
    
    navigate(`/trades/new?request=${id}`);
  };

  const handleEditClick = () => {
    navigate(`/items/${id}/edit`);
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      await itemService.deleteItem(parseInt(id!));
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  const nextImage = () => {
    if (item && item.images && item.images.length > 0) {
      setCurrentImage((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item && item.images && item.images.length > 0) {
      setCurrentImage((prev) => (prev - 1 + item.images.length) % item.images.length);
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

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Item not found'}</p>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === item.user_id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/search" className="text-blue-600 hover:text-blue-800">
          ← Back to Browse
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Image Gallery */}
          <div className="md:w-1/2 relative">
            <div className="h-64 md:h-full bg-gray-200 relative">
              {item.images && item.images.length > 0 ? (
                <img 
                  src={item.images[currentImage]} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Image Available
                </div>
              )}
              
              {item.images && item.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2"
                  >
                    ←
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2"
                  >
                    →
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                    {item.images.map((_: any, index: number) => (
                      <button 
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImage ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                {item.category}
              </div>
            </div>
          </div>
          
          {/* Item Details */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </div>
            
            {item.condition && (
              <div className="mb-4">
                <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  Condition: {item.condition}
                </span>
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{item.description}</p>
            </div>
            
            {item.tags && item.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag: string, index: number) => (
                    <span 
                      key={index} 
                      className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t pt-4 mb-6">
              <h2 className="text-lg font-semibold mb-2">Listed By</h2>
              <div className="flex items-center">
                <Link to={`/profile/${owner.id}`} className="flex items-center hover:text-blue-600">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">
                    <span className="font-bold">{owner.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{owner.name}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span>{owner.reputation_score.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            
            <div className="border-t pt-4">
              {isOwner ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleEditClick}
                    variant="secondary"
                  >
                    Edit Item
                  </Button>
                  <Button
                    onClick={handleDeleteClick}
                    variant="danger"
                  >
                    Delete Item
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleProposeTradeClick}
                  variant="primary"
                  fullWidth
                  disabled={item.status !== 'available'}
                >
                  {item.status === 'available' ? 'Propose Trade' : 'Item Not Available'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
