// exerciseDetectors.ts
// Type definitions for exercise detection system

export interface ExerciseDetectorProps {
  landmarks: any[];
  prevState: any;
}

export interface ExerciseDetectorReturn {
  repDetected: boolean;
  feedback: string[];
  newState: any;
}

export type ExerciseDetector = (props: ExerciseDetectorProps) => ExerciseDetectorReturn;

// Utility functions for angle calculations
export const calculateAngle = (a: any, b: any, c: any): number => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

export const calculateDistance = (point1: any, point2: any): number => {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

// ==================== UPPER BODY EXERCISES ====================

// Bicep Curl Detector
export const bicepCurlDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  
  const rightShoulder = landmarks[12];
  const rightElbow = landmarks[14];
  const rightWrist = landmarks[16];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  // Calculate elbow angles for both arms
  const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  
  const avgAngle = (leftAngle + rightAngle) / 2;

  // Rep detection logic
  if (avgAngle > 160 && !prevState.armDown) {
    newState.armDown = true;
  }

  if (avgAngle < 50 && prevState.armDown) {
    repDetected = true;
    newState.armDown = false;
    feedback.push('Great curl! 💪');
  }

  // Form feedback - only trigger once per movement phase
  const elbowStability = Math.abs(leftElbow.y - leftShoulder.y);
  if (elbowStability > 0.15 && !prevState.elbowWarned) {
    feedback.push('Keep elbows stable at sides');
    newState.elbowWarned = true;
  } else if (elbowStability <= 0.15) {
    newState.elbowWarned = false;
  }

  return { repDetected, feedback, newState };
};

// Push-up Detector
export const pushupDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  const leftHip = landmarks[23];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  
  // Body alignment check
  const bodyAlignment = Math.abs(leftShoulder.y - leftHip.y);
  
  // Down position
  if (elbowAngle < 90 && !prevState.down) {
    newState.down = true;
    feedback.push('Good depth!');
  }

  // Up position - rep complete
  if (elbowAngle > 160 && prevState.down) {
    repDetected = true;
    newState.down = false;
    feedback.push('Perfect push-up! 🔥');
  }

  // Form feedback
  if (bodyAlignment > 0.2) {
    if (leftHip.y > leftShoulder.y + 0.1) {
      feedback.push('Lower your hips');
    } else {
      feedback.push('Raise your hips slightly');
    }
  }

  return { repDetected, feedback, newState };
};

// Bench Press Detector (similar to pushup but inverted)
export const benchPressDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  
  // Bar at chest
  if (elbowAngle < 90 && !prevState.barDown) {
    newState.barDown = true;
    feedback.push('Touch chest');
  }

  // Bar pressed up
  if (elbowAngle > 160 && prevState.barDown) {
    repDetected = true;
    newState.barDown = false;
    feedback.push('Strong press! 💪');
  }

  // Form check
  if (elbowAngle < 160 && !prevState.barDown) {
    feedback.push('Full extension at top');
  }

  return { repDetected, feedback, newState };
};

// Overhead Press Detector
export const overheadPressDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const wristAboveShoulder = leftWrist.y < leftShoulder.y;
  
  // Starting position (at shoulders)
  if (elbowAngle < 110 && !wristAboveShoulder && !prevState.atBottom) {
    newState.atBottom = true;
  }

  // Overhead position
  if (elbowAngle > 160 && wristAboveShoulder && prevState.atBottom) {
    repDetected = true;
    newState.atBottom = false;
    feedback.push('Excellent press! 🎯');
  }

  // Form feedback
  if (wristAboveShoulder && elbowAngle < 160) {
    feedback.push('Lock out at the top');
  }

  return { repDetected, feedback, newState };
};

// Lateral Raises Detector
export const lateralRaisesDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const armHeight = leftShoulder.y - leftWrist.y;
  
  // Arms at sides
  if (armHeight < 0.1 && !prevState.armsDown) {
    newState.armsDown = true;
  }

  // Arms raised to shoulder height
  if (armHeight > 0.3 && prevState.armsDown) {
    repDetected = true;
    newState.armsDown = false;
    feedback.push('Perfect raise! 💪');
  }

  // Form feedback
  if (armHeight > 0.35) {
    feedback.push('Don\'t raise too high');
  }

  const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  if (elbowAngle < 150) {
    feedback.push('Slight bend in elbow only');
  }

  return { repDetected, feedback, newState };
};

// ==================== LOWER BODY EXERCISES ====================

