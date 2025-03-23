import unittest
import json
from app import create_app, db
from app.models.user import User
from app.models.item import Item
from app.models.trade import Trade

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.app = create_app(testing=True)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Create test users
        self.test_user1 = User(
            name="Test User 1",
            email="test1@example.com",
            password_hash=User.generate_hash("password123")
        )
        self.test_user2 = User(
            name="Test User 2",
            email="test2@example.com",
            password_hash=User.generate_hash("password123")
        )
        db.session.add(self.test_user1)
        db.session.add(self.test_user2)
        db.session.commit()
        
        # Create test items
        self.test_item1 = Item(
            title="Test Item 1",
            description="This is a test item 1",
            category="Books",
            condition="Good",
            user_id=self.test_user1.id
        )
        self.test_item2 = Item(
            title="Test Item 2",
            description="This is a test item 2",
            category="Electronics",
            condition="Like New",
            user_id=self.test_user2.id
        )
        db.session.add(self.test_item1)
        db.session.add(self.test_item2)
        db.session.commit()
        
        # Get auth tokens
        response = self.client.post('/api/auth/login', json={
            'email': 'test1@example.com',
            'password': 'password123'
        })
        self.user1_token = json.loads(response.data)['token']
        
        response = self.client.post('/api/auth/login', json={
            'email': 'test2@example.com',
            'password': 'password123'
        })
        self.user2_token = json.loads(response.data)['token']

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_user_registration(self):
        response = self.client.post('/api/auth/register', json={
            'name': 'New User',
            'email': 'newuser@example.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('token', data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['email'], 'newuser@example.com')

    def test_user_login(self):
        response = self.client.post('/api/auth/login', json={
            'email': 'test1@example.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('token', data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['email'], 'test1@example.com')

    def test_get_user_profile(self):
        response = self.client.get(
            f'/api/users/{self.test_user1.id}',
            headers={'Authorization': f'Bearer {self.user1_token}'}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['id'], self.test_user1.id)
        self.assertEqual(data['name'], 'Test User 1')
        self.assertEqual(data['email'], 'test1@example.com')

    def test_create_item(self):
        response = self.client.post(
            '/api/items',
            json={
                'title': 'New Item',
                'description': 'This is a new item',
                'category': 'Clothing',
                'condition': 'New'
            },
            headers={'Authorization': f'Bearer {self.user1_token}'}
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'New Item')
        self.assertEqual(data['user_id'], self.test_user1.id)

    def test_get_items(self):
        response = self.client.get('/api/items')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 2)

    def test_get_item_by_id(self):
        response = self.client.get(f'/api/items/{self.test_item1.id}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['id'], self.test_item1.id)
        self.assertEqual(data['title'], 'Test Item 1')

    def test_update_item(self):
        response = self.client.put(
            f'/api/items/{self.test_item1.id}',
            json={
                'title': 'Updated Item',
                'description': 'This is an updated item',
                'category': 'Books',
                'condition': 'Good'
            },
            headers={'Authorization': f'Bearer {self.user1_token}'}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'Updated Item')
        self.assertEqual(data['description'], 'This is an updated item')

    def test_delete_item(self):
        response = self.client.delete(
            f'/api/items/{self.test_item1.id}',
            headers={'Authorization': f'Bearer {self.user1_token}'}
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify item is deleted
        response = self.client.get(f'/api/items/{self.test_item1.id}')
        self.assertEqual(response.status_code, 404)

    def test_create_trade(self):
        response = self.client.post(
            '/api/trades',
            json={
                'offered_items': [self.test_item1.id],
                'requested_items': [self.test_item2.id]
            },
            headers={'Authorization': f'Bearer {self.user1_token}'}
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['initiator_id'], self.test_user1.id)
        self.assertEqual(data['recipient_id'], self.test_user2.id)
        self.assertEqual(data['status'], 'pending')

    def test_get_user_trades(self):
        # First create a trade
        self.client.post(
            '/api/trades',
            json={
                'offered_items': [self.test_item1.id],
                'requested_items': [self.test_item2.id]
            },
            headers={'Authorization': f'Bearer {self.user1_token}'}
        )
        
        # Get user trades
        response = self.client.get(
            '/api/trades',
            headers={'Authorization': f'Bearer {self.user1_token}'}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)

    def test_get_trade_by_id(self):
        # First create a trade
        response = self.client.post(
            '/api/trades',
            json={
                'offered_items': [self.test_item1.id],
                'requested_items': [self.test_item2.id]
            },
            headers={'Authorization': f'Bearer {self.user1_token}'}
        )
        trade_id = json.loads(response.data)['id']
        
        # Get trade by ID
        response = self.client.get(
            f'/api/trades/{trade_id}',
            headers={'Authorization': f'Bearer {self.user1_token}'}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['id'], trade_id)
        self.assertEqual(data['initiator_id'], self.test_user1.id)
        self.assertEqual(data['recipient_id'], self.test_user2.id)

    def test_update_trade_status(self):
        # First create a trade
        response = self.client.post(
            '/api/trades',
            json={
                'offered_items': [self.test_item1.id],
                'requested_items': [self.test_item2.id]
            },
            headers={'Authorization': f'Bearer {self.user1_token}'}
        )
        trade_id = json.loads(response.data)['id']
        
        # Update trade status (accept)
        response = self.client.put(
            f'/api/trades/{trade_id}/status',
            json={'status': 'accepted'},
            headers={'Authorization': f'Bearer {self.user2_token}'}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'accepted')

    def test_search_items(self):
        response = self.client.get('/api/items/search?q=test')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 2)

    def test_get_item_categories(self):
        response = self.client.get('/api/items/categories')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertIn('Books', data)
        self.assertIn('Electronics', data)

if __name__ == '__main__':
    unittest.main()
