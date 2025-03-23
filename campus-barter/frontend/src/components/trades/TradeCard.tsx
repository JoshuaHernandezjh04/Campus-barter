import React from 'react';
import { Trade, User, Item } from '../../types';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

interface TradeCardProps {
  trade: Trade;
  currentUser: User;
  onAccept?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
}

const TradeCard: React.FC<TradeCardProps> = ({ 
  trade, 
  currentUser,
  onAccept,
  onReject,
  onComplete
}) => {
  // Determine if current user is the initiator or recipient
  const isInitiator = trade.initiator_id === currentUser.id;
  const otherUserId = isInitiator ? trade.recipient_id : trade.initiator_id;
  
  // Extract offered and requested items
  const offeredItems: Item[] = trade.items
    .filter(item => item.offered_item_id)
    .map(item => item.offered_item as unknown as Item);
    
  const requestedItems: Item[] = trade.items
    .filter(item => item.requested_item_id)
    .map(item => item.requested_item as unknown as Item);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = () => {
    switch (trade.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold">
            Trade with User #{otherUserId}
          </h3>
          <p className="text-sm text-gray-500">
            Created on {formatDate(trade.creation_date)}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
          {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">
            {isInitiator ? 'You Offered:' : 'They Offered:'}
          </h4>
          <ul className="list-disc list-inside text-gray-600">
            {offeredItems.map((item, index) => (
              <li key={index} className="mb-1">
                <Link to={`/items/${item.id}`} className="hover:text-blue-600">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-2">
            {isInitiator ? 'You Requested:' : 'They Requested:'}
          </h4>
          <ul className="list-disc list-inside text-gray-600">
            {requestedItems.map((item, index) => (
              <li key={index} className="mb-1">
                <Link to={`/items/${item.id}`} className="hover:text-blue-600">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Link 
          to={`/trades/${trade.id}`} 
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details
        </Link>
        
        {/* Action buttons based on trade status and user role */}
        {trade.status === 'pending' && !isInitiator && (
          <div className="space-x-2">
            <Button 
              variant="success" 
              size="sm" 
              onClick={onAccept}
            >
              Accept
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={onReject}
            >
              Reject
            </Button>
          </div>
        )}
        
        {trade.status === 'accepted' && (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={onComplete}
          >
            Mark as Completed
          </Button>
        )}
      </div>
    </div>
  );
};

export default TradeCard;