// Squat Detector
export const squatDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const hipHeight = leftHip.y;
  
  // Standing position
  if (kneeAngle > 160 && prevState.squatDown) {
    repDetected = true;
    newState.squatDown = false;
    feedback.push('Great squat! 🦵');
  }

  // Squat down position
  if (kneeAngle < 90 && !prevState.squatDown) {
    newState.squatDown = true;
    feedback.push('Good depth!');
  }

  // Form feedback
  const kneeAnkleDistance = Math.abs(leftKnee.x - leftAnkle.x);
  if (kneeAnkleDistance > 0.15 && prevState.squatDown) {
    feedback.push('Knees over toes ⚠️');
  }

  if (kneeAngle < 110 && kneeAngle > 90) {
    feedback.push('Go deeper for full range');
  }

  return { repDetected, feedback, newState };
};

// Lunges Detector
export const lungesDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const leftKneeAngle = calculateAngle(leftHip, leftKnee, landmarks[27]);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, landmarks[28]);
  
  const minAngle = Math.min(leftKneeAngle, rightKneeAngle);
  
  // Lunge position
  if (minAngle < 100 && !prevState.inLunge) {
    newState.inLunge = true;
    feedback.push('Nice depth!');
  }

  // Back to standing
  if (minAngle > 160 && prevState.inLunge) {
    repDetected = true;
    newState.inLunge = false;
    feedback.push('Perfect lunge! 👍');
  }

  return { repDetected, feedback, newState };
};

// Calf Raises Detector
export const calfRaisesDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];
  const leftHeel = landmarks[29];
  const leftToe = landmarks[31];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const heelHeight = leftAnkle.y - leftToe.y;
  
  // On toes (raised)
  if (heelHeight < -0.05 && !prevState.raised) {
    newState.raised = true;
    feedback.push('Hold at the top!');
  }

  // Heels down
  if (heelHeight > 0.02 && prevState.raised) {
    repDetected = true;
    newState.raised = false;
    feedback.push('Good raise! 🦵');
  }

  // Form feedback
  if (prevState.raised && heelHeight > -0.08) {
    feedback.push('Raise higher on toes');
  }

  return { repDetected, feedback, newState };
};

// ==================== CORE EXERCISES ====================

// Plank Detector
export const plankDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];
  
  const feedback: string[] = [];
  let newState = { ...prevState };

  // Check body alignment
  const shoulderHipDiff = Math.abs(leftShoulder.y - leftHip.y);
  const hipKneeDiff = Math.abs(leftHip.y - leftKnee.y);
  const kneeAnkleDiff = Math.abs(leftKnee.y - leftAnkle.y);
  
  const totalAlignment = shoulderHipDiff + hipKneeDiff + kneeAnkleDiff;
  
  if (totalAlignment < 0.15) {
    feedback.push('Perfect form! Keep holding! 🔥');
    newState.goodForm = true;
  } else {
    if (leftHip.y > leftShoulder.y + 0.1) {
      feedback.push('Lift hips up');
    } else if (leftHip.y < leftShoulder.y - 0.1) {
      feedback.push('Lower hips slightly');
    }
    newState.goodForm = false;
  }

  return { repDetected: false, feedback, newState };
};

// Crunches Detector
export const crunchesDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const leftHip = landmarks[23];
  const nose = landmarks[0];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const shoulderHipDistance = calculateDistance(leftShoulder, leftHip);
  
  // Crunched up
  if (shoulderHipDistance < 0.25 && !prevState.crunchedUp) {
    newState.crunchedUp = true;
    feedback.push('Squeeze abs!');
  }

  // Back down
  if (shoulderHipDistance > 0.35 && prevState.crunchedUp) {
    repDetected = true;
    newState.crunchedUp = false;
    feedback.push('Great crunch! 💪');
  }

  return { repDetected, feedback, newState };
};

// Russian Twists Detector
export const russianTwistsDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState, twistedLeft: prevState.twistedLeft || false, twistedRight: prevState.twistedRight || false };

  const shoulderRotation = leftShoulder.x - rightShoulder.x;
  
  // Twisted left
  if (shoulderRotation > 0.15 && !newState.twistedLeft) {
    newState.twistedLeft = true;
    newState.twistedRight = false;
    if (prevState.twistedRight) {
      repDetected = true;
      feedback.push('Good twist! 🔄');
    }
  }

  // Twisted right
  if (shoulderRotation < -0.15 && !newState.twistedRight) {
    newState.twistedRight = true;
    newState.twistedLeft = false;
    if (prevState.twistedLeft) {
      repDetected = true;
      feedback.push('Good twist! 🔄');
    }
  }

  // Form feedback
  if (Math.abs(shoulderRotation) < 0.1) {
    feedback.push('Twist more to each side');
  }

  return { repDetected, feedback, newState };
};

