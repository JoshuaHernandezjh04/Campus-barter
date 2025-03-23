"""
Test data script for Campus Barter application
This script populates the database with sample data for testing
"""

from app import create_app, db
from app.models.user import User
from app.models.item import Item
from app.models.trade import Trade, TradeItem
from app.models.message import Message
from datetime import datetime, timedelta
import random

def create_test_data():
    # Create app context
    app = create_app()
    with app.app_context():
        # Clear existing data
        db.session.query(Message).delete()
        db.session.query(TradeItem).delete()
        db.session.query(Trade).delete()
        db.session.query(Item).delete()
        db.session.query(User).delete()
        db.session.commit()
        
        print("Creating test users...")
        # Create test users
        users = [
            User(
                name="John Smith",
                email="john@university.edu",
                bio="Computer Science major, interested in trading tech items",
                reputation_score=4.8,
                join_date=datetime.utcnow() - timedelta(days=60)
            ),
            User(
                name="Emily Johnson",
                email="emily@university.edu",
                bio="Business major looking for textbooks and study materials",
                reputation_score=4.5,
                join_date=datetime.utcnow() - timedelta(days=45)
            ),
            User(
                name="Michael Brown",
                email="michael@university.edu",
                bio="Engineering student with lots of electronics to trade",
                reputation_score=4.9,
                join_date=datetime.utcnow() - timedelta(days=30)
            ),
            User(
                name="Sarah Davis",
                email="sarah@university.edu",
                bio="Art major with supplies to trade",
                reputation_score=4.7,
                join_date=datetime.utcnow() - timedelta(days=20)
            )
        ]
        
        # Set passwords
        for user in users:
            user.set_password("password123")
            db.session.add(user)
        
        db.session.commit()
        
        print("Creating test items...")
        # Create test items
        items = [
            # John's items
            Item(
                title="Calculus Textbook",
                description="Calculus: Early Transcendentals, 8th Edition. Good condition with minimal highlighting.",
                category="Textbooks",
                condition="Good",
                images="calculus_book.jpg",
                tags="math,textbook,calculus",
                user_id=users[0].id
            ),
            Item(
                title="Python Programming Tutoring",
                description="Offering Python programming tutoring, 1 hour sessions.",
                category="Services",
                tags="programming,python,tutoring",
                user_id=users[0].id
            ),
            
            # Emily's items
            Item(
                title="Marketing Textbook",
                description="Marketing Management, 15th Edition. Like new condition.",
                category="Textbooks",
                condition="Like New",
                images="marketing_book.jpg",
                tags="business,textbook,marketing",
                user_id=users[1].id
            ),
            Item(
                title="Desk Lamp",
                description="Adjustable desk lamp, perfect for studying. White color.",
                category="Furniture",
                condition="Good",
                images="desk_lamp.jpg",
                tags="lamp,furniture,study",
                user_id=users[1].id
            ),
            
            # Michael's items
            Item(
                title="TI-84 Calculator",
                description="Texas Instruments TI-84 Plus graphing calculator. Works perfectly.",
                category="Electronics",
                condition="Good",
                images="calculator.jpg",
                tags="calculator,electronics,math",
                user_id=users[2].id
            ),
            Item(
                title="Arduino Starter Kit",
                description="Arduino Uno R3 starter kit with components. Used for one project only.",
                category="Electronics",
                condition="Very Good",
                images="arduino.jpg",
                tags="arduino,electronics,programming",
                user_id=users[2].id
            ),
            
            # Sarah's items
            Item(
                title="Art Supplies Bundle",
                description="Bundle of art supplies including brushes, paints, and sketchpad.",
                category="Other",
                condition="Various",
                images="art_supplies.jpg",
                tags="art,supplies,creative",
                user_id=users[3].id
            ),
            Item(
                title="Graphic Design Help",
                description="Offering help with graphic design projects, logo design, etc.",
                category="Services",
                tags="design,graphics,creative",
                user_id=users[3].id
            )
        ]
        
        for item in items:
            db.session.add(item)
        
        db.session.commit()
        
        print("Creating test trades...")
        # Create test trades
        trades = [
            # Trade between John and Emily
            Trade(
                initiator_id=users[0].id,
                recipient_id=users[1].id,
                status="completed",
                creation_date=datetime.utcnow() - timedelta(days=15),
                completion_date=datetime.utcnow() - timedelta(days=10)
            ),
            
            # Trade between Michael and Sarah
            Trade(
                initiator_id=users[2].id,
                recipient_id=users[3].id,
                status="pending",
                creation_date=datetime.utcnow() - timedelta(days=5)
            )
        ]
        
        for trade in trades:
            db.session.add(trade)
        
        db.session.commit()
        
        print("Creating trade items...")
        # Create trade items
        trade_items = [
            # John offers Calculus book for Emily's Marketing book
            TradeItem(
                trade_id=trades[0].id,
                offered_item_id=items[0].id
            ),
            TradeItem(
                trade_id=trades[0].id,
                requested_item_id=items[2].id
            ),
            
            # Michael offers Arduino kit for Sarah's art supplies
            TradeItem(
                trade_id=trades[1].id,
                offered_item_id=items[5].id
            ),
            TradeItem(
                trade_id=trades[1].id,
                requested_item_id=items[6].id
            )
        ]
        
        for trade_item in trade_items:
            db.session.add(trade_item)
        
        db.session.commit()
        
        print("Creating messages...")
        # Create messages
        messages = [
            # Messages for trade 1
            Message(
                trade_id=trades[0].id,
                sender_id=users[0].id,
                content="Hi Emily, I'm interested in your Marketing textbook. Would you like to trade for my Calculus book?",
                timestamp=datetime.utcnow() - timedelta(days=15, hours=2)
            ),
            Message(
                trade_id=trades[0].id,
                sender_id=users[1].id,
                content="Hi John, that sounds good! When can we meet to exchange?",
                timestamp=datetime.utcnow() - timedelta(days=15, hours=1)
            ),
            Message(
                trade_id=trades[0].id,
                sender_id=users[0].id,
                content="How about tomorrow at the library around 3pm?",
                timestamp=datetime.utcnow() - timedelta(days=14, hours=23)
            ),
            Message(
                trade_id=trades[0].id,
                sender_id=users[1].id,
                content="Perfect, see you then!",
                timestamp=datetime.utcnow() - timedelta(days=14, hours=22)
            ),
            
            # Messages for trade 2
            Message(
                trade_id=trades[1].id,
                sender_id=users[2].id,
                content="Hey Sarah, I'm interested in your art supplies. Would you like to trade for my Arduino kit?",
                timestamp=datetime.utcnow() - timedelta(days=5, hours=3)
            ),
            Message(
                trade_id=trades[1].id,
                sender_id=users[3].id,
                content="Hi Michael, I might be interested. Can you tell me more about what's included in the Arduino kit?",
                timestamp=datetime.utcnow() - timedelta(days=5, hours=2)
            ),
            Message(
                trade_id=trades[1].id,
                sender_id=users[2].id,
                content="It includes an Arduino Uno board, breadboard, jumper wires, resistors, LEDs, and a few sensors. It's perfect for beginners!",
                timestamp=datetime.utcnow() - timedelta(days=4, hours=12)
            )
        ]
        
        for message in messages:
            db.session.add(message)
        
        db.session.commit()
        
        print("Test data created successfully!")

if __name__ == "__main__":
    create_test_data()
