from flask import Blueprint, request, jsonify
from flask_cors import CORS
from api.response_support import RESPUESTAS


support_bp = Blueprint("support", __name__, url_prefix="/support")
CORS(support_bp)


@support_bp.route("/chat", methods=["POST"])
def soporte_chat():
    data = request.get_json()
    pregunta = data.get("message", "").lower()

    respuesta = None
    for clave in RESPUESTAS:
        if clave.lower() in pregunta:
            respuesta = RESPUESTAS[clave]
            break

    if not respuesta:
        respuesta = "Lo siento, no tengo una respuesta para eso."

    return jsonify({"respuesta": respuesta})


@support_bp.route("/sugerencias", methods=["GET"])
def obtener_sugerencias():
    return jsonify(list(RESPUESTAS.keys()))
