This is a VERY SIMPLE chatting app which uses a peer-to-peer connection.

To run this, you must run the client and socketio server seperately.
  Replace "YOUR_SOCKETIO_SERVER" in script.js (client) with the URL of your server
  Replace "LINK_TO_CLIENT" in main.py (client) with the URL of your client
    CORS(app, resources={r"/api/data": {"origins": "LINK_TO_CLIENT"}})
