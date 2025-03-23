import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TradeCard from '../../components/trades/TradeCard';
import MessageThread from '../../components/trades/MessageThread';

// Mock components to avoid actual API calls
jest.mock('../../services/trade.service', () => ({
  updateTradeStatus: jest.fn(),
  sendMessage: jest.fn()
}));

const mockTrade = {
  id: 1,
  initiator_id: 1,
  recipient_id: 2,
  status: 'pending',
  created_at: '2025-03-22T12:00:00Z',
  updated_at: '2025-03-22T12:00:00Z',
  initiator: {
    id: 1,
    name: 'Test User 1'
  },
  recipient: {
    id: 2,
    name: 'Test User 2'
  },
  items: [
    {
      id: 1,
      trade_id: 1,
      offered_item_id: 1,
      requested_item_id: null,
      offered_item: {
        id: 1,
        title: 'Offered Item',
        description: 'This is an offered item',
        category: 'Books',
        condition: 'Good',
        user_id: 1
      }
    },
    {
      id: 2,
      trade_id: 1,
      offered_item_id: null,
      requested_item_id: 2,
      requested_item: {
        id: 2,
        title: 'Requested Item',
        description: 'This is a requested item',
        category: 'Electronics',
        condition: 'Like New',
        user_id: 2
      }
    }
  ],
  messages: [
    {
      id: 1,
      trade_id: 1,
      user_id: 1,
      content: 'Hello, I would like to trade with you',
      created_at: '2025-03-22T12:05:00Z'
    },
    {
      id: 2,
      trade_id: 1,
      user_id: 2,
      content: 'I am interested in your offer',
      created_at: '2025-03-22T12:10:00Z'
    }
  ]
};

describe('Trade Components', () => {
  // Test TradeCard component
  test('TradeCard renders correctly with trade data', () => {
    render(
      <BrowserRouter>
        <TradeCard trade={mockTrade} currentUserId={1} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText('Offered Item')).toBeInTheDocument();
    expect(screen.getByText('Requested Item')).toBeInTheDocument();
    expect(screen.getByText(/test user 2/i)).toBeInTheDocument();
  });

  test('TradeCard shows correct actions for initiator', () => {
    render(
      <BrowserRouter>
        <TradeCard trade={mockTrade} currentUserId={1} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/view details/i)).toBeInTheDocument();
    expect(screen.queryByText(/accept/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/decline/i)).not.toBeInTheDocument();
  });

  test('TradeCard shows correct actions for recipient', () => {
    render(
      <BrowserRouter>
        <TradeCard trade={mockTrade} currentUserId={2} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/view details/i)).toBeInTheDocument();
    expect(screen.getByText(/accept/i)).toBeInTheDocument();
    expect(screen.getByText(/decline/i)).toBeInTheDocument();
  });

  // Test MessageThread component
  test('MessageThread renders correctly with messages', () => {
    render(
      <MessageThread trade={mockTrade} currentUserId={1} />
    );
    
    expect(screen.getByText('Hello, I would like to trade with you')).toBeInTheDocument();
    expect(screen.getByText('I am interested in your offer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('MessageThread handles new message input', () => {
    render(
      <MessageThread trade={mockTrade} currentUserId={1} />
    );
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    
    fireEvent.change(messageInput, { target: { value: 'This is a new message' } });
    
    expect(messageInput).toHaveValue('This is a new message');
  });

  test('MessageThread submits new message', async () => {
    const mockSendMessage = jest.fn().mockResolvedValue({});
    require('../../services/trade.service').sendMessage = mockSendMessage;
    
    render(
      <MessageThread trade={mockTrade} currentUserId={1} />
    );
    
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(messageInput, { target: { value: 'This is a new message' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(1, 'This is a new message');
    });
  });
});
