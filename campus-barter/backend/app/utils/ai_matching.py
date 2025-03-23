"""
AI Matching System for Campus Barter
This module implements the AI-powered matching algorithm for trade recommendations
"""

import os
import json
import openai
from dotenv import load_dotenv
from app.models.item import Item
from app.models.user import User
from app import db

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

class AIMatchingSystem:
    """
    AI-powered matching system for Campus Barter
    Uses OpenAI API to generate trade recommendations and instant needs matching
    """
    
    @staticmethod
    def get_item_embedding(item):
        """
        Generate an embedding for an item using OpenAI's API
        """
        try:
            # Combine item attributes into a single text
            item_text = f"Title: {item.title}\nDescription: {item.description}\nCategory: {item.category}"
            if item.condition:
                item_text += f"\nCondition: {item.condition}"
            if item.tags:
                item_text += f"\nTags: {item.tags}"
            
            # Get embedding from OpenAI
            response = openai.Embedding.create(
                model="text-embedding-ada-002",
                input=item_text
            )
            
            # Return the embedding
            return response['data'][0]['embedding']
        except Exception as e:
            print(f"Error generating embedding: {str(e)}")
            return None
    
    @staticmethod
    def calculate_similarity(embedding1, embedding2):
        """
        Calculate cosine similarity between two embeddings
        """
        import numpy as np
        from numpy.linalg import norm
        
        # Convert to numpy arrays
        a = np.array(embedding1)
        b = np.array(embedding2)
        
        # Calculate cosine similarity
        return np.dot(a, b) / (norm(a) * norm(b))
    
    @staticmethod
    def get_trade_recommendations(user_id, item_id=None, limit=10):
        """
        Get AI-powered trade recommendations for a user
        If item_id is provided, get recommendations for that specific item
        """
        try:
            # Get user's items
            user_items = Item.query.filter_by(user_id=user_id, status='available').all()
            
            if not user_items:
                return []
            
            # If item_id is provided, filter to just that item
            if item_id:
                user_items = [item for item in user_items if item.id == item_id]
                if not user_items:
                    return []
            
            # Get other available items (not owned by the user)
            other_items = Item.query.filter(
                Item.user_id != user_id,
                Item.status == 'available'
            ).all()
            
            if not other_items:
                return []
            
            recommendations = []
            
            # For each user item, find potential matches
            for user_item in user_items:
                # Get embedding for user item
                user_item_embedding = AIMatchingSystem.get_item_embedding(user_item)
                
                if not user_item_embedding:
                    continue
                
                # Calculate similarity with other items
                for other_item in other_items:
                    # Get embedding for other item
                    other_item_embedding = AIMatchingSystem.get_item_embedding(other_item)
                    
                    if not other_item_embedding:
                        continue
                    
                    # Calculate similarity score
                    similarity = AIMatchingSystem.calculate_similarity(
                        user_item_embedding, 
                        other_item_embedding
                    )
                    
                    # Generate reason for recommendation
                    reason = AIMatchingSystem.generate_recommendation_reason(
                        user_item, 
                        other_item, 
                        similarity
                    )
                    
                    # Add to recommendations
                    recommendations.append({
                        'user_item': user_item.to_dict(),
                        'recommended_item': other_item.to_dict(),
                        'score': float(similarity),
                        'reason': reason
                    })
            
            # Sort by score (highest first) and limit results
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations[:limit]
        
        except Exception as e:
            print(f"Error generating recommendations: {str(e)}")
            return []
    
    @staticmethod
    def generate_recommendation_reason(user_item, other_item, similarity_score):
        """
        Generate a human-readable reason for the recommendation
        """
        try:
            # For high similarity scores
            if similarity_score > 0.8:
                return f"These items are highly compatible based on their descriptions and categories."
            
            # For medium similarity scores
            elif similarity_score > 0.6:
                # Check if same category
                if user_item.category == other_item.category:
                    return f"Both items are in the same category: {user_item.category}"
                
                # Check if tags overlap
                user_tags = set(user_item.tags.split(',')) if user_item.tags else set()
                other_tags = set(other_item.tags.split(',')) if other_item.tags else set()
                common_tags = user_tags.intersection(other_tags)
                
                if common_tags:
                    return f"Items share common tags: {', '.join(common_tags)}"
                
                return "These items have some similarities that might interest you."
            
            # For lower similarity scores
            else:
                return "This item might be of interest based on your listings."
        
        except Exception as e:
            print(f"Error generating reason: {str(e)}")
            return "This item might be a good trade match."
    
    @staticmethod
    def find_instant_matches(need_description, limit=10):
        """
        Find items matching an instant need description
        """
        try:
            # Get all available items
            available_items = Item.query.filter_by(status='available').all()
            
            if not available_items:
                return []
            
            # Get embedding for need description
            need_embedding = AIMatchingSystem.get_text_embedding(need_description)
            
            if not need_embedding:
                return []
            
            matches = []
            
            # Calculate similarity with available items
            for item in available_items:
                # Get embedding for item
                item_embedding = AIMatchingSystem.get_item_embedding(item)
                
                if not item_embedding:
                    continue
                
                # Calculate similarity score
                similarity = AIMatchingSystem.calculate_similarity(
                    need_embedding, 
                    item_embedding
                )
                
                # Generate reason for match
                reason = AIMatchingSystem.generate_match_reason(
                    need_description, 
                    item, 
                    similarity
                )
                
                # Add to matches
                matches.append({
                    'item': item.to_dict(),
                    'score': float(similarity),
                    'reason': reason
                })
            
            # Sort by score (highest first) and limit results
            matches.sort(key=lambda x: x['score'], reverse=True)
            return matches[:limit]
        
        except Exception as e:
            print(f"Error finding instant matches: {str(e)}")
            return []
    
    @staticmethod
    def get_text_embedding(text):
        """
        Generate an embedding for a text using OpenAI's API
        """
        try:
            # Get embedding from OpenAI
            response = openai.Embedding.create(
                model="text-embedding-ada-002",
                input=text
            )
            
            # Return the embedding
            return response['data'][0]['embedding']
        except Exception as e:
            print(f"Error generating text embedding: {str(e)}")
            return None
    
    @staticmethod
    def generate_match_reason(need_description, item, similarity_score):
        """
        Generate a human-readable reason for the instant need match
        """
        try:
            # For high similarity scores
            if similarity_score > 0.8:
                return f"This item closely matches your description and should meet your needs."
            
            # For medium similarity scores
            elif similarity_score > 0.6:
                return f"This {item.category.lower()} seems to match what you're looking for."
            
            # For lower similarity scores
            else:
                return "This item might partially meet your needs."
        
        except Exception as e:
            print(f"Error generating match reason: {str(e)}")
            return "This item might meet your needs."
    
    @staticmethod
    def get_ai_analysis(item):
        """
        Get AI analysis of an item to improve its listing
        """
        try:
            # Prepare prompt for OpenAI
            prompt = f"""
            Analyze this item listing and provide suggestions for improvement:
            
            Title: {item.title}
            Description: {item.description}
            Category: {item.category}
            Condition: {item.condition or 'Not specified'}
            Tags: {item.tags or 'None'}
            
            Please provide:
            1. Suggested improvements to the title
            2. Suggested improvements to the description
            3. Recommended additional tags
            4. Overall rating of the listing quality (1-10)
            """
            
            # Get response from OpenAI
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert in marketplace listings and trading."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Return the analysis
            return response.choices[0].message.content
        
        except Exception as e:
            print(f"Error generating AI analysis: {str(e)}")
            return "Unable to generate analysis at this time."

