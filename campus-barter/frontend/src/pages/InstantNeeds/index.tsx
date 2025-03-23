import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { matchingService } from '../../services';

const InstantNeeds: React.FC = () => {
  const navigate = useNavigate();
  const [needDescription, setNeedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!needDescription.trim()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const matchesData = await matchingService.findInstantMatches(needDescription);
      setMatches(matchesData);
      setHasSearched(true);
    } catch (err: any) {
      console.error('Failed to find matches:', err);
      setError(err.error || 'Failed to find matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Instant Needs</h1>
        <p className="text-gray-600 mb-6">
          Need something urgently? Describe what you're looking for and we'll find the best matches on campus.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="need-description" className="block text-gray-700 font-medium mb-2">
                What do you need?
              </label>
              <textarea
                id="need-description"
                value={needDescription}
                onChange={(e) => setNeedDescription(e.target.value)}
                placeholder="E.g., I need a graphing calculator for my exam tomorrow"
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading || !needDescription.trim()}
            >
              {isLoading ? 'Searching...' : 'Find Matches'}
            </Button>
          </form>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {hasSearched && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {matches.length > 0 ? 'Matches Found' : 'No Matches Found'}
            </h2>
            
            {matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-lg">{match.item.title}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Match Score: {match.score}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{match.item.description}</p>
                    <div className="mt-2 text-sm text-gray-500">{match.reason}</div>
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        {match.item.condition && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {match.item.condition}
                          </span>
                        )}
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/items/${match.item.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/trades/new?request=${match.item.id}`)}
                        >
                          Propose Trade
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 mb-4">
                  We couldn't find any matches for your request. Try broadening your description or check back later.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/search')}
                >
                  Browse All Items
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstantNeeds;