// ==================== BACK EXERCISES ====================

// Pull-up Detector
export const pullUpDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const wristShoulderDistance = leftWrist.y - leftShoulder.y;
  
  // Hanging position
  if (elbowAngle > 160 && wristShoulderDistance < -0.2 && !prevState.hanging) {
    newState.hanging = true;
  }

  // Pulled up (chin over bar)
  if (wristShoulderDistance > -0.05 && prevState.hanging) {
    repDetected = true;
    newState.hanging = false;
    feedback.push('Awesome pull-up! 💪');
  }

  // Form feedback
  if (prevState.hanging && elbowAngle < 160) {
    feedback.push('Full extension at bottom');
  }

  return { repDetected, feedback, newState };
};

// Bent-Over Rows Detector
export const bentOverRowsDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  const leftHip = landmarks[23];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const elbowWristDistance = Math.abs(leftElbow.y - leftWrist.y);
  const backAngle = Math.abs(leftShoulder.y - leftHip.y);
  
  // Arms extended
  if (elbowWristDistance < 0.05 && !prevState.extended) {
    newState.extended = true;
  }

  // Pulled to chest
  if (elbowWristDistance > 0.15 && prevState.extended) {
    repDetected = true;
    newState.extended = false;
    feedback.push('Strong row! 💪');
  }

  // Form feedback - check if back is bent
  if (backAngle < 0.2) {
    feedback.push('Bend forward more');
  }

  return { repDetected, feedback, newState };
};

// Deadlift Detector
export const deadliftDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];
  const leftShoulder = landmarks[11];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  
  // Bottom position (bent over)
  if (hipAngle < 100 && kneeAngle < 140 && !prevState.bentOver) {
    newState.bentOver = true;
    feedback.push('Set your back!');
  }

  // Standing position
  if (hipAngle > 160 && prevState.bentOver) {
    repDetected = true;
    newState.bentOver = false;
    feedback.push('Perfect deadlift! 🔥');
  }

  // Form feedback
  if (prevState.bentOver && hipAngle < 80) {
    feedback.push('Don\'t round your back');
  }

  return { repDetected, feedback, newState };
};

// ==================== GLUTES EXERCISES ====================

// Hip Thrusts Detector
export const hipThrustsDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const hipKneeAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  
  // Hips down
  if (hipKneeAngle < 120 && !prevState.hipsDown) {
    newState.hipsDown = true;
  }

  // Hips thrust up
  if (hipKneeAngle > 160 && prevState.hipsDown) {
    repDetected = true;
    newState.hipsDown = false;
    feedback.push('Great thrust! 🔥');
  }

  // Form feedback
  if (hipKneeAngle > 170) {
    feedback.push('Squeeze glutes at top!');
  }

  return { repDetected, feedback, newState };
};

// Glute Bridges Detector
export const gluteBridgesDetector: ExerciseDetector = ({ landmarks, prevState }) => {
  const leftShoulder = landmarks[11];
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];
  
  const feedback: string[] = [];
  let repDetected = false;
  let newState = { ...prevState };

  const hipHeight = leftHip.y;
  const shoulderHeight = leftShoulder.y;
  const hipShoulderDiff = shoulderHeight - hipHeight;
  
  // Hips down (on ground)
  if (hipShoulderDiff < 0.1 && !prevState.onGround) {
    newState.onGround = true;
  }

  // Hips raised (bridge position)
  if (hipShoulderDiff > 0.25 && prevState.onGround) {
    repDetected = true;
    newState.onGround = false;
    feedback.push('Perfect bridge! 💪');
  }

  // Form feedback
  if (hipShoulderDiff > 0.2 && hipShoulderDiff < 0.25) {
    feedback.push('Lift hips higher!');
  }

  return { repDetected, feedback, newState };
};

// Export all detectors in a registry
export const exerciseDetectors: Record<string, ExerciseDetector> = {
  // Upper Body
  bicep_curl: bicepCurlDetector,
  pushup: pushupDetector,
  bench_press: benchPressDetector,
  overhead_press: overheadPressDetector,
  lateral_raises: lateralRaisesDetector,
  
  // Lower Body
  squat: squatDetector,
  lunges: lungesDetector,
  calf_raises: calfRaisesDetector,
  
  // Core
  planks: plankDetector,
  crunches: crunchesDetector,
  russian_twists: russianTwistsDetector,
  
  // Back
  pull_up: pullUpDetector,
  bent_over_rows: bentOverRowsDetector,
  deadlift: deadliftDetector,
  
  // Glutes
  hip_thrusts: hipThrustsDetector,
  glute_bridges: gluteBridgesDetector,
};