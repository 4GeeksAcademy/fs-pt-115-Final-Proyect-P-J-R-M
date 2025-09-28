from flask import Blueprint, request, jsonify
from api.models import db, Chat, User, Post
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, jwt_required

chat_bp = Blueprint("chat_bp", __name__, url_prefix="/chats")
CORS(chat_bp)


@chat_bp.route("/<int:post_id>", methods=["GET"])
@jwt_required()
def get_chats(post_id):
    user_id = get_jwt_identity()

    chats = Chat.query.filter(
        ((Chat.user_one == int(user_id)) | (Chat.user_two == int(user_id)))
        & (Chat.post_id == post_id)
        & (Chat.is_active == True)
    ).all()

    if not chats:
        return jsonify({"msg": "No chats found for the given user and post"}), 404

    return jsonify([chat.serialize() for chat in chats]), 200


@chat_bp.route("/", methods=["POST"])
@jwt_required()
def create_chat():
    data = request.get_json()

    post_id = data.get("post_id")
    user_one = data.get("user_one")
    user_two = data.get("user_two")

    if not post_id or not user_one or not user_two:
        return jsonify({"msg": "post_id, user_one, and user_two are required"}), 400

    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "Post not found"}), 400

    user1 = User.query.get(user_one)
    user2 = User.query.get(user_two)
    if not user1 or not user2:
        return jsonify({"msg": "One or both users not found"}), 400

    exist_chat = Chat.query.filter(
        (
            ((Chat.user_one == user_one) & (Chat.user_two == user_two))
            | ((Chat.user_one == user_two) & (Chat.user_two == user_one))
        )
        & (Chat.post_id == post_id)
        & (Chat.is_active == True)
    ).first()

    if exist_chat:
        return jsonify({"msg": "Chat already exists"}), 400

    new_chat = Chat(user_one=user_one, user_two=user_two, post_id=post_id)
    db.session.add(new_chat)
    db.session.commit()

    return jsonify(new_chat.serialize()), 200


@chat_bp.route("/<int:chat_for_id>", methods=["DELETE"])
@jwt_required()
def delete_post(chat_for_id):
    chat = Chat.query.get(chat_for_id)

    if not chat or not chat.is_active:
        return jsonify({"msg": "Chat not found or already inactive"}), 400

    # Soft delete using the deactivate method
    chat.deactivate()
    db.session.commit()

    return jsonify({"msg": "Chat deactivated successfully"}), 200
