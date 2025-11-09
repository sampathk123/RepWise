// processors/shoulderPressProcessor.ts

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
 * Shoulder Press Exercise Processor
 * Tracks: Elbow angle, arm alignment, wrist position, core stability
 */
export function processShoulderPress(
  landmarks: any[],
  state: ExerciseState,
  canvasWidth: number,
  canvasHeight: number
): FeedbackResult {
  // Get required landmarks (using right side)
  const rightShoulder = getLandmark(landmarks, 'RIGHT_SHOULDER');
  const rightElbow = getLandmark(landmarks, 'RIGHT_ELBOW');
  const rightWrist = getLandmark(landmarks, 'RIGHT_WRIST');
  const rightHip = getLandmark(landmarks, 'RIGHT_HIP');
  const leftShoulder = getLandmark(landmarks, 'LEFT_SHOULDER');
  const leftHip = getLandmark(landmarks, 'LEFT_HIP');

  const visualCues: VisualCue[] = [];
  let feedback = 'Press overhead with control';
  let feedbackType: 'info' | 'warning' | 'success' = 'info';

  // Check if all landmarks are visible
  if (!rightShoulder || !rightElbow || !rightWrist || !rightHip) {
    return {
      repCount: state.reps,
      state: state.current,
      feedback: '⚠ Position yourself so your upper body is visible',
      feedbackType: 'warning',
      visualCues: [],
    };
  }

  if (!isVisible(rightShoulder) || !isVisible(rightElbow) || !isVisible(rightWrist)) {
    return {
      repCount: state.reps,
      state: state.current,
      feedback: '⚠ Keep your arms in frame',
      feedbackType: 'warning',
      visualCues: [],
    };
  }

  // Calculate key angles
  const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const shoulderAngle = calculateAngle(rightHip, rightShoulder, rightElbow);
  
  // Check if wrist is above elbow (weight should be overhead at top)
  const wristAboveElbow = rightWrist.y < rightElbow.y;
  const elbowAboveShoulder = rightElbow.y < rightShoulder.y;

  // Determine colors
  let armColor = GOOD_COLOR;
  let shoulderColor = GOOD_COLOR;

  // Form validation
  const fullyPressed = elbowAngle > 160 && wristAboveElbow;
  const inStartPosition = elbowAngle < 100 && elbowAboveShoulder;
  const goodShoulderPosition = shoulderAngle > 70 && shoulderAngle < 110; // Arms should be roughly vertical

  // Check core stability (hips shouldn't shift too much)
  let coreStable = true;
  if (leftHip && rightHip) {
    const hipAlignment = Math.abs(leftHip.y - rightHip.y) * canvasHeight;
    coreStable = hipAlignment < 30; // Hips should stay level
  }

  // State machine and feedback
  if (!coreStable) {
    feedback = '⚠ Keep your core engaged! Hips should stay level';
    feedbackType = 'warning';
    shoulderColor = BAD_COLOR;
  } else if (!goodShoulderPosition && elbowAngle > 100) {
    feedback = '⚠ Keep arms more vertical! Elbows under wrists';
    feedbackType = 'warning';
    armColor = BAD_COLOR;
  } else if (fullyPressed && state.current === 'down') {
    state.current = 'up';
    state.reps += 1;
    feedback = `✓ Rep ${state.reps} complete! Lock out at the top!`;
    feedbackType = 'success';
    armColor = GOOD_COLOR;
  } else if (inStartPosition && state.current === 'up') {
    state.current = 'down';
    feedback = 'Good! Now press up explosively';
    feedbackType = 'info';
    armColor = GOOD_COLOR;
  } else if (elbowAngle > 160 && state.current === 'up') {
    feedback = 'Lower with control to starting position';
    feedbackType = 'info';
    armColor = NEUTRAL_COLOR;
  } else if (elbowAngle < 100 && state.current === 'down') {
    feedback = 'Press up! Drive through your shoulders';
    feedbackType = 'info';
    armColor = NEUTRAL_COLOR;
  } else if (elbowAngle > 100 && elbowAngle < 160) {
    if (state.current === 'down') {
      feedback = 'Keep pressing! Lock out at the top';
    } else {
      feedback = 'Lower to 90° at the elbows';
    }
    feedbackType = 'info';
    armColor = NEUTRAL_COLOR;
  }

  // Draw arm line (shoulder -> elbow -> wrist)
  visualCues.push({
    type: 'line',
    points: [
      { x: rightShoulder.x * canvasWidth, y: rightShoulder.y * canvasHeight },
      { x: rightElbow.x * canvasWidth, y: rightElbow.y * canvasHeight },
      { x: rightWrist.x * canvasWidth, y: rightWrist.y * canvasHeight },
    ],
    color: armColor,
  });

  // Draw body line for posture check (hip -> shoulder)
  if (rightHip) {
    visualCues.push({
      type: 'line',
      points: [
        { x: rightHip.x * canvasWidth, y: rightHip.y * canvasHeight },
        { x: rightShoulder.x * canvasWidth, y: rightShoulder.y * canvasHeight },
      ],
      color: shoulderColor,
    });
  }

  // Draw elbow circle
  visualCues.push({
    type: 'circle',
    points: [{ x: rightElbow.x * canvasWidth, y: rightElbow.y * canvasHeight }],
    color: armColor,
  });

  // Draw shoulder circle
  visualCues.push({
    type: 'circle',
    points: [{ x: rightShoulder.x * canvasWidth, y: rightShoulder.y * canvasHeight }],
    color: shoulderColor,
  });

  // Add angle labels
  visualCues.push({
    type: 'angle',
    points: [{ x: rightElbow.x * canvasWidth, y: rightElbow.y * canvasHeight }],
    color: '#ffffff',
    label: `Elbow: ${Math.round(elbowAngle)}°`,
  });

  return {
    repCount: state.reps,
    state: state.current,
    feedback,
    feedbackType,
    visualCues,
  };
}

export const shoulderPressMetadata = {
  name: 'Shoulder Press',
  muscleGroup: 'shoulders',
  difficulty: 'Intermediate' as const,
  equipment: ['dumbbells', 'barbell'],
  keyPoints: [
    'Start with weights at shoulder height',
    'Press straight overhead until arms are locked',
    'Keep core engaged throughout',
    'Lower with control to starting position',
    'Don\'t arch your back',
  ],
  commonMistakes: [
    'Arching back excessively',
    'Not pressing fully overhead',
    'Elbows too far forward',
    'Using momentum',
    'Partial range of motion',
  ],
};