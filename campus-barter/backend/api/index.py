from flask import Flask
from flask_cors import CORS
from app import create_app

app = create_app()
CORS(app)

@app.route('/')
def home():
    return "Campus Barter API is running!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
