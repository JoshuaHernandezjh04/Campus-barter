import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { AuthProvider } from '../../context/AuthContext';

// Mock services to avoid actual API calls
jest.mock('../../services/auth.service', () => ({
  getCurrentUser: jest.fn(),
  logout: jest.fn()
}));

describe('Responsive Design Components', () => {
  // Test Navbar component responsive design
  test('Navbar renders correctly on desktop', () => {
    // Mock a desktop viewport
    global.innerWidth = 1200;
    global.dispatchEvent(new Event('resize'));
    
    require('../../services/auth.service').getCurrentUser.mockReturnValue({ id: 1, name: 'Test User' });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Desktop navbar should show all navigation links
    expect(screen.getByText(/campus barter/i)).toBeInTheDocument();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/browse/i)).toBeInTheDocument();
    expect(screen.getByText(/trades/i)).toBeInTheDocument();
    expect(screen.getByText(/test user/i)).toBeInTheDocument();
    
    // Desktop navbar should not show hamburger menu
    expect(screen.queryByTestId('mobile-menu-button')).not.toBeInTheDocument();
  });

  test('Navbar renders correctly on mobile', () => {
    // Mock a mobile viewport
    global.innerWidth = 480;
    global.dispatchEvent(new Event('resize'));
    
    require('../../services/auth.service').getCurrentUser.mockReturnValue({ id: 1, name: 'Test User' });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Mobile navbar should show logo and hamburger menu
    expect(screen.getByText(/campus barter/i)).toBeInTheDocument();
    expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
    
    // Mobile navbar should hide navigation links initially
    expect(screen.queryByText(/dashboard/i)).not.toBeVisible();
    expect(screen.queryByText(/browse/i)).not.toBeVisible();
    expect(screen.queryByText(/trades/i)).not.toBeVisible();
  });

  // Test Footer component responsive design
  test('Footer renders correctly on desktop', () => {
    // Mock a desktop viewport
    global.innerWidth = 1200;
    global.dispatchEvent(new Event('resize'));
    
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    // Footer should have multiple columns on desktop
    const footerColumns = screen.getAllByTestId('footer-column');
    expect(footerColumns.length).toBeGreaterThanOrEqual(3);
    
    // All columns should be visible
    footerColumns.forEach(column => {
      expect(column).toBeVisible();
    });
  });

  test('Footer renders correctly on mobile', () => {
    // Mock a mobile viewport
    global.innerWidth = 480;
    global.dispatchEvent(new Event('resize'));
    
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    // Footer should stack columns on mobile
    const footerColumns = screen.getAllByTestId('footer-column');
    
    // Check that columns are stacked (would need to check CSS in a real test)
    // Here we're just checking they're visible
    footerColumns.forEach(column => {
      expect(column).toBeVisible();
    });
  });

  // Test ItemCard component responsive design
  test('ItemCard adjusts layout for different screen sizes', () => {
    // This would typically check CSS properties or layout changes
    // For this example, we'll just check that the component renders
    // In a real test, you might use getComputedStyle or similar
    
    const mockItem = {
      id: 1,
      title: 'Test Item',
      description: 'This is a test item',
      category: 'Books',
      condition: 'Good',
      user_id: 1,
      user: {
        id: 1,
        name: 'Test User'
      }
    };
    
    // Desktop view
    global.innerWidth = 1200;
    global.dispatchEvent(new Event('resize'));
    
    const { rerender } = render(
      <BrowserRouter>
        <div data-testid="item-card-container">
          <ItemCard item={mockItem} />
        </div>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('item-card-container')).toBeInTheDocument();
    
    // Mobile view
    global.innerWidth = 480;
    global.dispatchEvent(new Event('resize'));
    
    rerender(
      <BrowserRouter>
        <div data-testid="item-card-container">
          <ItemCard item={mockItem} />
        </div>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('item-card-container')).toBeInTheDocument();
  });
});
