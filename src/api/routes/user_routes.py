from flask import Blueprint, jsonify,request 
from flask_cors import CORS
from api.models import User, db

user_bp=Blueprint("users",__name__, url_prefix="/users")


CORS(user_bp)

@user_bp.route("/", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([user.serialize()for user in users])

@user_bp.route("/profile/<int:id>", methods=["GET"] )
def get_user(id):
    user_id= id
    user= User.query.get(int(user_id))
    if user:
        return jsonify(user.serialize()),200
    return jsonify({"msg":"User not found"}),404

@user_bp.route("/", methods=["POST"])
def post_user():
# temporal pendiente de cambio
    data =request.get_json()
    username= data.get("username")
    email= data.get("email")
    password= data.get("password") 

    if not username or not email or not password:
        return jsonify({"msg":"Faltan datos por rellenar"})
    user_is_exist=db.session.execute(db.select(User).where(User.email==email)).scalar_one_or_none()
    if user_is_exist:
        return jsonify({"msg":"User already exists"}),400

    new_user = User(username= username, email= email, is_active=True)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg":"User created"})

@user_bp.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    user = db.session.execute(db.select(User).where(User.email == email)).scalar_one_or_none()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Incorrect email or password"}), 401

    return jsonify({"msg": "Login successful", "user": user.serialize()}), 200


     


