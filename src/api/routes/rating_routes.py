from flask_cors import CORS
from flask import Blueprint, request, jsonify
from api.models import PlatformRating, db


rating_bp = Blueprint('rating_bp', __name__, url_prefix="/api")

CORS(rating_bp)


@rating_bp.route('/platform-rating', methods=['POST'])
def submit_rating():
    data = request.get_json()
    score = int(data.get('score', 0))

    if not score or not (1 <= score <= 5):
        return jsonify({'error': 'Score must be between 1 and 5'}), 400

    rating = PlatformRating(score=score)
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
