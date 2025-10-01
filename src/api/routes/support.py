from flask import Blueprint, request, jsonify
from flask_cors import CORS
from api.response_support import RESPUESTAS
import unicodedata
import difflib

support_bp = Blueprint("support", __name__, url_prefix="/support")
CORS(support_bp)


def normalizar(texto):
    texto = texto.lower()
    texto = unicodedata.normalize('NFD', texto)
    texto = ''.join(
        char for char in texto if unicodedata.category(char) != 'Mn')
    return texto


@support_bp.route("/chat", methods=["POST"])
def soporte_chat():
    data = request.get_json()
    pregunta = normalizar(data.get("message", ""))
    claves_normalizadas = {normalizar(clave): clave for clave in RESPUESTAS}
    mejor_match = difflib.get_close_matches(
        pregunta, claves_normalizadas.keys(), n=1, cutoff=0.5)

    if mejor_match:
        clave_original = claves_normalizadas[mejor_match[0]]
        respuesta = RESPUESTAS[clave_original]
    else:
        respuesta = "Lo siento, no tengo una respuesta para eso."

    return jsonify({"respuesta": respuesta})


@support_bp.route("/sugerencias", methods=["GET"])
def obtener_sugerencias():
    return jsonify(list(RESPUESTAS.keys()))
