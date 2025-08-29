from typing import List
from unittest.mock import Base
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, ForeignKey,Column,Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()

favorites_chats = Table(
    "favorites_chats",
    db.Model.metadata,
    Column("user_id", ForeignKey("user.id"), primary_key=True),
    Column("chat_id", ForeignKey("chat.id"), primary_key=True),
)

favorites_post = Table(
    "favorites_post",
    db.Model.metadata,
    Column("user_id", ForeignKey("user.id"), primary_key=True),
    Column("post_id", ForeignKey("post.id"), primary_key=True),
)



class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped [str] = mapped_column(String(120), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    dni: Mapped [str] = mapped_column(String(120), unique=True, nullable=False)
    image: Mapped[str] = mapped_column(String(255))
    country: Mapped[str] = mapped_column(String(120))
    score: Mapped[int] = mapped_column(String(20))

    fav_chats: Mapped[List['Chat']] = relationship (secondary = favorites_chats )
    fav_post: Mapped[List['Post']] = relationship ( secondary = favorites_post)



    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "dni": self.dni,
            "image": self.image,
            "country": self.country,
            "score": self.score
         
        }
    
class Post(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(db.ForeignKey('user.id'), nullable=False)
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
    
class Chat(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_one: Mapped[int] = mapped_column(db.ForeignKey('user.id'), nullable=False)
    user_two: Mapped[int] = mapped_column(db.ForeignKey('user.id'), nullable=False)
    post_id: Mapped[int] = mapped_column(db.ForeignKey('post.id'), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "user_one": self.user_one,
            "user_two": self.user_two,
            "post_id": self.post_id
        }

class Message (db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    chat_id: Mapped[int] = mapped_column(db.ForeignKey('chat.id'), nullable=False)
    content: Mapped[str] = mapped_column(String(500),nullable=False)
    user_id: Mapped[int] = mapped_column(db.ForeignKey('user.id'), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "chat_id": self.chat_id,
            "content": self.content,
            "user_id": self.user_id

        }
    


    





    