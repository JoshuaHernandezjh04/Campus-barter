import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ItemCard from '../../components/items/ItemCard';
import ItemForm from '../../components/items/ItemForm';

// Mock components to avoid actual API calls
jest.mock('../../services/item.service', () => ({
  createItem: jest.fn(),
  updateItem: jest.fn(),
  getItemById: jest.fn()
}));

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
  },
  created_at: '2025-03-22T12:00:00Z',
  updated_at: '2025-03-22T12:00:00Z'
};

describe('Item Components', () => {
  // Test ItemCard component
  test('ItemCard renders correctly with item data', () => {
    render(
      <BrowserRouter>
        <ItemCard item={mockItem} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('This is a test item')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  test('ItemCard has view details link', () => {
    render(
      <BrowserRouter>
        <ItemCard item={mockItem} />
      </BrowserRouter>
    );
    
    const detailsLink = screen.getByRole('link', { name: /view details/i });
    expect(detailsLink).toBeInTheDocument();
    expect(detailsLink.getAttribute('href')).toBe('/items/1');
  });

  // Test ItemForm component
  test('ItemForm renders correctly for new item', () => {
    const mockSubmit = jest.fn();
    render(
      <BrowserRouter>
        <ItemForm onSuccess={mockSubmit} isEditing={false} />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/condition/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /list item/i })).toBeInTheDocument();
  });

  test('ItemForm renders correctly for editing', () => {
    const mockSubmit = jest.fn();
    render(
      <BrowserRouter>
        <ItemForm 
          onSuccess={mockSubmit} 
          isEditing={true} 
          initialData={mockItem} 
        />
      </BrowserRouter>
    );
    
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    expect(titleInput).toHaveValue('Test Item');
    expect(descriptionInput).toHaveValue('This is a test item');
    expect(screen.getByRole('button', { name: /update item/i })).toBeInTheDocument();
  });

  test('ItemForm handles input changes', () => {
    const mockSubmit = jest.fn();
    render(
      <BrowserRouter>
        <ItemForm onSuccess={mockSubmit} isEditing={false} />
      </BrowserRouter>
    );
    
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    fireEvent.change(titleInput, { target: { value: 'New Test Item' } });
    fireEvent.change(descriptionInput, { target: { value: 'This is a new test item' } });
    
    expect(titleInput).toHaveValue('New Test Item');
    expect(descriptionInput).toHaveValue('This is a new test item');
  });

  test('ItemForm submits with correct values', async () => {
    const mockSubmit = jest.fn();
    render(
      <BrowserRouter>
        <ItemForm onSuccess={mockSubmit} isEditing={false} />
      </BrowserRouter>
    );
    
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const conditionSelect = screen.getByLabelText(/condition/i);
    const submitButton = screen.getByRole('button', { name: /list item/i });
    
    fireEvent.change(titleInput, { target: { value: 'New Test Item' } });
    fireEvent.change(descriptionInput, { target: { value: 'This is a new test item' } });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    fireEvent.change(conditionSelect, { target: { value: 'Like New' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'New Test Item',
        description: 'This is a new test item',
        category: 'Electronics',
        condition: 'Like New'
      });
    });
  });
});
