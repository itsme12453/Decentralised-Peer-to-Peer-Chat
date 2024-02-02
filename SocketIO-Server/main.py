from flask import Flask, request, jsonify
from flask_cors import CORS
# from flask_socketio import SocketIO
import json

app = Flask(__name__)
CORS(app, resources={r"/api/data": {"origins": "LINK_TO_CLIENT"}})
# CORS(app, origins="https://f17e7d9f-7e08-4cd0-80a0-6cd12b51a1e9-00-3hos9dksqw95b.janeway.replit.dev")


# socketio = SocketIO(app, cors_allowed_origins="https://f17e7d9f-7e08-4cd0-80a0-6cd12b51a1e9-00-3hos9dksqw95b.janeway.replit.dev")

@app.route("/api/data", methods=["GET", "POST", "DELETE"])
def handle_data():
    if request.method == "POST":
        new_data = request.get_json()
    
        with open("data.json", "r") as f:
            data = json.load(f)
    
        data.append(new_data)
    
        with open("data.json", "w") as f:
            json.dump(data, f)
    
        return jsonify({"message": "Data added successfully"}), 200

    elif request.method == "GET":
        with open("data.json", "r") as f:
            data = json.load(f)
            
        return jsonify(data), 200

    elif request.method == 'DELETE':
        id = request.get_json().get('id')
    
        # Read the existing data
        with open('data.json', 'r') as f:
            data = json.load(f)
    
        data = [entry for entry in data if entry.get('id') != id]

        with open('data.json', 'w') as f:
            json.dump(data, f)
    
        return jsonify({'message': 'Data removed successfully'}), 200


# @socketio.on('connect')
# def handle_connect():
#     print('Client connected')
    
#     id = request.args.get("peer-connection-id")

#     # socketio.emit("new-peer", { "id": id }, broadcast=True, include_self=False)


# @socketio.on('disconnect')
# def handle_disconnect():
#     print('Client disconnected')


# @socketio.on()

if __name__ == "__main__":
    app.run(host="0.0.0.0",  port=8080, debug=True)
    # socketio.run(app, host="0.0.0.0", port=8080, debug=True)