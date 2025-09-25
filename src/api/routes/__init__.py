from flask import Flask, request, jsonify, url_for, Blueprint
from .user_routes import user_bp
from .post_route import post_bp
from .chat_routes import chat_bp
from .message_route import message_bp
from .favorites_routes import favorites_bp
from .support import support_bp

api = Blueprint("api", __name__)

api.register_blueprint(user_bp) 
api.register_blueprint(post_bp) 
api.register_blueprint(chat_bp) 
api.register_blueprint(message_bp) 
api.register_blueprint(favorites_bp) 
api.register_blueprint(support_bp)



