import cv2
import base64
import mediapipe as mp
import numpy as np
import pyttsx3
import time
from threading import Thread
from collections import deque

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

print("MediaPipe Pose initialized successfully!")

# Initialize text-to-speech engine
tts_engine = pyttsx3.init()
tts_engine.setProperty('rate', 150)  # Speed of speech
tts_engine.setProperty('volume', 0.9)  # Volume (0.0 to 1.0)

# Voice feedback state management
last_announcement_time = 0
last_announcement_text = ""
ANNOUNCEMENT_COOLDOWN = 3.0  # Seconds between announcements

# Smoothing buffers for angles (reduces jitter)
elbow_angle_buffer = deque(maxlen=5)
back_angle_buffer = deque(maxlen=5)


def speak_async(text):
    """Speak text in a separate thread to avoid blocking the main loop."""
    def speak():
        tts_engine.say(text)
        tts_engine.runAndWait()
    
    thread = Thread(target=speak)
    thread.daemon = True
    thread.start()


def announce_feedback(feedback_text, force=False):
    """
    Announces feedback if the text has changed OR enough time has passed.
    force=True will announce immediately regardless of cooldown (for important events).
    """
    global last_announcement_time, last_announcement_text
    
    current_time = time.time()
    time_since_last = current_time - last_announcement_time
    
    # Announce if text changed (immediate) OR cooldown passed OR forced
    if force or feedback_text != last_announcement_text or time_since_last >= ANNOUNCEMENT_COOLDOWN:
        speak_async(feedback_text)
        last_announcement_time = current_time
        last_announcement_text = feedback_text


def calculate_angle(a, b, c):
    """
    Calculates the angle between three 3D points.
    a, b, c: Tuples or lists of (x, y, z) coordinates.
    The angle is calculated at point 'b'.
    """
    a = np.array(a)  # First point
    b = np.array(b)  # Mid point (vertex)
    c = np.array(c)  # End point

    # Calculate vectors
    ba = a - b
    bc = c - b

    # Calculate dot product
    dot_product = np.dot(ba, bc)

    # Calculate magnitudes
    mag_ba = np.linalg.norm(ba)
    mag_bc = np.linalg.norm(bc)

    # Calculate cosine of the angle
    # Add a small epsilon to avoid division by zero
    cosine_angle = dot_product / (mag_ba * mag_bc + 1e-6)

    # Clip values to prevent arccos errors
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)

    # Calculate angle in radians and convert to degrees
    angle = np.arccos(cosine_angle)
    return np.degrees(angle)


def smooth_angle(angle, buffer):
    """Smooth angle using moving average to reduce jitter."""
    buffer.append(angle)
    return np.mean(buffer)


def get_landmark_coords(landmarks, part_name, image_width, image_height):
    """
    Retrieves the pixel coordinates (x, y) of a specific landmark.
    """
    lm = landmarks[mp_pose.PoseLandmark[part_name].value]
    return (int(lm.x * image_width), int(lm.y * image_height))


def get_landmark_3d(landmarks, part_name):
    """
    Retrieves the 3D coordinates (x, y, z) of a specific landmark.
    """
    lm = landmarks[mp_pose.PoseLandmark[part_name].value]
    return [lm.x, lm.y, lm.z]


# --- Exercise Processing Functions ---

