from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.item import Item
from app import db

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    # Get user ID from JWT
    current_user_id = get_jwt_identity()
    
    # Check if user is updating their own profile
    if user_id != current_user_id:
        return jsonify({'error': 'Not authorized to update this profile'}), 403
    
    # Find user
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get request data
    data = request.get_json()
    
    # Update user fields
    if 'name' in data:
        user.name = data['name']
    if 'profile_picture' in data:
        user.profile_picture = data['profile_picture']
    if 'bio' in data:
        user.bio = data['bio']
    
    # Save changes
    db.session.commit()
    
    return jsonify({
        'message': 'User updated successfully',
        'user': user.to_dict()
    }), 200

@users_bp.route('/<int:user_id>/items', methods=['GET'])
def get_user_items(user_id):
    # Find user
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get query parameters
    status = request.args.get('status')
    
    # Base query
    query = Item.query.filter_by(user_id=user_id)
    
    # Apply status filter if provided
    if status:
        query = query.filter_by(status=status)
    
    # Get items
    items = query.all()
    
    return jsonify([item.to_dict() for item in items]), 200
