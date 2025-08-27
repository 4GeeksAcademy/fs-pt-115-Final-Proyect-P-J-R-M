from flask import Flask, request, jsonify, url_for, Blueprint
from .user_routes import user_bp
from .post_route import post_bp

api= Blueprint("api",__name__)

api.register_blueprint(user_bp)
api.register_blueprint(post_bp)