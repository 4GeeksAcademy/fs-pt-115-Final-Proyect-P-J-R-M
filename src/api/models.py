from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped [str] = mapped_column(String(120), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    dni: Mapped [str] = mapped_column(String(120), unique=True, nullable=False)
    image: Mapped[str] = mapped_column(String(255))
    country: Mapped[str] = mapped_column(String(120))
    score: Mapped[int] = mapped_column(String(20))

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "dni": self.dni,
            "image": self.image,
            "country": self.country,
            "score": self.score
            # do not serialize the password, its a security breach
        }
    
    class Post(db.Model):
        id: Mapped[int] = mapped_column(primary_key=True)
        user_id: Mapped[int] = mapped_column(db.Foreing_Key('user.id'), nullable=False)
        destination: Mapped[str] = mapped_column(String(120))
        description: Mapped[str] = mapped_column(String(255))
        divisas_one: Mapped[str] = mapped_column(String(50))
        divisas_two: Mapped[str] = mapped_column(String(50))

        def serialize(self):
            return {
            "id": self.id,
            "user_id": self.user_id,
            "destination": self.destination,
            "description": self.description,
            "divisas_one": self.divisas_one,
            "divisas_two": self.divisas_two
        }

    