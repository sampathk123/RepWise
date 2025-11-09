import { NormalizedLandmark } from '@mediapipe/pose';

type FeedbackCallback = (text: string, type: 'info' | 'warning' | 'success') => void;

export function detectSquat(
  landmarks: NormalizedLandmark[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: string,
  reps: { current: number },
  addFeedback: FeedbackCallback
) {
  if (!landmarks[23] || !landmarks[24] || !landmarks[25] || !landmarks[26]) return;

  // Hip, knee, ankle coordinates
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];

  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];

  // Calculate approximate knee angles
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  // Draw knee angle on canvas
  ctx.fillStyle = 'yellow';
  ctx.font = '16px Arial';
  ctx.fillText(`Knee Angle: ${Math.round(avgKneeAngle)}`, leftKnee.x * width, leftKnee.y * height - 10);

  // Squat detection logic
  if (avgKneeAngle < 70 && state === 'up') {
    state = 'down';
    addFeedback('Good depth! Now stand up.', 'success');
  } else if (avgKneeAngle > 160 && state === 'down') {
    state = 'up';
    reps.current += 1;
    addFeedback('Rep counted! Keep going.', 'success');
  } else if (avgKneeAngle > 160 && state === 'up') {
    addFeedback('Stand straight before starting squat.', 'info');
  } else if (avgKneeAngle < 70 && state === 'down') {
    addFeedback('Go a bit lower for full depth.', 'warning');
  }

  // Update state reference
  (window as any).currentStateRef = state;
}

// Helper to calculate angle between 3 points
function calculateAngle(a: any, b: any, c: any) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}
