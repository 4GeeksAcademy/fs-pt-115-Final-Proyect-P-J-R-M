from flask_cors import CORS
from flask import Blueprint, request, jsonify
from api.models import PlatformRating, db
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required


rating_bp = Blueprint('rating_bp', __name__, url_prefix="/api")

CORS(rating_bp)


@rating_bp.route('/platform-rating', methods=['POST'])
@jwt_required()
def submit_rating():
    user_id = get_jwt_identity()
    data = request.get_json()
    score = int(data.get('score', 0))

    if not score or not (1 <= score <= 5):
        return jsonify({'error': 'Score must be between 1 and 5'}), 400

    rating = PlatformRating(user_id=user_id, score=score)
    db.session.add(rating)
    db.session.commit()

    return jsonify({'message': 'Rating submitted successfully'}), 201


@rating_bp.route('/platform-rating/summary', methods=['GET'])
def get_rating_summary():
    ratings = PlatformRating.query.filter_by(is_active=True).all()
    total = len(ratings)

    if total == 0:
        return jsonify({'average': 0, 'distribution': [0, 0, 0, 0, 0]})

    distribution = [0] * 5
    for r in ratings:
        distribution[r.score - 1] += 1

    average = round(sum(r.score for r in ratings) / total, 2)

    return jsonify({
        'average': average,
        'distribution': distribution
    })

@rating_bp.route('/platform-rating/user', methods=['GET'])
@jwt_required() 
def get_user_rating():
    user_id = get_jwt_identity()
    rating = PlatformRating.query.filter_by(user_id=user_id, is_active=True).first()
    if rating:
        return jsonify(rating.serialize())
    return jsonify({'score': None})

@rating_bp.route('/platform-rating', methods=['PATCH'])
@jwt_required()
def update_rating():
    user_id = get_jwt_identity()
    data = request.get_json()
    score = int(data.get('score', 0))

    if not (1 <= score <= 5):
        return jsonify({'error': 'Score must be between 1 and 5'}), 400

    rating = PlatformRating.query.filter_by(user_id=user_id).first()
    if rating:
        rating.score = score
        db.session.commit()
        return jsonify({'message': 'Rating updated successfully'}), 200
    return jsonify({'error': 'Rating not found'}), 404


