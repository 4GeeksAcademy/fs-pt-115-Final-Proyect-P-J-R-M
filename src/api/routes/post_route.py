
from flask import Blueprint, jsonify, request, render_template
from flask_cors import CORS
from api.models import Post, db, User
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_mail import Message
from api.mail_config import mail
import os

post_bp = Blueprint("post", __name__, url_prefix="/posts")


CORS(post_bp)


@post_bp.route("/", methods=["GET"])
@jwt_required()
def get_posts():
    posts = Post.query.filter_by(is_active=True).all()
    return jsonify([p.serialize()for p in posts]), 200


@post_bp.route("/<int:post_id>", methods=["GET"])
@jwt_required()
def get_post(post_id):
    post = Post.query.get(post_id)

    if post:
        return jsonify(post.serialize()), 200
    return jsonify({"msg": "Post not found"}), 404


@post_bp.route("/", methods=["POST"])
@jwt_required()
def create_post():
    use_id = get_jwt_identity()
    data = request.get_json()

    if not data.get("destination") or not data.get("description") or not data.get("divisas_one") or not data.get("divisas_two"):
        return jsonify({"msg": "Missing data to be filled in"}), 400

    user = User.query.get(use_id)
    username = user.username
    email = user.email

    new_post = Post(
        user_id=int(use_id),
        destination=data["destination"],
        description=data["description"],
        day_exchange=data["day_exchange"],
        divisas_one=data["divisas_one"],
        divisas_two=data["divisas_two"],

    )

    db.session.add(new_post)
    db.session.commit()

    data_created = new_post.created_data.strftime("%d/%m/%Y %H:%M")

    post_url = f"{os.getenv('VITE_FRONTEND_URL')}/posts"
    
    html_post = render_template(
        'new_post.html',
        username=username,
        destination=new_post.destination,
        description=new_post.description,
        day_exchange=new_post.day_exchange,
        divisas_one=new_post.divisas_one,
        divisas_two=new_post.divisas_two,
        data_created=data_created,
        post_url=post_url
    )
    msg = Message(

        subject='Has creado un nuevo post en Hand to Hand',
        sender=('Hand to Hand', 'handtohand87@gmail.com'),
        recipients=[email],
        html=html_post)

    mail.send(msg)

    return jsonify(new_post.serialize()), 201

# ----------------------------------------------------------------------
@post_bp.route("/<int:post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id):
    post = Post.query.get(post_id)

    if not post or not post.is_active:
        return jsonify({"msg": "Post not found or already inactive"}), 404

    post.deactivate()
    db.session.commit()
    return jsonify({"msg": "Post deactivated successfully"}), 200


@post_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_posts():
    posts = Post.query.all()
    return jsonify([p.serialize() for p in posts]), 200
# ----------------------------------------------------------------------

@post_bp.route("/<int:post_id>", methods=["PATCH"])
@jwt_required()
def update_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "Post not found"}), 404

    data = request.get_json()

    if "destination" in data:
        post.destination = data["destination"]
    if "description" in data:
        post.description = data["description"]
    if "day_exchange" in data:
        post.day_exchange = data["day_exchangue"]
    if "divisas_one" in data:
        post.divisas_one = data["divisas_one"]
    if "divisas_two" in data:
        post.divisas_two = data["divisas_two"]

    db.session.commit()
    return jsonify(post.serialize()), 200
