import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { itemService, matchingService } from '../../services';

const ItemAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchItemAndAnalysis = async () => {
      try {
        // Fetch item details
        setIsLoadingItem(true);
        const itemData = await itemService.getItemById(parseInt(id));
        setItem(itemData);
        setIsLoadingItem(false);
        
        // Fetch AI analysis
        setIsLoadingAnalysis(true);
        const analysisData = await matchingService.getItemAnalysis(parseInt(id));
        setAnalysis(analysisData.analysis);
        setIsLoadingAnalysis(false);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.error || 'Failed to load data');
        setIsLoadingItem(false);
        setIsLoadingAnalysis(false);
      }
    };
    
    fetchItemAndAnalysis();
  }, [id]);

  const formatAnalysis = (text: string) => {
    // Split by numbered sections
    const sections = text.split(/\d+\.\s/).filter(Boolean);
    
    if (sections.length <= 1) {
      // If no clear sections, just return the text with paragraphs
      return text.split('\n\n').map((paragraph, i) => (
        <p key={i} className="mb-4">{paragraph}</p>
      ));
    }
    
    // Try to identify the sections based on common patterns
    let titleSection = '';
    let descriptionSection = '';
    let tagsSection = '';
    let ratingSection = '';
    
    for (const section of sections) {
      const lowerSection = section.toLowerCase();
      if (lowerSection.includes('title') || lowerSection.includes('heading')) {
        titleSection = section;
      } else if (lowerSection.includes('description')) {
        descriptionSection = section;
      } else if (lowerSection.includes('tag')) {
        tagsSection = section;
      } else if (lowerSection.includes('rating') || lowerSection.includes('quality') || lowerSection.includes('overall')) {
        ratingSection = section;
      }
    }
    
    return (
      <>
        {titleSection && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Title Improvements</h3>
            <p className="text-gray-700">{titleSection.trim()}</p>
          </div>
        )}
        
        {descriptionSection && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description Improvements</h3>
            <p className="text-gray-700">{descriptionSection.trim()}</p>
          </div>
        )}
        
        {tagsSection && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Recommended Tags</h3>
            <p className="text-gray-700">{tagsSection.trim()}</p>
          </div>
        )}
        
        {ratingSection && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Overall Rating</h3>
            <p className="text-gray-700">{ratingSection.trim()}</p>
          </div>
        )}
        
        {/* If any section wasn't identified, show the full text */}
        {(!titleSection && !descriptionSection && !tagsSection && !ratingSection) && (
          <div className="mb-6">
            <p className="text-gray-700">{text}</p>
          </div>
        )}
      </>
    );
  };

  if (isLoadingItem || isLoadingAnalysis) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Item not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI Analysis for "{item.title}"</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">Current Listing</h2>
            <p className="text-gray-600">Here's your current item listing</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/items/${id}`)}
          >
            View Item
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Title</h3>
            <p className="text-gray-700 mb-4">{item.title}</p>
            
            <h3 className="font-medium mb-2">Category</h3>
            <p className="text-gray-700 mb-4">{item.category}</p>
            
            {item.condition && (
              <>
                <h3 className="font-medium mb-2">Condition</h3>
                <p className="text-gray-700 mb-4">{item.condition}</p>
              </>
            )}
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-700 mb-4">{item.description}</p>
            
            {item.tags && item.tags.length > 0 && (
              <>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag: string, index: number) => (
                    <span 
                      key={index} 
                      className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">AI Improvement Suggestions</h2>
        
        {analysis ? (
          <div className="prose max-w-none">
            {formatAnalysis(analysis)}
          </div>
        ) : (
          <p className="text-gray-600">No analysis available for this item.</p>
        )}
        
        <div className="mt-6 pt-4 border-t flex justify-end">
          <Button
            variant="primary"
            onClick={() => navigate(`/items/${id}/edit`)}
          >
            Edit Item with Suggestions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemAnalysis;
