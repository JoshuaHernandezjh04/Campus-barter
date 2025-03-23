from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.trade import Trade, TradeItem
from app.models.item import Item
from app.models.message import Message
from app import db
from datetime import datetime

trades_bp = Blueprint('trades', __name__, url_prefix='/api/trades')

@trades_bp.route('', methods=['GET'])
@jwt_required()
def get_trades():
    # Get user ID from JWT
    user_id = get_jwt_identity()
    
    # Get query parameters
    status = request.args.get('status')
    
    # Base query - get trades where user is either initiator or recipient
    query = Trade.query.filter(
        (Trade.initiator_id == user_id) | (Trade.recipient_id == user_id)
    )
    
    # Apply status filter if provided
    if status:
        query = query.filter_by(status=status)
    
    # Get trades
    trades = query.all()
    
    return jsonify([trade.to_dict() for trade in trades]), 200

@trades_bp.route('/<int:trade_id>', methods=['GET'])
@jwt_required()
def get_trade(trade_id):
    # Get user ID from JWT
    user_id = get_jwt_identity()
    
    # Find trade
    trade = Trade.query.get(trade_id)
    
    if not trade:
        return jsonify({'error': 'Trade not found'}), 404
    
    # Check if user is part of the trade
    if trade.initiator_id != user_id and trade.recipient_id != user_id:
        return jsonify({'error': 'Not authorized to view this trade'}), 403
    
    return jsonify(trade.to_dict()), 200

@trades_bp.route('', methods=['POST'])
@jwt_required()
def create_trade():
    # Get user ID from JWT
    user_id = get_jwt_identity()
    
    # Get request data
    data = request.get_json()
    
    # Check if required fields are present
    if not all(k in data for k in ('recipient_id', 'offered_items', 'requested_items')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Create new trade
    new_trade = Trade(
        initiator_id=user_id,
        recipient_id=data['recipient_id']
    )
    
    # Add to database
    db.session.add(new_trade)
    db.session.flush()  # Get ID without committing
    
    # Add offered items
    for item_id in data['offered_items']:
        # Verify item exists and belongs to user
        item = Item.query.get(item_id)
        if not item or item.user_id != user_id:
            db.session.rollback()
            return jsonify({'error': f'Invalid offered item: {item_id}'}), 400
        
        # Add to trade
        trade_item = TradeItem(
            trade_id=new_trade.id,
            offered_item_id=item_id
        )
        db.session.add(trade_item)
    
    # Add requested items
    for item_id in data['requested_items']:
        # Verify item exists and belongs to recipient
        item = Item.query.get(item_id)
        if not item or item.user_id != data['recipient_id']:
            db.session.rollback()
            return jsonify({'error': f'Invalid requested item: {item_id}'}), 400
        
        # Add to trade
        trade_item = TradeItem(
            trade_id=new_trade.id,
            requested_item_id=item_id
        )
        db.session.add(trade_item)
    
    # Add initial message if provided
    if 'message' in data and data['message']:
        message = Message(
            trade_id=new_trade.id,
            sender_id=user_id,
            content=data['message']
        )
        db.session.add(message)
    
    # Commit changes
    db.session.commit()
    
    return jsonify({
        'message': 'Trade created successfully',
        'trade': new_trade.to_dict()
    }), 201

@trades_bp.route('/<int:trade_id>', methods=['PUT'])
@jwt_required()
def update_trade_status(trade_id):
    # Get user ID from JWT
    user_id = get_jwt_identity()
    
    # Find trade
    trade = Trade.query.get(trade_id)
    
    if not trade:
        return jsonify({'error': 'Trade not found'}), 404
    
    # Get request data
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'error': 'Missing status field'}), 400
    
    new_status = data['status']
    
    # Validate status transition
    valid_statuses = ['pending', 'accepted', 'rejected', 'completed']
    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    
    # Check authorization based on status change
    if new_status == 'accepted' or new_status == 'rejected':
        # Only recipient can accept or reject
        if trade.recipient_id != user_id:
            return jsonify({'error': 'Not authorized to update this trade'}), 403
    elif new_status == 'completed':
        # Either party can mark as completed
        if trade.initiator_id != user_id and trade.recipient_id != user_id:
            return jsonify({'error': 'Not authorized to update this trade'}), 403
    
    # Update status
    trade.status = new_status
    
    # Set completion date if completed
    if new_status == 'completed':
        trade.completion_date = datetime.utcnow()
    
    # Save changes
    db.session.commit()
    
    return jsonify({
        'message': 'Trade status updated successfully',
        'trade': trade.to_dict()
    }), 200

@trades_bp.route('/<int:trade_id>/messages', methods=['POST'])
@jwt_required()
def add_message(trade_id):
    # Get user ID from JWT
    user_id = get_jwt_identity()
    
    # Find trade
    trade = Trade.query.get(trade_id)
    
    if not trade:
        return jsonify({'error': 'Trade not found'}), 404
    
    # Check if user is part of the trade
    if trade.initiator_id != user_id and trade.recipient_id != user_id:
        return jsonify({'error': 'Not authorized to message in this trade'}), 403
    
    # Get request data
    data = request.get_json()
    
    if 'content' not in data or not data['content']:
        return jsonify({'error': 'Message content is required'}), 400
    
    # Create new message
    new_message = Message(
        trade_id=trade_id,
        sender_id=user_id,
        content=data['content']
    )
    
    # Add to database
    db.session.add(new_message)
    db.session.commit()
    
    return jsonify({
        'message': 'Message sent successfully',
        'trade_message': new_message.to_dict()
    }), 201
