from flask import Blueprint, jsonify, request
from flask_cors import CORS
from api.models import User, db
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

user_bp = Blueprint("users", __name__, url_prefix="/users")

CORS(user_bp)

@user_bp.route("/", methods=["GET"])
@jwt_required()
def get_users():
    users = User.query.all()
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
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created"})


@user_bp.route("/", methods=["DELETE"])
@jwt_required()
def delete_user():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify("User not found"), 400
    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "User successfully deleted"})


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

    if not user or not user.check_password(password):
        return jsonify({"msg": "Incorrect email or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"msg": "ok", "token": token}), 200
    
    
