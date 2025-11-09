import { NormalizedLandmark } from '@mediapipe/pose';

type FeedbackCallback = (text: string, type: 'info' | 'warning' | 'success') => void;

export function detectBicepCurl(
  landmarks: NormalizedLandmark[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: string,
  reps: { current: number },
  addFeedback: FeedbackCallback,
  lastFeedbackTime: number
) {
  if (!landmarks[11] || !landmarks[13] || !landmarks[15]) return; // Left arm
  if (!landmarks[12] || !landmarks[14] || !landmarks[16]) return; // Right arm

  // Calculate elbow angles
  const leftElbowAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
  const rightElbowAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);

  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

  // Draw elbow angle on canvas
  ctx.fillStyle = 'yellow';
  ctx.font = '16px Arial';
  ctx.fillText(`Elbow Angle: ${Math.round(avgElbowAngle)}`, landmarks[13].x * width, landmarks[13].y * height - 10);

  // Bicep curl detection
  const now = Date.now();
  if (avgElbowAngle < 40 && state === 'down') {
    state = 'up';
    reps.current += 1;
    if (now - lastFeedbackTime > 1000) {
      addFeedback('Rep counted! Good curl!', 'success');
      lastFeedbackTime = now;
    }
  } else if (avgElbowAngle > 160 && state === 'up') {
    state = 'down';
    if (now - lastFeedbackTime > 1000) {
      addFeedback('Lower your arms slowly', 'info');
      lastFeedbackTime = now;
    }
  } else if (avgElbowAngle > 160 && state === 'down') {
    if (now - lastFeedbackTime > 1000) {
      addFeedback('Keep your elbows steady!', 'warning');
      lastFeedbackTime = now;
    }
  }

  (window as any).currentStateRef = state;
}

// Helper function to calculate angle
function calculateAngle(a: any, b: any, c: any) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}
