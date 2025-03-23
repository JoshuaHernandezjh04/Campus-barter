from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    profile_picture = db.Column(db.String(200), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    reputation_score = db.Column(db.Float, default=5.0)
    join_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    items = db.relationship('Item', backref='owner', lazy=True)
    initiated_trades = db.relationship('Trade', foreign_keys='Trade.initiator_id', backref='initiator', lazy=True)
    received_trades = db.relationship('Trade', foreign_keys='Trade.recipient_id', backref='recipient', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'profile_picture': self.profile_picture,
            'bio': self.bio,
            'reputation_score': self.reputation_score,
            'join_date': self.join_date.isoformat() if self.join_date else None
        }
