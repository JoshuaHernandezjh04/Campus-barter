from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.item import Item
from app.models.user import User
from app.utils.ai_matching import get_matching_system
from app import db

matching_bp = Blueprint('matching', __name__)

@matching_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """
    Get AI-powered trade recommendations for the current user
    """
    current_user_id = get_jwt_identity()
    
    # Get optional item_id parameter
    item_id = request.args.get('item_id', None)
    if item_id:
        try:
            item_id = int(item_id)
        except ValueError:
            return jsonify({'error': 'Invalid item_id parameter'}), 400
    
    # Get limit parameter
    limit = request.args.get('limit', 10)
    try:
        limit = int(limit)
    except ValueError:
        limit = 10
    
    # Get the appropriate matching system
    matching_system = get_matching_system()
    
    # Get recommendations
    recommendations = matching_system.get_trade_recommendations(
        user_id=current_user_id,
        item_id=item_id,
        limit=limit
    )
    
    return jsonify(recommendations), 200

@matching_bp.route('/instant-matches', methods=['POST'])
@jwt_required()
def find_instant_matches():
    """
    Find items matching an instant need description
    """
    current_user_id = get_jwt_identity()
    
    # Get request data
    data = request.get_json()
    
    if not data or 'description' not in data:
        return jsonify({'error': 'Need description is required'}), 400
    
    need_description = data['description']
    
    # Get limit parameter
    limit = data.get('limit', 10)
    try:
        limit = int(limit)
    except ValueError:
        limit = 10
    
    # Get the appropriate matching system
    matching_system = get_matching_system()
    
    # Find matches
    matches = matching_system.find_instant_matches(
        need_description=need_description,
        limit=limit
    )
    
    return jsonify(matches), 200

@matching_bp.route('/item-analysis/<int:item_id>', methods=['GET'])
@jwt_required()
def get_item_analysis(item_id):
    """
    Get AI analysis of an item to improve its listing
    """
    current_user_id = get_jwt_identity()
    
    # Get the item
    item = Item.query.get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    # Check if user owns the item
    if item.user_id != current_user_id:
        return jsonify({'error': 'You do not have permission to analyze this item'}), 403
    
    # Get the appropriate matching system
    matching_system = get_matching_system()
    
    # Get analysis
    if hasattr(matching_system, 'get_ai_analysis'):
        analysis = matching_system.get_ai_analysis(item)
        return jsonify({'analysis': analysis}), 200
    else:
        return jsonify({'error': 'AI analysis not available'}), 400
