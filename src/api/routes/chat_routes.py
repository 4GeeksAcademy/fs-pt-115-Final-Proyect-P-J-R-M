from flask import Blueprint, request, jsonify
from models import db, Chat, User, Post

chat_bp = Blueprint('chat_bp', __name__, url_prefix="/chats")


@chat_bp.route('/<int:post_id>/<int:user_id>', methods=['GET'])
def get_chats(post_id, user_id):
    user = user_id
    post = post_id
    chats = Chat.query.filter(
        ((Chat.user_one == user) | (Chat.user_two == user)) & (Chat.post_id == post)
    ).all()

    if not chats:
        return jsonify({"msg": "No chats found for the given user and post"}), 404

    return jsonify([chat.serialize() for chat in chats]), 200


@chat_bp.route('/', methods=['POST'])
def create_chat():
    data = request.get_json()

    post_id = data.get('post_id')
    user_one = data.get('user_one')
    user_two = data.get('user_two')

    if not post_id or not user_one or not user_two:
        return jsonify({'msg': 'post_id, user_one, and user_two are required'}), 400

    post = Post.query.get(post_id)
    if not post:
        return jsonify({'msg': 'Post not found'}), 400

    user1 = User.query.get(user_one)
    user2 = User.query.get(user_two)
    if not user1 or not user2:
        return jsonify({'msg': 'One or both users not found'}), 400
    # comprobar que ya tengan un chat en marcha ???
    exist_chat = Chat.query.filter(
        ((Chat.user_one == user_one) & (Chat.user_two == user_two) |
         (Chat.user_one == user_two) & (Chat.user_two == user_one)) &
        (Chat.post_id == post_id)
    ).first()

    if exist_chat:
        return jsonify({'msg': 'Chat already exists'}), 400
    # -----------
    new_chat = Chat(
        user_one=user_one,
        user_two=user_two,
        post_id=post_id
    )
    db.session.add(new_chat)
    db.session.commit()

    return jsonify(new_chat.serialize()), 200
