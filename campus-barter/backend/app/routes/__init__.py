from flask import Blueprint

# Import all blueprints
from app.routes.auth import auth_bp
from app.routes.items import items_bp
from app.routes.trades import trades_bp
from app.routes.users import users_bp
from app.routes.matching import matching_bp

# Import all routes here to make them available for imports elsewhere
