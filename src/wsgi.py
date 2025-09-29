# This file was created to run the application on heroku using gunicorn.
# Read more about it here: https://devcenter.heroku.com/articles/python-gunicorn

# from app import app as application

# if __name__ == "__main__":
#     application.run()

import eventlet
eventlet.monkey_patch()

import os
from app import app, socketio

if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 3001))
    socketio.run(app, host="0.0.0.0", port=PORT)
