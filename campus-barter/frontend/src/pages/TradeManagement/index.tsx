import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TradeCard from '../../components/trades/TradeCard';
import Button from '../../components/common/Button';
import { tradeService, authService } from '../../services';

const TradeManagement: React.FC = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<any[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login', { state: { from: '/trades' } });
      return;
    }
    
    setCurrentUser(user);
    
    const fetchTrades = async () => {
      try {
        setIsLoading(true);
        const tradesData = await tradeService.getUserTrades();
        setTrades(tradesData);
        setFilteredTrades(tradesData);
      } catch (err) {
        console.error('Failed to fetch trades:', err);
        setError('Failed to load trades');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrades();
  }, [navigate]);
  
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredTrades(trades);
    } else {
      setFilteredTrades(trades.filter(trade => trade.status === statusFilter));
    }
  }, [statusFilter, trades]);
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleAcceptTrade = async (tradeId: number) => {
    try {
      await tradeService.updateTradeStatus(tradeId, 'accepted');
      // Update the trade in the local state
      setTrades(prevTrades => 
        prevTrades.map(trade => 
          trade.id === tradeId ? { ...trade, status: 'accepted' } : trade
        )
      );
    } catch (err) {
      console.error('Failed to accept trade:', err);
      alert('Failed to accept trade. Please try again.');
    }
  };
  
  const handleRejectTrade = async (tradeId: number) => {
    try {
      await tradeService.updateTradeStatus(tradeId, 'rejected');
      // Update the trade in the local state
      setTrades(prevTrades => 
        prevTrades.map(trade => 
          trade.id === tradeId ? { ...trade, status: 'rejected' } : trade
        )
      );
    } catch (err) {
      console.error('Failed to reject trade:', err);
      alert('Failed to reject trade. Please try again.');
    }
  };
  
  const handleCompleteTrade = async (tradeId: number) => {
    try {
      await tradeService.updateTradeStatus(tradeId, 'completed');
      // Update the trade in the local state
      setTrades(prevTrades => 
        prevTrades.map(trade => 
          trade.id === tradeId ? { ...trade, status: 'completed' } : trade
        )
      );
    } catch (err) {
      console.error('Failed to complete trade:', err);
      alert('Failed to complete trade. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Trades</h1>
        <Link to="/trades/new">
          <Button variant="primary">
            New Trade
          </Button>
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center">
          <label htmlFor="status-filter" className="mr-2 font-medium">
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Trades</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      {/* Trades List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : filteredTrades.length > 0 ? (
        <div className="space-y-4">
          {filteredTrades.map(trade => (
            <TradeCard
              key={trade.id}
              trade={trade}
              currentUser={currentUser}
              onAccept={() => handleAcceptTrade(trade.id)}
              onReject={() => handleRejectTrade(trade.id)}
              onComplete={() => handleCompleteTrade(trade.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">No trades found</h2>
          <p className="text-gray-600 mb-6">
            {statusFilter === 'all' 
              ? "You don't have any trades yet." 
              : `You don't have any ${statusFilter} trades.`}
          </p>
          {statusFilter !== 'all' ? (
            <Button onClick={() => setStatusFilter('all')} variant="secondary">
              View All Trades
            </Button>
          ) : (
            <Link to="/search">
              <Button variant="primary">
                Browse Items to Trade
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default TradeManagement;
