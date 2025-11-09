// processors/bicepCurlProcessor.ts

import {
  calculateAngle,
  getLandmark,
  isVisible,
  GOOD_COLOR,
  BAD_COLOR,
  NEUTRAL_COLOR,
} from '../exerciseUtils';
import type { ExerciseState, FeedbackResult, VisualCue } from '../exerciseUtils';

/**
 * Bicep Curl Exercise Processor
 * Tracks: Elbow angle, elbow stability, shoulder stability
 */
export function processBicepCurl(
  landmarks: any[],
  state: ExerciseState,
  canvasWidth: number,
  canvasHeight: number
): FeedbackResult {
  // Get required landmarks
  const rightShoulder = getLandmark(landmarks, 'RIGHT_SHOULDER');
  const rightElbow = getLandmark(landmarks, 'RIGHT_ELBOW');
  const rightWrist = getLandmark(landmarks, 'RIGHT_WRIST');
  const rightHip = getLandmark(landmarks, 'RIGHT_HIP');

  const visualCues: VisualCue[] = [];
  let feedback = 'Keep your elbow stable';
  let feedbackType: 'info' | 'warning' | 'success' = 'info';

  // Check if all landmarks are visible
  if (!rightShoulder || !rightElbow || !rightWrist || !rightHip) {
    return {
      repCount: state.reps,
      state: state.current,
      feedback: '⚠ Position yourself so your arm is fully visible',
      feedbackType: 'warning',
      visualCues: [],
    };
  }

  if (!isVisible(rightShoulder) || !isVisible(rightElbow) || !isVisible(rightWrist)) {
    return {
      repCount: state.reps,
      state: state.current,
      feedback: '⚠ Keep your full arm in frame',
      feedbackType: 'warning',
      visualCues: [],
    };
  }

  // Calculate key angles
  const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  
  // Calculate elbow displacement (checking if elbow stays stable)
  const elbowY = rightElbow.y * canvasHeight;
  const shoulderY = rightShoulder.y * canvasHeight;
  const elbowDisplacement = Math.abs(elbowY - shoulderY);

  // Determine arm line color based on form
  let armLineColor = GOOD_COLOR;
  let elbowCircleColor = GOOD_COLOR;

  // Form checks
  const goodElbowPosition = elbowDisplacement < 80; // Elbow should stay relatively close to body
  const fullExtension = elbowAngle > 160;
  const fullContraction = elbowAngle < 50;

  // Check elbow stability
  if (!goodElbowPosition) {
    feedback = '⚠ Keep your elbow close to your body!';
    feedbackType = 'warning';
    elbowCircleColor = BAD_COLOR;
    armLineColor = BAD_COLOR;
  }

  // Rep counting state machine
  if (fullContraction && state.current === 'down' && goodElbowPosition) {
    state.current = 'up';
    state.reps += 1;
    feedback = `✓ Rep ${state.reps} complete! Great form!`;
    feedbackType = 'success';
    armLineColor = GOOD_COLOR;
    elbowCircleColor = GOOD_COLOR;
  } else if (fullExtension && state.current === 'up') {
    state.current = 'down';
    feedback = 'Lower slowly with control';
    feedbackType = 'info';
    armLineColor = NEUTRAL_COLOR;
  } else if (elbowAngle < 90 && state.current === 'down') {
    feedback = 'Curl up! Squeeze at the top';
    feedbackType = 'info';
    armLineColor = NEUTRAL_COLOR;
  } else if (elbowAngle > 90 && elbowAngle < 160 && state.current === 'up') {
    feedback = 'Extend fully to complete rep';
    feedbackType = 'info';
    armLineColor = NEUTRAL_COLOR;
  }

  // Draw arm line (shoulder -> elbow -> wrist)
  visualCues.push({
    type: 'line',
    points: [
      { x: rightShoulder.x * canvasWidth, y: rightShoulder.y * canvasHeight },
      { x: rightElbow.x * canvasWidth, y: rightElbow.y * canvasHeight },
      { x: rightWrist.x * canvasWidth, y: rightWrist.y * canvasHeight },
    ],
    color: armLineColor,
  });

  // Draw elbow circle (main focus point)
  visualCues.push({
    type: 'circle',
    points: [{ x: rightElbow.x * canvasWidth, y: rightElbow.y * canvasHeight }],
    color: elbowCircleColor,
  });

  // Draw shoulder reference circle
  visualCues.push({
    type: 'circle',
    points: [{ x: rightShoulder.x * canvasWidth, y: rightShoulder.y * canvasHeight }],
    color: goodElbowPosition ? GOOD_COLOR : BAD_COLOR,
  });

  // Add elbow angle label
  visualCues.push({
    type: 'angle',
    points: [{ x: rightElbow.x * canvasWidth, y: rightElbow.y * canvasHeight }],
    color: '#ffffff',
    label: `${Math.round(elbowAngle)}°`,
  });

  // Add form indicator if elbow is moving too much
  if (!goodElbowPosition) {
    visualCues.push({
      type: 'line',
      points: [
        { x: rightShoulder.x * canvasWidth, y: rightShoulder.y * canvasHeight },
        { x: rightElbow.x * canvasWidth, y: rightElbow.y * canvasHeight },
      ],
      color: BAD_COLOR,
    });
  }

  return {
    repCount: state.reps,
    state: state.current,
    feedback,
    feedbackType,
    visualCues,
  };
}

// Export metadata about this exercise
export const bicepCurlMetadata = {
  name: 'Bicep Curl',
  muscleGroup: 'biceps',
  difficulty: 'Beginner',
  equipment: ['dumbbells', 'barbell', 'resistance-band'],
  keyPoints: [
    'Keep elbows close to body',
    'Control the descent',
    'Full range of motion',
    'Don\'t swing or use momentum',
  ],
  commonMistakes: [
    'Moving elbows forward',
    'Using momentum',
    'Partial range of motion',
    'Arching back',
  ],
};