from flask import Blueprint, jsonify,request 
from flask_cors import CORS
from api.models import  User, Post, Chat , db
from flask_jwt_extended import  get_jwt_identity, jwt_required
favorites_bp=Blueprint("favorite",__name__, url_prefix="/favorites")


CORS(favorites_bp)

@favorites_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_favorites():
    user_id=get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"error": "User not found"}), 400

    return jsonify({
        "fav_posts": [post.serialize() for post in user.fav_post],
        "fav_chats": [chat.serialize() for chat in user.fav_chats]
    }), 200


#post
@favorites_bp.route('/post', methods=['POST'])
@jwt_required()
def add_favorite_post():
    data = request.get_json()
    user_id=get_jwt_identity()
    post_id= data.get("post_id")

    user = User.query.get(int(user_id))
    post = Post.query.get(post_id)

    if not user or not post:
        return jsonify({"error":"User or Post not found"}),400
    if post not in user.fav_post:
        user.fav_post.append(post)
        db.session.commit()
    
    return jsonify({"message": "Post added to favorites"}), 200

@favorites_bp.route('/post', methods=['DELETE'])
@jwt_required()
def remove_favorite_post():
    data = request.get_json()
    user_id=get_jwt_identity()
    post_id= data.get("post_id")

    user = User.query.get(int(user_id))
    post = Post.query.get(post_id)

    

    if not user or not post:
        return jsonify({"error": "User or Post not found"}), 404

    if post in user.fav_post:
        user.fav_post.remove(post)
        db.session.commit()

    return jsonify({"message": "Post removed from favorites"}), 200

#chat
@favorites_bp.route('/chat', methods=['POST'])
@jwt_required()
def add_favorite_chat():
    data = request.get_json()
    user_id=get_jwt_identity()
    chat_id = data.get("chat_id")

    user = User.query.get(int(user_id))
    chat = Chat.query.get(chat_id)

    if not user or not chat:
        return jsonify({"error": "User or Chat not found"}), 400

    if chat not in user.fav_chats:
        user.fav_chats.append(chat)
        db.session.commit()

    return jsonify({"message": "Chat added to favorites"}), 200

@favorites_bp.route('/chat', methods=['DELETE'])
@jwt_required()
def remove_favorite_chat():
    data = request.get_json()
    user_id=get_jwt_identity()
    chat_id = data.get("chat_id")

    user = User.query.get(int(user_id))
    chat = Chat.query.get(chat_id)

    if not user or not chat:
        return jsonify({"error": "User or Chat not found"}), 400

    if chat in user.fav_chats:
        user.fav_chats.remove(chat)
        db.session.commit()

    return jsonify({"message": "Chat removed from favorites"}), 200


