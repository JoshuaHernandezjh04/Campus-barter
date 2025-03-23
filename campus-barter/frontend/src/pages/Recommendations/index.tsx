import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../../components/items/ItemCard';
import Button from '../../components/common/Button';
import { matchingService, authService } from '../../services';

const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login', { state: { from: '/recommendations' } });
      return;
    }
    
    setCurrentUser(user);
    
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const recommendationsData = await matchingService.getRecommendations();
        setRecommendations(recommendationsData);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [navigate]);

  const handleProposeTrade = (userItemId: number, recommendedItemId: number) => {
    navigate(`/trades/new?offer=${userItemId}&request=${recommendedItemId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI-Powered Trade Recommendations</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Recommended Trade</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Match Score: {(rec.score * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-lg mb-3">Your Item</h3>
                  <ItemCard item={rec.user_item} />
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-3">Recommended Item</h3>
                  <ItemCard item={rec.recommended_item} />
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <div className="mb-4">
                  <h3 className="font-medium text-lg mb-1">Why We Recommend This Trade</h3>
                  <p className="text-gray-600">{rec.reason}</p>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleProposeTrade(rec.user_item.id, rec.recommended_item.id)}
                    variant="primary"
                  >
                    Propose This Trade
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No Recommendations Available</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any trade recommendations for you at this time. Try listing more items to get personalized recommendations.
          </p>
          <Button
            onClick={() => navigate('/items/new')}
            variant="primary"
          >
            List a New Item
          </Button>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
