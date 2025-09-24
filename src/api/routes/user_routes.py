
from flask import Blueprint, jsonify, request, render_template
from flask_cors import CORS
from api.models import User, db
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from flask_mail import Message
from api.mail_config import mail
import cloudinary
import cloudinary.uploader
import os
from cloudinary import CloudinaryImage
from datetime import timedelta


user_bp = Blueprint("users", __name__, url_prefix="/users",
                    template_folder='../templates')

CORS(user_bp)


@user_bp.route("/", methods=["GET"])
@jwt_required()
def get_users():
    users = User.query.filter_by(is_active=True).all()
    return jsonify([user.serialize()for user in users])


@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if user:
        return jsonify(user.serialize()), 200
    return jsonify({"msg": "User not found"}), 400


@user_bp.route("/", methods=["POST"])
def post_user():
    # temporal pendiente de cambio
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    dni = data.get("dni")
    image = data.get("image")
    country = data.get("country")
    score = data.get("score")

    if not all([username, email, password, dni]):
        return jsonify({"msg": "Missing data to be filled in"}), 400
    user_is_exist = db.session.execute(db.select(User).where(
        User.email == email)).scalar_one_or_none()
    if user_is_exist:
        return jsonify({"msg": "User already exists"}), 400

    new_user = User(
        username=username,
        email=email,
        dni=dni,
        image=image,
        country=country,
        score=score,
    )
    new_user.set_password(password)

    html_welcome = render_template('welcome.html', username=username)
    msg = Message(

        subject='Bienvenido',
        sender=('Hand to Hand', 'handtohand87@gmail.com'),
        recipients=[email],
        html=html_welcome)

    mail.send(msg)

    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created"})


@user_bp.route("/", methods=["DELETE"])
@jwt_required()
def delete_user():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"msg": "User not found"}), 400

    user.deactivate()
    db.session.commit()

    return jsonify({"msg": "User deactivated successfully"}), 200


@user_bp.route("/", methods=["PATCH"])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"msg": "User not found"}), 400

    data = request.get_json()

    username = data.get("username")
    # email = data.get("email")
    password = data.get("password")
    # dni = data.get("dni")
    image = data.get("image")
    country = data.get("country")
    score = data.get("score")

    if username:
        user.username = username
    if password:
        user.set_password(password)
    if image is not None:
        user.image = image
    if country is not None:
        user.country = country
    if score is not None:
        user.score = score

    db.session.commit()

    return jsonify({"msg": "User updated successfully", "user": user.serialize()}), 200


# Login
@user_bp.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    user = db.session.execute(db.select(User).where(
        User.email == email)).scalar_one_or_none()

    if not user or not user.check_password(password) or not user.is_active:
        return jsonify({"msg": "Incorrect email or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"msg": "ok", "token": token}), 200

# Reactivar usuarios


@user_bp.route("/reactivate", methods=["PATCH"])
@jwt_required()
def reactivate_user():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    user.is_active = True
    db.session.commit()
    return jsonify({"msg": "Usuario reactivado exitosamente"}), 200


# cloudinari endpoint


@user_bp.route("/upload-img", methods=["POST"])
@jwt_required()
def upload_ing():
    user_id = get_jwt_identity()
    file = request.files.get("file")
    user = db.session.get(User, int(user_id))
    if not file:
        return jsonify({"error": "No se envio el archivo "}), 400

    # sube SIEMPRE a Cloudinary
    upload_result = cloudinary.uploader.upload(file)
    secure_url = upload_result.get("secure_url")
    public_id = upload_result.get("public_id")

    
    as_avatar = request.form.get("asAvatar") in ("1", "true", "yes")

    if as_avatar:
        image = CloudinaryImage(public_id)
        transformed_url = image.build_url(
            transformation=[
                {"crop": "fill", "gravity": "face", "width": 400, "height": 400}]
        )
        user.image = transformed_url
        db.session.commit()

    return jsonify({
        "msg": "ya esta en la nube",
        "imageUrl": secure_url,
        "public_id": public_id,
        "avatarUpdated": bool(as_avatar),
    }), 200


# ----------------------------------------------------------
# Usuarios activos y desactivos.
@user_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_users():
    show_all = request.args.get("all") == "true"
    if show_all:
        users = User.query.all()
    else:
        users = User.query.filter_by(is_active=True).all()
    return jsonify([user.serialize() for user in users])
# ----------------------------------------------------------


# ruta para restablecer contraseña


@user_bp.route('/request-reset', methods=['POST'])
def request_reset():
    email = request.json.get('email')
    if not email or not isinstance(email, str):
        return jsonify({"msg": "Email inválido"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    token = create_access_token(
        identity=str(user.id), expires_delta=timedelta(minutes=30)
    )
    reset_url = f"{os.getenv("VITE_FRONTEND_URL")}/form-reset?token={token}"

    html_reset = render_template(
        'reset.html', username=user.username, reset_url=reset_url)

    msg = Message(
        subject='Restablecer Contraseña',
        sender=('Hand to Hand', 'handtohand87@gmail.com'),
        recipients=[email],
        html=html_reset
    )

    mail.send(msg)
    return jsonify({"msg": "Correo enviado correctamente"})


# ruta para actualar contr. recibe el token en el header y actualiza la contr. al usuario
@user_bp.route('/reset-password', methods=['PATCH'])
@jwt_required()
def reset_password():
    try:
        user_id = get_jwt_identity()
        new_password = request.json.get('password')

        if not new_password or not isinstance(new_password, str) or len(new_password.strip()) < 6:
            return jsonify({"msg": "La contraseña debe tener al menos 6 caracteres"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"msg": "Usuario no válido"}), 404

        user.set_password(new_password)
        db.session.commit()

        return jsonify({"msg": "Contraseña actualizada correctamente"}), 200

    except Exception as e:

        return jsonify({"msg": "Error interno del servidor"}), 500

# Ruta para distribuir y contar cuántos usuarios tienen puntuación del 1 al 5


@user_bp.route("/score-distribution", methods=["GET"])
def score_distribution():

    distribution = {str(i): 0 for i in range(1, 6)}
    users = User.query.all()
    for user in users:
        score = user.score
        if score and str(score) in distribution:
            distribution[str(score)] += 1
    return jsonify({"votes": distribution}), 200
