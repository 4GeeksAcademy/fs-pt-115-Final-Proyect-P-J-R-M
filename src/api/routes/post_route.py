from flask import Blueprint, jsonify,request 
from flask_cors import CORS
from api.models import Post, User, db

post_bp=Blueprint("post",__name__, url_prefix="/posts")


CORS(post_bp)

@post_bp.route("/", methods=["GET"])
def get_books():
    posts= Post.query.all()
    return jsonify ([p.serialize()for p in  posts]),200

@post_bp.route("/<int:post_id>", methods=["GET"])
def get_post(post_id):
    post= Post.query.get(post_id)

    if post:
        return jsonify(post.serialize()),200
    return jsonify({"msg":"Post not found"}),404

@post_bp.route("/", methods=["POST"])
def create_post():
    data = request.get_json()

    if not data.get("user_id") or not data.get("destination") or not data.get("description") or not data.get("divisas_one") or not data.get("divisas_two"):
        return jsonify({"msg": "Missing data to be filled in"}), 400

    user = db.session.execute(db.select(User).where(User.id == data.get("user_id"))).scalar_one_or_none()
    if not user:
        return jsonify({"msg": "The user does not exist"}), 404

    new_post = Post(
        user_id=data["user_id"],
        destination=data["destination"],
        description=data["description"],
        divisas_one=data["divisas_one"],
        divisas_two=data["divisas_two"]
    )

    db.session.add(new_post)
    db.session.commit()

    return jsonify(new_post.serialize()), 201

@post_bp.route("/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    post = Post.query.get(post_id)

    if not post:
        return jsonify({"msg": "Post not found"}), 404
    db.session.delete(post)
    db.session.commit()

    return jsonify({"msg": "Post deleted successfully"}), 200

@post_bp.route("/<int:post_id>", methods=["PATCH"])
def update_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "Post not found"}), 404

    data = request.get_json()

    if "destination" in data:
        post.destination=data ["destination"]
    if "description" in data:
        post.destination=data["destination"]
    if "divisas_one" in data:
        post.divisas_one = data["divisas_one"]
    if "divisas_two" in data:
        post.divisas_two = data["divisas_two"]  

    db.session.commit()
    return jsonify(post.serializer()),200

