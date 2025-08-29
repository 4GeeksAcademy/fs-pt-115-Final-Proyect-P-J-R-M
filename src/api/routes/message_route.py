from flask import Blueprint, request, jsonify
from api.models import db, Message, Chat, User
from flask_cors import CORS

message_bp = Blueprint('message_bp', __name__, url_prefix="/messages")

CORS(message_bp)

@message_bp.route('/<int:chat_for_id>', methods=['GET'])
def get_messages(chat_for_id):
    messages = Message.query.filter( Message.chat_id == chat_for_id).all()

    if not messages:
        return jsonify({"msg": "No messages found for this chat"}), 400

    return jsonify([msg.serialize() for msg in messages]), 200

@message_bp.route('/', methods=['POST'])
def create_message():
    data = request.get_json()

    chat_id = data.get('chat_id')
    user_id = data.get('user_id')
    content = data.get('content')

    if not chat_id or not user_id or not content:
        return jsonify({'msg': 'chat_id, user_id, and content are required'}), 400
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({'msg': 'Chat not found'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 400
    #intento alerta por paseate de texto
    if len(content) > 500:
        return jsonify({'msg': 'Content exceeds 500 characters limit'}), 400
    
    new_message = Message(
        chat_id=chat_id,
        user_id=user_id,
        content=content
    )

    db.session.add(new_message)
    db.session.commit()

    return jsonify(new_message.serialize()), 200

@message_bp.route("/<int:message_id>", methods=["DELETE"])
def delete_post(message_id):
    chat = Chat.query.get(message_id)

    if not chat:
        return jsonify({"msg": "Chat not found"}), 400
    db.session.delete(chat)
    db.session.commit()

    return jsonify({"msg": "Chat deleted successfully"}), 200