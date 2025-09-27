# api/sockets/handlers.py
from typing import Optional, Dict, List, Any
from flask import request
from flask_socketio import emit, join_room
from api.models import db, Chat, Message
from flask_jwt_extended import decode_token

# sid -> user_id
_sid_user: Dict[str, int] = {}


def _get_user_id_from_token(token: str, app=None) -> Optional[int]:
    try:
        if app is not None:
            with app.app_context():
                data = decode_token(token)
        else:
            data = decode_token(token)
        identity = data.get("sub") or data.get("identity")
        return int(identity)
    except Exception:
        return None


def _user_chats(user_id: int) -> List[Chat]:

    return Chat.query.filter(
        ((Chat.user_one == user_id) | (Chat.user_two == user_id))
        & (Chat.is_active.is_(True))
    ).all()


def _is_in_chat(user_id: int, chat: Chat) -> bool:
    return user_id in {chat.user_one, chat.user_two}


def _serialize_chat(chat: Chat) -> Dict[str, Any]:
    return {
        "id": chat.id,
        "user_one": chat.user_one,
        "user_two": chat.user_two,
        "post_id": chat.post_id,
        "is_active": bool(chat.is_active),
    }


def register_socket_handlers(socketio, app):

    @socketio.on("connect")
    def on_connect():
        print("[connect]", request.sid)

    @socketio.on("disconnect")
    def on_disconnect():
        _sid_user.pop(request.sid, None)
        print("[disconnect]", request.sid)

    # -------------------- AUTH / ROOMS --------------------

    @socketio.on("identify")
    def handle_identify(data):
        token = (data or {}).get("token")
        user_id = _get_user_id_from_token(token, app) if token else None
        if not user_id:
            emit("error", {"msg": "identify: token inválido"})
            print(f"[identify][error] sid={request.sid} token inválido")
            return

        _sid_user[request.sid] = user_id

        with app.app_context():
            chats = _user_chats(user_id)

        rooms = [f"chat:{c.id}" for c in chats]
        for room in rooms:
            join_room(room)

        emit("identified", {"user_id": user_id, "joined_rooms": rooms})
        print(f"[identify] sid={request.sid} user_id={user_id} rooms={rooms}")

    @socketio.on("join_chat")
    def handle_join_chat(data):
        user_id = _sid_user.get(request.sid)
        if not user_id:
            emit("error", {"msg": "No identificado"})
            return
        try:
            chat_id = int((data or {}).get("chat_id"))
        except Exception:
            emit("error", {"msg": "join_chat: payload inválido"})
            return

        with app.app_context():
            chat = Chat.query.get(chat_id)
            if not chat:
                emit("error", {"msg": "El chat no existe"})
                return
            if not _is_in_chat(user_id, chat):
                emit("error", {"msg": "No perteneces a este chat"})
                return
            if not chat.is_active:
                emit("error", {"msg": "El chat está inactivo"})
                return

        room = f"chat:{chat_id}"
        join_room(room)
        emit("joined_chat", {"chat_id": chat_id})
        print(f"[join_chat] user_id={user_id} -> {room}")

    # -------------------- MENSAJERÍA --------------------

    @socketio.on("private_message")
    def handle_private_message(data):
        user_id = _sid_user.get(request.sid)
        if not user_id:
            emit("error", {"msg": "No identificado"})
            print(f"[pm][error] sid={request.sid} no identificado")
            return

        try:
            chat_id = int((data or {}).get("chat_id"))
            content = ((data or {}).get("content") or "").strip()
        except (TypeError, ValueError):
            emit("error", {"msg": "private_message: payload inválido"})
            print(f"[pm][error] sid={request.sid} payload inválido: {data!r}")
            return

        if not content:
            print(f"[pm][skip] sid={request.sid} mensaje vacío")
            return

        with app.app_context():
            chat = Chat.query.get(chat_id)
            if not chat:
                emit("error", {"msg": "El chat no existe"})
                print(f"[pm][error] sid={request.sid} chat_id={chat_id} no existe")
                return
            if not _is_in_chat(user_id, chat):
                emit("error", {"msg": "No perteneces a este chat"})
                print(
                    f"[pm][error] sid={request.sid} user_id={user_id} no en chat_id={chat_id}"
                )
                return
            if not chat.is_active:
                emit("error", {"msg": "El chat está inactivo"})
                return

            msg = Message(chat_id=chat_id, user_id=user_id, content=content)
            db.session.add(msg)
            db.session.commit()

            payload = {
                "id": msg.id,
                "chat_id": msg.chat_id,
                "user_id": msg.user_id,
                "content": msg.content,
            }

        emit("new_message", payload, room=f"chat:{chat_id}")
        print(f"[pm] user_id={user_id} -> chat_id={chat_id} content='{content[:80]}'")

    @socketio.on("get_messages")
    def handle_get_messages(data):
        """
        data = { chat_id: int, limit?: int=50, before_id?: int }
        Devuelve mensajes ordenados ASC por id. Paginación por before_id.
        """
        user_id = _sid_user.get(request.sid)
        if not user_id:
            emit("error", {"msg": "No identificado"})
            return
        try:
            chat_id = int((data or {}).get("chat_id"))
            limit = int((data or {}).get("limit") or 50)
            before_id = (data or {}).get("before_id")
            before_id = int(before_id) if before_id is not None else None
        except Exception:
            emit("error", {"msg": "get_messages: payload inválido"})
            return

        limit = max(1, min(limit, 200))

        with app.app_context():
            chat = Chat.query.get(chat_id)
            if not chat:
                emit("error", {"msg": "El chat no existe"})
                return
            if not _is_in_chat(user_id, chat):
                emit("error", {"msg": "No perteneces a este chat"})
                return
            if not chat.is_active:
                emit("error", {"msg": "El chat está inactivo"})
                return

            q = Message.query.filter(Message.chat_id == chat_id)
            if before_id is not None:
                q = q.filter(Message.id < before_id)
            msgs = q.order_by(Message.id.desc()).limit(limit).all()
            msgs = list(reversed(msgs))

            payload = [
                {
                    "id": m.id,
                    "chat_id": m.chat_id,
                    "user_id": m.user_id,
                    "content": m.content,
                }
                for m in msgs
            ]

        emit(
            "messages",
            {
                "chat_id": chat_id,
                "items": payload,
                "next_before_id": payload[0]["id"] if payload else None,
            },
        )

    @socketio.on("typing")
    def handle_typing(data):
        """
        data = { chat_id: int, is_typing: bool }
        Notifica al resto de la sala (efímero).
        """
        user_id = _sid_user.get(request.sid)
        if not user_id:
            emit("error", {"msg": "No identificado"})
            return
        try:
            chat_id = int((data or {}).get("chat_id"))
            is_typing = bool((data or {}).get("is_typing"))
        except Exception:
            emit("error", {"msg": "typing: payload inválido"})
            return

        with app.app_context():
            chat = Chat.query.get(chat_id)
            if not chat or not _is_in_chat(user_id, chat):
                return
            if not chat.is_active:
                return

        emit(
            "typing",
            {"chat_id": chat_id, "user_id": user_id, "is_typing": is_typing},
            room=f"chat:{chat_id}",
            include_self=False,
        )

    @socketio.on("read_messages")
    def handle_read_messages(data):
        """
        data = { chat_id: int, up_to_id: int }
        Emite acuse de lectura efímero (no persistente porque tu modelo no lo soporta).
        """
        user_id = _sid_user.get(request.sid)
        if not user_id:
            emit("error", {"msg": "No identificado"})
            return
        try:
            chat_id = int((data or {}).get("chat_id"))
            up_to_id = int((data or {}).get("up_to_id"))
        except Exception:
            emit("error", {"msg": "read_messages: payload inválido"})
            return

        with app.app_context():
            chat = Chat.query.get(chat_id)
            if not chat or not _is_in_chat(user_id, chat):
                return
            if not chat.is_active:
                return

        emit(
            "messages_read",
            {"chat_id": chat_id, "user_id": user_id, "up_to_id": up_to_id},
            room=f"chat:{chat_id}",
            include_self=False,
        )

    # -------------------- UTILIDADES --------------------

    @socketio.on("list_chats")
    def handle_list_chats():
        """
        Devuelve los chats del usuario autenticado.
        """
        user_id = _sid_user.get(request.sid)
        if not user_id:
            emit("error", {"msg": "No identificado"})
            return

        with app.app_context():
            chats = _user_chats(user_id)
            payload = [_serialize_chat(c) for c in chats]

        emit("chats", payload)

    @socketio.on("create_chat")
    def handle_create_chat(data):
        """
        data = { user_two: int, post_id: int }
        Crea un chat si no existe (user_one=user_actual, user_two, post_id).
        Evita duplicados en cualquier orden (one-two vs two-one).
        """
        user_one = _sid_user.get(request.sid)
        if not user_one:
            emit("error", {"msg": "No identificado"})
            return
        try:
            user_two = int((data or {}).get("user_two"))
            post_id = int((data or {}).get("post_id"))
        except Exception:
            emit("error", {"msg": "create_chat: payload inválido"})
            return

        if user_two == user_one:
            emit("error", {"msg": "No puedes crear un chat contigo mismo"})
            return

        with app.app_context():
            existing = Chat.query.filter(
                Chat.post_id == post_id,
                ((Chat.user_one == user_one) & (Chat.user_two == user_two))
                | ((Chat.user_one == user_two) & (Chat.user_two == user_one)),
            ).first()
            if existing:
                if not existing.is_active:
                    emit(
                        "error",
                        {"msg": "Ya existe un chat inactivo para este post y usuarios"},
                    )
                    return
                emit("chat_exists", _serialize_chat(existing))
                join_room(f"chat:{existing.id}")
                return

            chat = Chat(user_one=user_one, user_two=user_two, post_id=post_id)
            db.session.add(chat)
            db.session.commit()

            payload = _serialize_chat(chat)

        join_room(f"chat:{payload['id']}")
        emit("chat_created", payload)
        print(
            f"[create_chat] {user_one} <-> {user_two} post_id={post_id} chat_id={payload['id']}"
        )