def process_pushup(landmarks, frame_width, frame_height, rep_counter, exercise_state, feedback_text):
    """
    Processes the logic for a pushup.
    Calculates angles, provides feedback, counts reps, and returns drawing specs.
    """

    # Initialize drawing specs
    drawing_specs = {}

    # Get 3D coordinates for angle calculations
    left_shoulder_3d = get_landmark_3d(landmarks, "LEFT_SHOULDER")
    left_elbow_3d = get_landmark_3d(landmarks, "LEFT_ELBOW")
    left_wrist_3d = get_landmark_3d(landmarks, "LEFT_WRIST")
    left_hip_3d = get_landmark_3d(landmarks, "LEFT_HIP")
    left_knee_3d = get_landmark_3d(landmarks, "LEFT_KNEE")

    # Get 2D pixel coordinates for drawing
    left_shoulder_2d = get_landmark_coords(landmarks, "LEFT_SHOULDER", frame_width, frame_height)
    left_elbow_2d = get_landmark_coords(landmarks, "LEFT_ELBOW", frame_width, frame_height)
    left_wrist_2d = get_landmark_coords(landmarks, "LEFT_WRIST", frame_width, frame_height)
    left_hip_2d = get_landmark_coords(landmarks, "LEFT_HIP", frame_width, frame_height)
    left_knee_2d = get_landmark_coords(landmarks, "LEFT_KNEE", frame_width, frame_height)

    # Calculate angles with smoothing
    elbow_angle_raw = calculate_angle(left_shoulder_3d, left_elbow_3d, left_wrist_3d)
    back_angle_raw = calculate_angle(left_shoulder_3d, left_hip_3d, left_knee_3d)
    
    elbow_angle = smooth_angle(elbow_angle_raw, elbow_angle_buffer)
    back_angle = smooth_angle(back_angle_raw, back_angle_buffer)

    # --- Form Correction Cues & UI Coloring ---
    elbow_line_color = GOOD_COLOR
    back_line_color = GOOD_COLOR
    hip_circle_color = GOOD_COLOR

    # Back straightness
    if back_angle < 160:  # Threshold for straight back
        if "back" not in feedback_text:  # Only announce if not already saying it
            feedback_text = "Keep your back straight!"
            announce_feedback(feedback_text, force=True)
        else:
            feedback_text = "Keep your back straight!"
        back_line_color = BAD_COLOR
        hip_circle_color = BAD_COLOR
    else:
        if feedback_text == "Keep your back straight!":  # Changed from bad to good
            feedback_text = "Good back form!"
            announce_feedback(feedback_text, force=True)
        else:
            feedback_text = "Good back form!"
        back_line_color = GOOD_COLOR
        hip_circle_color = GOOD_COLOR

    # Elbow depth (for rep counting)
    if elbow_angle < 90 and back_angle > 160:  # Deep enough and back is straight
        if exercise_state != "down":
            exercise_state = "down"
            feedback_text = "Lower!"
            announce_feedback(feedback_text, force=True)
        else:
            feedback_text = "Lower!"
        elbow_line_color = GOOD_COLOR

    elif elbow_angle > 160 and exercise_state == "down":  # Back up, rep complete
        exercise_state = "up"
        rep_counter += 1
        feedback_text = "Rep Complete!"
        elbow_line_color = GOOD_COLOR
        announce_feedback(feedback_text, force=True)

    elif elbow_angle > 160 and exercise_state == "up":  # Staying up, ready for next rep
        if feedback_text != "Ready to lower!":
            feedback_text = "Ready to lower!"
            announce_feedback(feedback_text)
        else:
            feedback_text = "Ready to lower!"
        elbow_line_color = GOOD_COLOR
    else:
        elbow_line_color = BAD_COLOR
        if "back" not in feedback_text:  # Don't overwrite critical back feedback
            if feedback_text != "Push up or lower!":
                feedback_text = "Push up or lower!"
                announce_feedback(feedback_text)
            else:
                feedback_text = "Push up or lower!"

    # Populate drawing_specs for the main loop to draw
    drawing_specs = {
        "elbow_line_color": elbow_line_color,
        "back_line_color": back_line_color,
        "hip_circle_color": hip_circle_color,
        "left_elbow_2d": left_elbow_2d,
        "left_shoulder_2d": left_shoulder_2d,
        "left_hip_2d": left_hip_2d,
        "left_knee_2d": left_knee_2d,
        "elbow_angle": int(elbow_angle),
        "back_angle": int(back_angle)
    }

    return rep_counter, exercise_state, feedback_text, drawing_specs


def process_bicep_curl(landmarks, frame_width, frame_height, rep_counter, exercise_state, feedback_text):
    """
    Simple bicep curl test - just curl your arm to test the system!
    Works great for testing without doing full push-ups.
    """
    
    # Initialize drawing specs
    drawing_specs = {}
    
    # Get 3D coordinates for angle calculation
    right_shoulder_3d = get_landmark_3d(landmarks, "RIGHT_SHOULDER")
    right_elbow_3d = get_landmark_3d(landmarks, "RIGHT_ELBOW")
    right_wrist_3d = get_landmark_3d(landmarks, "RIGHT_WRIST")
    
    # Get 2D coordinates for drawing
    right_shoulder_2d = get_landmark_coords(landmarks, "RIGHT_SHOULDER", frame_width, frame_height)
    right_elbow_2d = get_landmark_coords(landmarks, "RIGHT_ELBOW", frame_width, frame_height)
    right_wrist_2d = get_landmark_coords(landmarks, "RIGHT_WRIST", frame_width, frame_height)
    
    # Calculate elbow angle with smoothing
    elbow_angle_raw = calculate_angle(right_shoulder_3d, right_elbow_3d, right_wrist_3d)
    elbow_angle = smooth_angle(elbow_angle_raw, elbow_angle_buffer)
    
    # --- Form checking and rep counting ---
    elbow_line_color = GOOD_COLOR
    
    # Curled position (arm bent)
    if elbow_angle < 50:  # Fully curled
        if exercise_state != "curled":  # State changed
            exercise_state = "curled"
            feedback_text = "Good curl!"
            announce_feedback(feedback_text, force=True)  # Announce state change immediately
        else:
            feedback_text = "Good curl!"
        elbow_line_color = GOOD_COLOR
    
    # Extended position (arm straight) - completes the rep
    elif elbow_angle > 140 and exercise_state == "curled":
        exercise_state = "extended"
        rep_counter += 1
        feedback_text = "Rep complete!"
        elbow_line_color = GOOD_COLOR
        announce_feedback(feedback_text, force=True)  # Always announce rep completion
    
    # Ready position
    elif elbow_angle > 140 and exercise_state == "extended":
        if feedback_text != "Curl your arm!":  # Only announce if changing
            feedback_text = "Curl your arm!"
            announce_feedback(feedback_text)
        else:
            feedback_text = "Curl your arm!"
        elbow_line_color = GOOD_COLOR
    
    # In between
    else:
        if elbow_angle < 140 and elbow_angle > 50:
            if feedback_text != "Keep going...":  # Only announce if changing
                feedback_text = "Keep going..."
                announce_feedback(feedback_text)
            else:
                feedback_text = "Keep going..."
            elbow_line_color = (255, 165, 0)  # Orange
    
    # Populate drawing specs
    drawing_specs = {
        "elbow_line_color": elbow_line_color,
        "right_shoulder": right_shoulder_2d,
        "right_elbow": right_elbow_2d,
        "right_wrist": right_wrist_2d,
        "elbow_angle": int(elbow_angle)
    }
    
    return rep_counter, exercise_state, feedback_text, drawing_specs


