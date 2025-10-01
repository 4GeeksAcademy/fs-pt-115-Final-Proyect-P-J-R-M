import os
import requests
import json

SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
EMAIL_FROM = os.getenv('EMAIL_FROM')
EMAIL_FROM_NAME = os.getenv('EMAIL_FROM_NAME')


class EmailError(Exception):
    pass


def send_email(to_email: str, subject: str, html: str):
    if not SENDGRID_API_KEY:
        raise EmailError('Api Key no configurado')
    if not EMAIL_FROM:
        raise EmailError('Email_from no configurado')

    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        'Authorization': f'Bearer {SENDGRID_API_KEY}',
        'Content-Type': 'application/json'
    }

    payload = {
        "personalizations": [
            {"to": [{"email": to_email}]}
        ],
        "from": {"email": EMAIL_FROM, "name": EMAIL_FROM_NAME},
        "subject": subject,
        "content": [{"type": "text/html", "value": html}],
    }

    r = requests.post(url, headers=headers,
                      data=json.dumps(payload), timeout=15)
    if r.status_code >= 300:
        raise EmailError(
            f"SendGrid error {r.status_code}: {r.text or r.reason}")
