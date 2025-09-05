from models import User
from flask import Blueprint,render_template
from flask_mail import Message
from app import mail 

mail_bp = Blueprint('mail_bp', __name__)

@mail_bp.route('/send-welcome-email', methods=['GET'])
def send_welcome_email():
    msg = Message(
        subject="¡Bienvenidos a Hand to Hand!",
        sender="handtohand87@gmail.com",
        recipients=["User.email"]
    )
    msg.html = render_template("email/welcome.html", username = User.name)
    mail.send(msg)
    return {"message": "Correo enviado correctamente"}
