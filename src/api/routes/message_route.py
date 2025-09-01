from flask import Blueprint, request, jsonify
from api.models import db, Message, Chat, User
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, jwt_required
message_bp = Blueprint('message_bp', __name__, url_prefix="/messages")

CORS(message_bp)


@message_bp.route('/<int:chat_for_id>', methods=['GET'])
@jwt_required()
def get_messages(chat_for_id):
    messages = Message.query.filter(Message.chat_id == chat_for_id).all()

    if not messages:
        return jsonify({"msg": "No messages found for this chat"}), 400

    return jsonify([msg.serialize() for msg in messages]), 200


@message_bp.route('/', methods=['POST'])
@jwt_required()
def create_message():
    data = request.get_json()

    chat_id = data.get('chat_id')
    user_id = get_jwt_identity()
    content = data.get('content')

    if not chat_id or not int(user_id) or not content:
        return jsonify({'msg': 'chat_id, user_id, and content are required'}), 400
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({'msg': 'Chat not found'}), 400

    # intento alerta por paseate de texto
    if len(content) > 255:
        return jsonify({'msg': 'Content exceeds 255 characters limit'}), 400

    new_message = Message(
        chat_id=chat_id,
        user_id=int(user_id),
        content=content
    )

    db.session.add(new_message)
    db.session.commit()

    return jsonify(new_message.serialize()), 200


@message_bp.route("/<int:message_id>", methods=["DELETE"])
@jwt_required()
def delete_post(message_id):
    message = Message.query.get(message_id)

    if not message:
        return jsonify({"msg": "Message not found"}), 400

    db.session.delete(message)
    db.session.commit()

    return jsonify({"msg": "Message deleted successfully"}), 200
