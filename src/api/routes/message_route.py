from flask import Blueprint, request, jsonify
from api.models import db, Message, Chat, User
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, jwt_required

message_bp = Blueprint('message_bp', __name__, url_prefix="/messages")
CORS(message_bp)


@message_bp.route('/<int:chat_for_id>', methods=['GET'])
@jwt_required()
def get_messages(chat_for_id):
    messages = Message.query.filter_by(chat_id=chat_for_id, is_active=True).all()

    if not messages:
        return jsonify({"msg": "No messages found for this chat"}), 404

    return jsonify([msg.serialize() for msg in messages]), 200


@message_bp.route('/', methods=['POST'])
@jwt_required()
def create_message():
    data = request.get_json()

    chat_id = data.get('chat_id')
    content = data.get('content')
    user_id = get_jwt_identity()

    if not chat_id or not content:
        return jsonify({'msg': 'chat_id and content are required'}), 400

    if len(content) > 255:
        return jsonify({'msg': 'Content exceeds 255 characters limit'}), 400

    chat = Chat.query.get(chat_id)
    if not chat or not chat.is_active:
        return jsonify({'msg': 'Chat not found or inactive'}), 404

    new_message = Message(
        chat_id=chat_id,
        user_id=int(user_id),
        content=content
    )

    db.session.add(new_message)
    db.session.commit()

    return jsonify(new_message.serialize()), 201


@message_bp.route("/<int:message_id>", methods=["DELETE"])
@jwt_required()
def delete_message(message_id):
    user_id = get_jwt_identity()
    message = Message.query.get(message_id)

    if not message or not message.is_active:
        return jsonify({"msg": "Message not found or already inactive"}), 404

    if message.user_id != int(user_id):
        return jsonify({"msg": "Unauthorized to delete this message"}), 403

    message.is_active = False
    db.session.commit()

    return jsonify({"msg": "Message marked as inactive"}), 200
