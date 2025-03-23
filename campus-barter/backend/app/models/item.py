from app import db
from datetime import datetime

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    condition = db.Column(db.String(50), nullable=True)  # For physical items
    images = db.Column(db.Text, nullable=True)  # Comma-separated URLs or paths
    tags = db.Column(db.String(200), nullable=True)  # Comma-separated tags
    date_listed = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='available')  # available, pending, traded
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    offered_in_trades = db.relationship('TradeItem', foreign_keys='TradeItem.offered_item_id', backref='offered_item', lazy=True)
    requested_in_trades = db.relationship('TradeItem', foreign_keys='TradeItem.requested_item_id', backref='requested_item', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'condition': self.condition,
            'images': self.images.split(',') if self.images else [],
            'tags': self.tags.split(',') if self.tags else [],
            'date_listed': self.date_listed.isoformat() if self.date_listed else None,
            'status': self.status,
            'user_id': self.user_id
        }
