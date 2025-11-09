from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from gym_posture_correction_yolo import analyze_pose_frame, exercise_state

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/reset", methods=["POST"])
def reset():
    exercise_state["rep_count"] = 0
    exercise_state["current_state"] = "ready"
    exercise_state["last_angle"] = 0
    return jsonify({"status": "reset"})

@socketio.on('connect')
def handle_connect():
    print('✅ Client connected via WebSocket')
    emit('connected', {'status': 'ok'})

@socketio.on('disconnect')
def handle_disconnect():
    print('❌ Client disconnected')

@socketio.on('frame')
def handle_frame(data):
    try:
        frame_data = data.get('frame')
        exercise = data.get('exercise', 'bicep_curl')
        
        if not frame_data:
            emit('error', {'message': 'No frame data'})
            return
        
        result = analyze_pose_frame(frame_data, exercise)
        emit('result', result)
    except Exception as e:
        print(f"❌ Error processing frame: {e}")
        emit('error', {'message': str(e)})

@socketio.on('reset_exercise')
def handle_reset():
    exercise_state["rep_count"] = 0
    exercise_state["current_state"] = "ready"
    exercise_state["last_angle"] = 0
    emit('reset_complete', {'status': 'ok'})

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)