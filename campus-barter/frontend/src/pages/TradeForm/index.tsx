import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { tradeService, itemService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import MessageThread from '../../components/trades/MessageThread';

const TradeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  
  const [trade, setTrade] = useState<any>(null);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [selectedUserItems, setSelectedUserItems] = useState<number[]>([]);
  const [requestedItems, setRequestedItems] = useState<any[]>([]);
  const [selectedRequestedItems, setSelectedRequestedItems] = useState<number[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const isEditing = !!id;
  
  // Get offer and request from URL params if creating a new trade
  const offerParam = searchParams.get('offer');
  const requestParam = searchParams.get('request');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // If editing, fetch the trade data
        if (isEditing) {
          const tradeData = await tradeService.getTradeById(parseInt(id!));
          setTrade(tradeData);
          
          // Extract offered and requested items
          const offered = tradeData.items
            .filter((item: any) => item.offered_item_id)
            .map((item: any) => item.offered_item_id);
          
          const requested = tradeData.items
            .filter((item: any) => item.requested_item_id)
            .map((item: any) => item.requested_item_id);
          
          setSelectedUserItems(offered);
          setSelectedRequestedItems(requested);
          
          // Fetch the other user's items
          const otherUserId = tradeData.initiator_id === currentUser?.id 
            ? tradeData.recipient_id 
            : tradeData.initiator_id;
          
          const otherUserItems = await itemService.getUserItems(otherUserId);
          setRequestedItems(otherUserItems);
        } 
        // If creating a new trade
        else {
          // Fetch user's items
          const userItemsData = await itemService.getUserItems(currentUser?.id);
          setUserItems(userItemsData);
          
          // If offer param is provided, select it
          if (offerParam) {
            setSelectedUserItems([parseInt(offerParam)]);
          }
          
          // If request param is provided, fetch and select it
          if (requestParam) {
            const requestedItem = await itemService.getItemById(parseInt(requestParam));
            setRequestedItems([requestedItem]);
            setSelectedRequestedItems([parseInt(requestParam)]);
          }
        }
      } catch (err: any) {
        setError(err.error || 'Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      fetchData();
    } else {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [id, isEditing, currentUser, navigate, location.pathname, offerParam, requestParam]);

  const handleUserItemSelect = (itemId: number) => {
    setSelectedUserItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleRequestedItemSelect = (itemId: number) => {
    setSelectedRequestedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedUserItems.length === 0 || selectedRequestedItems.length === 0) {
        setError('Please select at least one item to offer and one item to request');
        return;
      }
      
      const tradeData = {
        offered_items: selectedUserItems,
        requested_items: selectedRequestedItems
      };
      
      let response;
      
      if (isEditing) {
        response = await tradeService.updateTrade(parseInt(id!), tradeData);
        setSuccessMessage('Trade updated successfully');
      } else {
        response = await tradeService.createTrade(tradeData);
        setSuccessMessage('Trade proposed successfully');
        
        // Navigate to the trade detail page after a short delay
        setTimeout(() => {
          navigate(`/trades/${response.id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.error || 'Failed to save trade');
      console.error('Error saving trade:', err);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Trade Details' : 'Propose a New Trade'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Your Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Items You're Offering</h2>
          
          {userItems.length > 0 ? (
            <div className="space-y-4">
              {userItems.map(item => (
                <div 
                  key={item.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedUserItems.includes(item.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleUserItemSelect(item.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                    </div>
                    <div className="flex items-center">
                      {selectedUserItems.includes(item.id) && (
                        <span className="bg-blue-500 text-white rounded-full p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You don't have any items available to trade.</p>
          )}
        </div>
        
        {/* Requested Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Items You're Requesting</h2>
          
          {requestedItems.length > 0 ? (
            <div className="space-y-4">
              {requestedItems.map(item => (
                <div 
                  key={item.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedRequestedItems.includes(item.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleRequestedItemSelect(item.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                    </div>
                    <div className="flex items-center">
                      {selectedRequestedItems.includes(item.id) && (
                        <span className="bg-blue-500 text-white rounded-full p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No items available to request.</p>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end mb-8">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={selectedUserItems.length === 0 || selectedRequestedItems.length === 0}
        >
          {isEditing ? 'Update Trade' : 'Propose Trade'}
        </Button>
      </div>
      
      {/* Message Thread (for existing trades) */}
      {isEditing && trade && (
        <div className="bg-white rounded-lg shadow-md p-6 h-96">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <MessageThread 
            trade={trade}
            currentUserId={currentUser?.id}
          />
        </div>
      )}
    </div>
  );
};

export default TradeForm;
