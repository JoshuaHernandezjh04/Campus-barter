from app import db
from datetime import datetime

class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    initiator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected, completed
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    completion_date = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    items = db.relationship('TradeItem', backref='trade', lazy=True)
    messages = db.relationship('Message', backref='trade', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'initiator_id': self.initiator_id,
            'recipient_id': self.recipient_id,
            'status': self.status,
            'creation_date': self.creation_date.isoformat() if self.creation_date else None,
            'completion_date': self.completion_date.isoformat() if self.completion_date else None,
            'items': [item.to_dict() for item in self.items],
            'messages': [message.to_dict() for message in self.messages]
        }

class TradeItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    trade_id = db.Column(db.Integer, db.ForeignKey('trade.id'), nullable=False)
    offered_item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=True)
    requested_item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'trade_id': self.trade_id,
            'offered_item_id': self.offered_item_id,
            'requested_item_id': self.requested_item_id
        }
