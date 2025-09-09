
from flask import Blueprint, jsonify, request, render_template
from flask_cors import CORS
from api.models import Post, db, User
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_mail import Message
from api.mail_config import mail

post_bp = Blueprint("post", __name__, url_prefix="/posts",
                    template_folder='../templates')


CORS(post_bp)


@post_bp.route("/", methods=["GET"])
@jwt_required()
def get_posts():
    posts = Post.query.all()
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
        divisas_one=data["divisas_one"],
        divisas_two=data["divisas_two"],
        
    )

    db.session.add(new_post)
    db.session.commit()

    data_created = new_post.created_data.strftime("%d/%m/%Y %H:%M")

    post_url = f"https://animated-spork-v64ggp4r65v2w6rg.github.dev/posts/{new_post.id}"

    html_post = render_template(
        'new_post.html',
        username=username,
        destination=new_post.destination,
        description=new_post.description,
        divisas_one=new_post.divisas_one,
        divisas_two=new_post.divisas_two,
        data_created=data_created,
        post_url=post_url
    )
    msg = Message(

        subject='Has creado un nuevo post en Hand to Hand',
        recipients=[email],
        html=html_post)

    mail.send(msg)

    return jsonify(new_post.serialize()), 201


@post_bp.route("/<int:post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id):
    post = Post.query.get(post_id)

    if not post:
        return jsonify({"msg": "Post not found"}), 404
    db.session.delete(post)
    db.session.commit()

    return jsonify({"msg": "Post deleted successfully"}), 200


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
    if "divisas_one" in data:
        post.divisas_one = data["divisas_one"]
    if "divisas_two" in data:
        post.divisas_two = data["divisas_two"]

    db.session.commit()
    return jsonify(post.serialize()), 200
