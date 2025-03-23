from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.item import Item
from app import db

items_bp = Blueprint('items', __name__, url_prefix='/api/items')

@items_bp.route('', methods=['GET'])
def get_items():
    # Get query parameters for filtering
    category = request.args.get('category')
    status = request.args.get('status', 'available')
    
    # Base query
    query = Item.query.filter_by(status=status)
    
    # Apply category filter if provided
    if category:
        query = query.filter_by(category=category)
    
    # Get items
    items = query.all()
    
    return jsonify([item.to_dict() for item in items]), 200

@items_bp.route('/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = Item.query.get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    return jsonify(item.to_dict()), 200

@items_bp.route('', methods=['POST'])
@jwt_required()
def create_item():
    # Get user ID from JWT
    user_id = get_jwt_identity()
    
    # Get request data
    data = request.get_json()
    
    # Check if required fields are present
    if not all(k in data for k in ('title', 'description', 'category')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Create new item
    new_item = Item(
        title=data['title'],
        description=data['description'],
        category=data['category'],
        condition=data.get('condition'),
        images=','.join(data.get('images', [])) if data.get('images') else None,
        tags=','.join(data.get('tags', [])) if data.get('tags') else None,
        user_id=user_id
    )
    
    # Add to database
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({
        'message': 'Item created successfully',
        'item': new_item.to_dict()
    }), 201

@items_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_item(item_id):
    # Get user ID from JWT
    user_id = get_jwt_identity()
    
    # Find item
    item = Item.query.get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    # Check if user owns the item
    if item.user_id != user_id:
        return jsonify({'error': 'Not authorized to update this item'}), 403
    
    # Get request data
    data = request.get_json()
    
    # Update item fields
    if 'title' in data:
        item.title = data['title']
    if 'description' in data:
        item.description = data['description']
    if 'category' in data:
        item.category = data['category']
    if 'condition' in data:
        item.condition = data['condition']
    if 'images' in data:
        item.images = ','.join(data['images']) if data['images'] else None
    if 'tags' in data:
        item.tags = ','.join(data['tags']) if data['tags'] else None
    if 'status' in data:
        item.status = data['status']
    
    # Save changes
    db.session.commit()
    
    return jsonify({
        'message': 'Item updated successfully',
        'item': item.to_dict()
    }), 200

@items_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    # Get user ID from JWT
    user_id = get_jwt_identity()
    
    # Find item
    item = Item.query.get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    # Check if user owns the item
    if item.user_id != user_id:
        return jsonify({'error': 'Not authorized to delete this item'}), 403
    
    # Delete item
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({
        'message': 'Item deleted successfully'
    }), 200

@items_bp.route('/categories', methods=['GET'])
def get_categories():
    # This could be expanded to fetch categories from database
    # For now, return a static list
    categories = [
        'Textbooks',
        'Electronics',
        'Furniture',
        'Clothing',
        'Services',
        'Food',
        'Other'
    ]
    
    return jsonify(categories), 200
