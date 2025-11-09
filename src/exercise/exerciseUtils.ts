// exerciseUtils.ts - Ported from Python utils.py

export interface Landmark {
  x: number;
  y: number;
  confidence: number;
}

export interface FeedbackResult {
  //metrics: FeedbackResult | null;
  repCount: number;
  state: string;
  feedback: string;
  feedbackType: 'info' | 'warning' | 'success';
  visualCues: VisualCue[];
}

export interface ExerciseState {
  current: string;
  reps: number;
  lastFeedbackTime: number;
}

export interface VisualCue {
  type: 'circle' | 'line' | 'angle';
  points: { x: number; y: number }[];
  color: string;
  label?: string;
}

// YOLO Keypoint Mapping (COCO 17 keypoints)
export const YOLO_KEYPOINT_MAP: Record<string, number> = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
};

export const GOOD_COLOR = '#00ff00'; // Green
export const BAD_COLOR = '#ff0000'; // Red
export const NEUTRAL_COLOR = '#13f679ff'; // Green

/**
 * Calculate angle between three points
 */
export function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Get landmark coordinates from pose results
 */
export function getLandmark(
  landmarks: any[],
  partName: string
): { x: number; y: number; visibility: number } | null {
  const index = YOLO_KEYPOINT_MAP[partName];
  if (index === undefined || !landmarks[index]) return null;
  
  const lm = landmarks[index];
  return {
    x: lm.x,
    y: lm.y,
    visibility: lm.visibility || 1,
  };
}

/**
 * Check if landmark is visible enough
 */
export function isVisible(landmark: any, threshold = 0.5): boolean {
  return landmark && landmark.visibility > threshold;
}