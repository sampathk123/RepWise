import base64
import cv2
import numpy as np
from ultralytics import YOLO

print("⚙️ Loading YOLOv8 model...")
model = YOLO("yolov8n-pose.pt")
print("✅ YOLO model loaded successfully.")

# Exercise state tracking (add this at module level)
exercise_state = {
    "rep_count": 0,
    "current_state": "ready",
    "last_angle": 0
}

def calculate_angle(a, b, c):
    """Calculate angle between three points (a-b-c)"""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
        
    return float(angle)  # Convert to Python float

def analyze_pose_frame(image_data, exercise="bicep_curl"):
    try:
        # If image_data is a base64 string, decode it first
        if isinstance(image_data, str):
            # Remove data URI scheme if present
            if image_data.startswith("data:image"):
                image_data = image_data.split(",")[1]

            image_data = base64.b64decode(image_data)

        # Convert bytes to NumPy array
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            print("❌ Received empty frame")
            return {"status": "error", "message": "Empty frame received"}

        # Run YOLO inference with conf threshold
        results = model(frame, verbose=False, conf=0.5)

        # Check if any results exist
        if len(results) == 0:
            print("⚠️ No detections found in this frame")
            # Return original frame
            _, buffer = cv2.imencode('.jpg', frame)
            processed_frame_base64 = base64.b64encode(buffer).decode('utf-8')
            processed_frame = f"data:image/jpeg;base64,{processed_frame_base64}"
            
            return {
                "status": "no_person", 
                "message": "No person detected",
                "processed_frame": processed_frame,
                "rep_count": exercise_state["rep_count"],
                "exercise_state": "waiting"
            }

        # Get the first detection result
        result = results[0]
        
        # Check if keypoints exist and are not None
        if result.keypoints is None or result.keypoints.data is None:
            print("⚠️ No keypoints in result")
            # Return original frame
            _, buffer = cv2.imencode('.jpg', frame)
            processed_frame_base64 = base64.b64encode(buffer).decode('utf-8')
            processed_frame = f"data:image/jpeg;base64,{processed_frame_base64}"
            
            return {
                "status": "no_keypoints", 
                "message": "No keypoints detected",
                "processed_frame": processed_frame,
                "rep_count": exercise_state["rep_count"],
                "exercise_state": "waiting"
            }

        # Get keypoints
        keypoints_data = result.keypoints.data.cpu().numpy()
        
        if len(keypoints_data) == 0 or len(keypoints_data[0]) == 0:
            print("⚠️ Empty keypoints array")
            # Return original frame
            _, buffer = cv2.imencode('.jpg', frame)
            processed_frame_base64 = base64.b64encode(buffer).decode('utf-8')
            processed_frame = f"data:image/jpeg;base64,{processed_frame_base64}"
            
            return {
                "status": "no_keypoints", 
                "message": "No keypoints detected",
                "processed_frame": processed_frame,
                "rep_count": exercise_state["rep_count"],
                "exercise_state": "waiting"
            }

        # ✅ Draw the annotated frame with keypoints
        annotated_frame = result.plot()  # This draws skeleton and keypoints
        
        # Encode the annotated frame to base64
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        processed_frame_base64 = base64.b64encode(buffer).decode('utf-8')
        processed_frame = f"data:image/jpeg;base64,{processed_frame_base64}"

        # Get xy coordinates of first person
        keypoints = keypoints_data[0][:, :2]  # Get only x, y (ignore confidence)
        
        print(f"✅ Keypoints detected: {len(keypoints)}")

        # Analyze exercise-specific metrics
        metrics = {}
        feedback_text = ""
        
        if exercise == "bicep_curl" and len(keypoints) >= 11:
            # Keypoint indices for YOLO pose:
            # 5=left shoulder, 7=left elbow, 9=left wrist
            # 6=right shoulder, 8=right elbow, 10=right wrist
            
            # Use right arm (typically facing camera)
            shoulder = keypoints[6]
            elbow = keypoints[8]
            wrist = keypoints[10]
            
            # Check if points are detected (confidence > 0)
            if all([shoulder[0] > 0, elbow[0] > 0, wrist[0] > 0]):
                # Calculate angle
                angle = calculate_angle(shoulder, elbow, wrist)
                metrics["elbow_angle"] = float(angle)
                
                # Simple rep counting logic
                if angle < 50 and exercise_state["current_state"] == "down":
                    exercise_state["current_state"] = "up"
                    exercise_state["rep_count"] += 1
                    feedback_text = "✓ Rep complete! Good form."
                elif angle > 160:
                    exercise_state["current_state"] = "down"
                    feedback_text = "Lower the weight slowly"
                else:
                    feedback_text = f"Current angle: {int(angle)}°"
            else:
                feedback_text = "Position yourself so your full arm is visible"
        
        return {
            "status": "success", 
            "processed_frame": processed_frame,
            "rep_count": int(exercise_state["rep_count"]),
            "exercise_state": exercise_state["current_state"],
            "feedback_text": feedback_text,
            "metrics": metrics
        }

    except Exception as e:
        print(f"❌ analyze_pose_frame error: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}