# Create a fallback version that doesn't use OpenAI API
# This is used when the API key is not available or for testing
class MockAIMatchingSystem:
    """
    Mock AI matching system that doesn't use OpenAI API
    Used for testing or when API key is not available
    """
    
    @staticmethod
    def get_trade_recommendations(user_id, item_id=None, limit=10):
        """
        Get mock trade recommendations for a user
        """
        try:
            # Get user's items
            user_items = Item.query.filter_by(user_id=user_id, status='available').all()
            
            if not user_items:
                return []
            
            # If item_id is provided, filter to just that item
            if item_id:
                user_items = [item for item in user_items if item.id == item_id]
                if not user_items:
                    return []
            
            # Get other available items (not owned by the user)
            other_items = Item.query.filter(
                Item.user_id != user_id,
                Item.status == 'available'
            ).limit(20).all()
            
            if not other_items:
                return []
            
            recommendations = []
            
            # For each user item, find potential matches
            for user_item in user_items[:3]:  # Limit to 3 user items
                for other_item in other_items[:10]:  # Limit to 10 other items
                    # Calculate a mock score
                    score = 0.5  # Default score
                    
                    # Boost score if same category
                    if user_item.category == other_item.category:
                        score += 0.3
                    
                    # Boost score if tags overlap
                    user_tags = set(user_item.tags.split(',')) if user_item.tags else set()
                    other_tags = set(other_item.tags.split(',')) if other_item.tags else set()
                    common_tags = user_tags.intersection(other_tags)
                    
                    if common_tags:
                        score += 0.2
                    
                    # Generate reason
                    if user_item.category == other_item.category:
                        reason = f"Items are in the same category: {user_item.category}"
                    elif common_tags:
                        reason = f"Items share common tags: {', '.join(common_tags)}"
                    else:
                        reason = "Items may be of interest based on general compatibility"
                    
                    # Add to recommendations
                    recommendations.append({
                        'user_item': user_item.to_dict(),
                        'recommended_item': other_item.to_dict(),
                        'score': score,
                        'reason': reason
                    })
            
            # Sort by score (highest first) and limit results
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations[:limit]
        
        except Exception as e:
            print(f"Error generating mock recommendations: {str(e)}")
            return []
    
    @staticmethod
    def find_instant_matches(need_description, limit=10):
        """
        Find mock items matching an instant need description
        """
        try:
            # Get all available items
            available_items = Item.query.filter_by(status='available').limit(20).all()
            
            if not available_items:
                return []
            
            matches = []
            
            # Extract keywords from need description
            keywords = need_description.lower().split()
            
            # Calculate mock matches
            for item in available_items:
                # Calculate a mock score based on keyword matching
                score = 0.3  # Base score
                
                # Check title, description, and tags for keywords
                item_text = f"{item.title} {item.description} {item.tags or ''}".lower()
                
                # Count matching keywords
                matching_keywords = [kw for kw in keywords if kw in item_text]
                score += len(matching_keywords) * 0.1
                
                # Cap score at 0.9
                score = min(score, 0.9)
                
                # Generate reason
                if matching_keywords:
                    reason = f"Matched keywords: {', '.join(matching_keywords)}"
                else:
                    reason = "May partially meet your needs"
                
                # Add to matches
                matches.append({
                    'item': item.to_dict(),
                    'score': score,
                    'reason': reason
                })
            
            # Sort by score (highest first) and limit results
            matches.sort(key=lambda x: x['score'], reverse=True)
            return matches[:limit]
        
        except Exception as e:
            print(f"Error finding mock instant matches: {str(e)}")
            return []

# Factory function to get the appropriate matching system
def get_matching_system():
    """
    Get the appropriate matching system based on API key availability
    """
    if os.getenv('OPENAI_API_KEY') and os.getenv('OPENAI_API_KEY') != 'your_openai_api_key_here':
        return AIMatchingSystem
    else:
        print("Warning: Using mock AI matching system because OpenAI API key is not set")
        return MockAIMatchingSystem
