import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ItemCard from '../components/items/ItemCard';
import Button from '../components/common/Button';
import { itemService, matchingService } from '../services';

const Dashboard: React.FC = () => {
  const [userItems, setUserItems] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserItems = async () => {
      try {
        setIsLoadingItems(true);
        // In a real implementation, this would use the current user's ID
        const items = await itemService.getAllItems();
        // Filter to just a few items for the dashboard
        setUserItems(items.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch user items:', err);
        setError('Failed to load your items');
      } finally {
        setIsLoadingItems(false);
      }
    };

    const fetchRecommendations = async () => {
      try {
        setIsLoadingRecommendations(true);
        const recs = await matchingService.getRecommendations();
        setRecommendations(recs.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchUserItems();
    fetchRecommendations();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to Campus Barter</h1>
        <p className="text-gray-600">
          Trade goods and services with your campus community. List items you don't need,
          find things you want, and make trades without spending cash.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Your Items Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Items</h2>
            <Link to="/items/new">
              <Button variant="primary" size="sm">
                List New Item
              </Button>
            </Link>
          </div>

          {isLoadingItems ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : userItems.length > 0 ? (
            <div className="space-y-4">
              {userItems.map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <Link to={`/items/${item.id}`} className="hover:text-blue-600">
                    <h3 className="font-medium">{item.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-600 truncate">{item.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    <Link to={`/items/${item.id}/edit`} className="text-sm text-blue-600 hover:text-blue-800">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 text-center">
                <Link to="/dashboard/items" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All Your Items →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't listed any items yet.</p>
              <Link to="/items/new">
                <Button variant="primary">
                  List Your First Item
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Recommended Trades Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recommended Trades</h2>
            <Link to="/search">
              <Button variant="secondary" size="sm">
                Browse Items
              </Button>
            </Link>
          </div>

          {isLoadingRecommendations ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <h3 className="font-medium">Trade your:</h3>
                      <Link to={`/items/${rec.user_item.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                        {rec.user_item.title}
                      </Link>
                    </div>
                    <div className="text-gray-400 px-2">for</div>
                    <div className="flex-1">
                      <h3 className="font-medium">Their:</h3>
                      <Link to={`/items/${rec.recommended_item.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                        {rec.recommended_item.title}
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">{rec.reason}</p>
                    <div className="mt-2 text-right">
                      <Link to={`/trades/new?offer=${rec.user_item.id}&request=${rec.recommended_item.id}`}>
                        <Button variant="primary" size="sm">
                          Propose Trade
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 text-center">
                <Link to="/recommendations" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All Recommendations →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No recommendations available yet.</p>
              <p className="text-sm text-gray-400">List more items to get personalized trade recommendations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/items/new" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors">
            <div className="text-blue-600 font-medium">List New Item</div>
            <p className="text-sm text-gray-600 mt-1">Add something to trade</p>
          </Link>
          <Link to="/search" className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors">
            <div className="text-green-600 font-medium">Browse Items</div>
            <p className="text-sm text-gray-600 mt-1">Find things to trade for</p>
          </Link>
          <Link to="/trades" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors">
            <div className="text-purple-600 font-medium">Manage Trades</div>
            <p className="text-sm text-gray-600 mt-1">View your active trades</p>
          </Link>
          <Link to="/instant-needs" className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg text-center transition-colors">
            <div className="text-yellow-600 font-medium">Instant Needs</div>
            <p className="text-sm text-gray-600 mt-1">Find urgent items quickly</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
