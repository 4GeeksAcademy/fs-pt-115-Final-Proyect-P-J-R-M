from typing import List, Optional
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import String, Boolean, ForeignKey, Column, Table, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from flask_bcrypt import Bcrypt
from datetime import datetime


db = SQLAlchemy()
bcrypt = Bcrypt()

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
    username: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    dni: Mapped [str] = mapped_column(String(120), unique=True, nullable=False)
    image: Mapped[Optional[str]] = mapped_column(Text)
    dni: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    image: Mapped[str] = mapped_column(String(255))
    country: Mapped[str] = mapped_column(String(120))
    score: Mapped[int] = mapped_column(Integer)

    fav_chats: Mapped[List['Chat']] = relationship(secondary=favorites_chats)
    fav_post: Mapped[List['Post']] = relationship(secondary=favorites_post)

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def serialize(self):
        try:
            f_chats = [c.serialize() for c in self.fav_chats]
        except Exception:
            f_chats = None

        try:
            f_post = [p.serialize() for p in self.fav_post]
        except Exception:
            f_post = None

        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "dni": self.dni,
            "image": self.image,
            "country": self.country,
            "score": self.score,
            "favorite_chats": f_chats,
            "favorite_post": f_post
        }


class Post(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        db.ForeignKey('user.id'), nullable=False)
    destination: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(String(255))
    divisas_one: Mapped[str] = mapped_column(String(50))
    divisas_two: Mapped[str] = mapped_column(String(50))
    created_data: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "destination": self.destination,
            "description": self.description,
            "divisas_one": self.divisas_one,
            "divisas_two": self.divisas_two,
            "created_data": self.created_data.strftime("%d/%m/%Y %H:%M")

        }


class Chat(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_one: Mapped[int] = mapped_column(
        db.ForeignKey('user.id'), nullable=False)
    user_two: Mapped[int] = mapped_column(
        db.ForeignKey('user.id'), nullable=False)
    post_id: Mapped[int] = mapped_column(
        db.ForeignKey('post.id'), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "user_one": self.user_one,
            "user_two": self.user_two,
            "post_id": self.post_id
        }


class Message (db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    chat_id: Mapped[int] = mapped_column(
        db.ForeignKey('chat.id'), nullable=False)
    content: Mapped[str] = mapped_column(String(255), nullable=False)
    user_id: Mapped[int] = mapped_column(
        db.ForeignKey('user.id'), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "chat_id": self.chat_id,
            "content": self.content,
            "user_id": self.user_id

        }
