import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Recommendations from '../../pages/Recommendations';
import InstantNeeds from '../../pages/InstantNeeds';

// Mock services to avoid actual API calls
jest.mock('../../services/matching.service', () => ({
  getRecommendations: jest.fn(),
  findInstantMatches: jest.fn()
}));

jest.mock('../../services/auth.service', () => ({
  getCurrentUser: jest.fn().mockReturnValue({ id: 1, name: 'Test User' })
}));

const mockRecommendations = [
  {
    user_item: {
      id: 1,
      title: 'User Item',
      description: 'This is a user item',
      category: 'Books',
      condition: 'Good'
    },
    recommended_item: {
      id: 2,
      title: 'Recommended Item',
      description: 'This is a recommended item',
      category: 'Electronics',
      condition: 'Like New'
    },
    score: 0.85,
    reason: 'These items are highly compatible based on their descriptions and categories.'
  }
];

const mockMatches = [
  {
    item: {
      id: 2,
      title: 'Matching Item',
      description: 'This is a matching item',
      category: 'Electronics',
      condition: 'Like New'
    },
    score: 0.78,
    reason: 'This item closely matches your description and should meet your needs.'
  }
];

describe('AI Matching Components', () => {
  // Test Recommendations component
  test('Recommendations page shows loading state initially', () => {
    require('../../services/matching.service').getRecommendations = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockRecommendations), 100)));
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Recommendations />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByRole('heading', { name: /ai-powered trade recommendations/i })).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('Recommendations page displays recommendations when loaded', async () => {
    require('../../services/matching.service').getRecommendations = jest.fn().mockResolvedValue(mockRecommendations);
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Recommendations />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('User Item')).toBeInTheDocument();
      expect(screen.getByText('Recommended Item')).toBeInTheDocument();
      expect(screen.getByText(/85%/)).toBeInTheDocument();
      expect(screen.getByText('These items are highly compatible based on their descriptions and categories.')).toBeInTheDocument();
    });
  });

  // Test InstantNeeds component
  test('InstantNeeds page renders form correctly', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <InstantNeeds />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByRole('heading', { name: /instant needs/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/what do you need/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /find matches/i })).toBeInTheDocument();
  });

  test('InstantNeeds page handles input and submission', async () => {
    const mockFindMatches = jest.fn().mockResolvedValue(mockMatches);
    require('../../services/matching.service').findInstantMatches = mockFindMatches;
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <InstantNeeds />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const needInput = screen.getByLabelText(/what do you need/i);
    const submitButton = screen.getByRole('button', { name: /find matches/i });
    
    fireEvent.change(needInput, { target: { value: 'I need a calculator for my exam tomorrow' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockFindMatches).toHaveBeenCalledWith('I need a calculator for my exam tomorrow');
    });
  });

  test('InstantNeeds page displays matches when loaded', async () => {
    require('../../services/matching.service').findInstantMatches = jest.fn().mockResolvedValue(mockMatches);
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <InstantNeeds />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const needInput = screen.getByLabelText(/what do you need/i);
    const submitButton = screen.getByRole('button', { name: /find matches/i });
    
    fireEvent.change(needInput, { target: { value: 'I need a calculator for my exam tomorrow' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Matching Item')).toBeInTheDocument();
      expect(screen.getByText(/78%/)).toBeInTheDocument();
      expect(screen.getByText('This item closely matches your description and should meet your needs.')).toBeInTheDocument();
    });
  });
});
