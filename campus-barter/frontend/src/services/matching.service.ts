import axios from 'axios';
import { authHeader } from './auth.service';

const API_URL = 'http://localhost:5000/api';

class MatchingService {
  /**
   * Get AI-powered trade recommendations for the current user
   * @param {number} itemId - Optional specific item ID to get recommendations for
   * @param {number} limit - Maximum number of recommendations to return
   * @returns {Promise} - Promise containing recommendations
   */
  async getRecommendations(itemId = null, limit = 10) {
    try {
      let url = `${API_URL}/matching/recommendations?limit=${limit}`;
      if (itemId) {
        url += `&item_id=${itemId}`;
      }
      
      const response = await axios.get(url, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find items matching an instant need description
   * @param {string} description - Description of the instant need
   * @param {number} limit - Maximum number of matches to return
   * @returns {Promise} - Promise containing matches
   */
  async findInstantMatches(description, limit = 10) {
    try {
      const response = await axios.post(
        `${API_URL}/matching/instant-matches`,
        { description, limit },
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get AI analysis of an item to improve its listing
   * @param {number} itemId - ID of the item to analyze
   * @returns {Promise} - Promise containing analysis
   */
  async getItemAnalysis(itemId) {
    try {
      const response = await axios.get(
        `${API_URL}/matching/item-analysis/${itemId}`,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Object} - Standardized error object
   */
  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        error: error.response.data.error || 'An error occurred',
        status: error.response.status
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        error: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        error: error.message || 'An unknown error occurred',
        status: 0
      };
    }
  }
}

export default new MatchingService();