# --- Dummy Functions for Other Exercises ---

def process_barbell_squat(landmarks, frame_width, frame_height, rep_counter, exercise_state, feedback_text):
    feedback_text = "Barbell Squat logic not implemented."
    return rep_counter, exercise_state, feedback_text, {}


def process_deadlift(landmarks, frame_width, frame_height, rep_counter, exercise_state, feedback_text):
    feedback_text = "Deadlift logic not implemented."
    return rep_counter, exercise_state, feedback_text, {}


def process_chest_press(landmarks, frame_width, frame_height, rep_counter, exercise_state, feedback_text):
    feedback_text = "Chest Press logic not implemented."
    return rep_counter, exercise_state, feedback_text, {}


def process_shoulder_press(landmarks, frame_width, frame_height, rep_counter, exercise_state, feedback_text):
    feedback_text = "Shoulder Press logic not implemented."
    return rep_counter, exercise_state, feedback_text, {}


def process_pull_up(landmarks, frame_width, frame_height, rep_counter, exercise_state, feedback_text):
    feedback_text = "Pull Up logic not implemented."
    return rep_counter, exercise_state, feedback_text, {}


def analyze_pose_frame(frame, exercise_type="bicep_curl"):
    """
    Analyzes a single frame (BGR image) for posture, returns feedback and frame with overlay.
    Called by the Flask backend instead of running live webcam.
    """

    global rep_counter, exercise_state, feedback_text

    frame_height, frame_width, _ = frame.shape

    # Convert to RGB for MediaPipe
    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(image_rgb)

    feedback_text = feedback_text or "Starting..."
    drawing_specs = {}

    try:
        landmarks = results.pose_landmarks.landmark

        if exercise_type == "pushup":
            rep_counter, exercise_state, feedback_text, drawing_specs = process_pushup(
                landmarks, frame_width, frame_height, rep_counter, exercise_state, feedback_text
            )
        elif exercise_type == "bicep_curl":
            rep_counter, exercise_state, feedback_text, drawing_specs = process_bicep_curl(
                landmarks, frame_width, frame_height, rep_counter, exercise_state, feedback_text
            )
        else:
            feedback_text = "Exercise not implemented yet."

        # Draw overlays (reuse your existing drawing logic)
        if exercise_type == "bicep_curl" and drawing_specs:
            specs = drawing_specs
            cv2.line(frame, specs["right_shoulder"], specs["right_elbow"], specs["elbow_line_color"], 4)
            cv2.line(frame, specs["right_elbow"], specs["right_wrist"], specs["elbow_line_color"], 4)
            cv2.circle(frame, specs["right_elbow"], 12, specs["elbow_line_color"], -1)
            cv2.putText(frame, f'Angle: {specs["elbow_angle"]}', (specs["right_elbow"][0] + 20, specs["right_elbow"][1]),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, TEXT_COLOR, 2, cv2.LINE_AA)

        # Add feedback text and rep count
        overlay = frame.copy()
        alpha = 0.6
        cv2.rectangle(overlay, (0, 0), (280, 120), (0, 0, 0), -1)
        cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
        cv2.putText(frame, f'REPS: {rep_counter}', (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, TEXT_COLOR, 2)
        cv2.putText(frame, f'STATE: {exercise_state.upper()}', (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, TEXT_COLOR, 2)
        cv2.putText(frame, feedback_text, (20, frame_height - 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, TEXT_COLOR, 2)

        # Encode processed frame as base64 string to send to frontend
        _, buffer = cv2.imencode('.jpg', frame)
        processed_frame_b64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "rep_count": rep_counter,
            "feedback_text": feedback_text,
            "processed_frame": f"data:image/jpeg;base64,{processed_frame_b64}"
        }

    except Exception as e:
        return {"error": str(e)}


def reset_counters():
    """Resets repetition counter and exercise state."""
    global rep_counter, exercise_state, feedback_text
    rep_counter = 0
    exercise_state = "up"
    feedback_text = "Reset successful"