from flask import Blueprint, jsonify, request 
from flask_cors import CORS
from api.models import User, Post, Chat, db
from flask_jwt_extended import get_jwt_identity, jwt_required

favorites_bp = Blueprint("favorite", __name__, url_prefix="/favorites")
CORS(favorites_bp)


# FAVORITE POSTS

@favorites_bp.route('/post', methods=['GET'])
@jwt_required()
def get_favorite_posts():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"error": "User not found"}), 400

    active = request.args.get('active', default=None)
    if active and active.lower() == 'true':
        fav_posts = [post.serialize() for post in user.fav_post if post.is_active]
    else:
        fav_posts = [post.serialize() for post in user.fav_post]

    return jsonify({"fav_posts": fav_posts}), 200

@favorites_bp.route('/post', methods=['POST'])
@jwt_required()
def add_favorite_post():
    data = request.get_json()
    user_id = get_jwt_identity()
    post_id = data.get("post_id")

    user = User.query.get(int(user_id))
    post = Post.query.get(post_id)

    if not user or not post:
        return jsonify({"error": "User or Post not found"}), 400

    if not post.is_active:
        return jsonify({"error": "Post is not active"}), 400

    if post not in user.fav_post:
        user.fav_post.append(post)
        db.session.commit()

    return jsonify({"message": "Post added to favorites"}), 200

@favorites_bp.route('/post', methods=['DELETE'])
@jwt_required()
def deactivate_favorite_post():
    data = request.get_json()
    user_id = get_jwt_identity()
    post_id = data.get("post_id")

    user = User.query.get(int(user_id))
    post = Post.query.get(post_id)

    if not user or not post:
        return jsonify({"error": "User or Post not found"}), 404

    if post not in user.fav_post:
        return jsonify({"error": "Post is not in favorites"}), 400

    post.is_active = False
    db.session.commit()

    return jsonify({"message": "Post deactivated (removed from active favorites)"}), 200


# FAVORITE CHATS


@favorites_bp.route('/chat', methods=['GET'])
@jwt_required()
def get_favorite_chats():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"error": "User not found"}), 400

    active = request.args.get('active', default=None)
    if active and active.lower() == 'true':
        fav_chats = [chat.serialize() for chat in user.fav_chats if chat.is_active]
    else:
        fav_chats = [chat.serialize() for chat in user.fav_chats]

    return jsonify({"fav_chats": fav_chats}), 200

@favorites_bp.route('/chat', methods=['POST'])
@jwt_required()
def add_favorite_chat():
    data = request.get_json()
    user_id = get_jwt_identity()
    chat_id = data.get("chat_id")

    user = User.query.get(int(user_id))
    chat = Chat.query.get(chat_id)

    if not user or not chat:
        return jsonify({"error": "User or Chat not found"}), 400

    if not chat.is_active:
        return jsonify({"error": "Chat is not active"}), 400

    if chat not in user.fav_chats:
        user.fav_chats.append(chat)
        db.session.commit()

    return jsonify({"message": "Chat added to favorites"}), 200

@favorites_bp.route('/chat', methods=['DELETE'])
@jwt_required()
def deactivate_favorite_chat():
    data = request.get_json()
    user_id = get_jwt_identity()
    chat_id = data.get("chat_id")

    user = User.query.get(int(user_id))
    chat = Chat.query.get(chat_id)

    if not user or not chat:
        return jsonify({"error": "User or Chat not found"}), 400

    if chat not in user.fav_chats:
        return jsonify({"error": "Chat is not in favorites"}), 400

    chat.is_active = False
    db.session.commit()

    return jsonify({"message": "Chat deactivated (removed from active favorites)"}), 200
