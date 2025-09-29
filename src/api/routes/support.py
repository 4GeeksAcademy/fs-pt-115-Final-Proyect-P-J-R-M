from flask import Blueprint, request, jsonify
from flask_cors import CORS
from api.response_support import RESPUESTAS
import unicodedata

support_bp = Blueprint("support", __name__, url_prefix="/support")
CORS(support_bp)


def normalizar(texto):
    
    texto = texto.lower()
    texto = unicodedata.normalize('NFD', texto)
    texto = ''.join(char for char in texto if unicodedata.category(char) != 'Mn')
    return texto

@support_bp.route("/chat", methods=["POST"])
def soporte_chat():
    data = request.get_json()
    pregunta = normalizar(data.get("message", ""))

    respuesta = None
    for clave in RESPUESTAS:
        clave_normalizada = normalizar(clave)
        if clave_normalizada in pregunta:
            respuesta = RESPUESTAS[clave]
            break

    if not respuesta:
        respuesta = "Lo siento, no tengo una respuesta para eso."

    return jsonify({"respuesta": respuesta})


@support_bp.route("/sugerencias", methods=["GET"])
def obtener_sugerencias():
    return jsonify(list(RESPUESTAS.keys()))
