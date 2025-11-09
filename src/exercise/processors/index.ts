// processors/index.ts - Main router for all exercise processors

import { processBicepCurl, bicepCurlMetadata } from './bicepCurlProcessor';
import { processShoulderPress, shoulderPressMetadata } from './shoulderPressProcessor';
import type { ExerciseState, FeedbackResult } from '../exerciseUtils';

/**
 * Exercise processor type definition
 */
export type ExerciseProcessor = (
  landmarks: any[],
  state: ExerciseState,
  canvasWidth: number,
  canvasHeight: number
) => FeedbackResult;

/**
 * Exercise metadata type
 */
export interface ExerciseMetadata {
  name: string;
  muscleGroup: string;
  difficulty: string;
  equipment: string[];
  keyPoints: string[];
  commonMistakes: string[];
}

/**
 * Registry of available exercise processors
 */
const exerciseRegistry: Record<
  string,
  {
    processor: ExerciseProcessor;
    metadata: ExerciseMetadata;
  }
> = {
  // --- Biceps ---
  'bicep-curl': {
    processor: processBicepCurl,
    metadata: bicepCurlMetadata,
  },
  'biceps': {
    processor: processBicepCurl,
    metadata: bicepCurlMetadata,
  },

  // --- Shoulders ---
  'shoulder-press': {
    processor: processShoulderPress,
    metadata: shoulderPressMetadata,
  },
  'shoulder': {
    processor: processShoulderPress,
    metadata: shoulderPressMetadata,
  },
};

/**
 * Main router to process the exercise
 */
export function processExercise(
  exerciseId: string,
  landmarks: any[],
  state: ExerciseState,
  canvasWidth: number,
  canvasHeight: number
): FeedbackResult {
  const normalizedId = exerciseId.toLowerCase().trim();
  const exercise = exerciseRegistry[normalizedId];

  if (!exercise) {
    console.warn(`⚠️ No processor found for exercise: ${exerciseId}. Defaulting to bicep curl.`);
    return processBicepCurl(landmarks, state, canvasWidth, canvasHeight);
  }

  return exercise.processor(landmarks, state, canvasWidth, canvasHeight);
}

/**
 * Get metadata for a specific exercise
 */
export function getExerciseMetadata(exerciseId: string): ExerciseMetadata | null {
  const normalizedId = exerciseId.toLowerCase().trim();
  return exerciseRegistry[normalizedId]?.metadata || null;
}

/**
 * Get all available exercises
 */
export function getAllExercises(): Array<{ id: string; metadata: ExerciseMetadata }> {
  const uniqueExercises = new Map<string, ExerciseMetadata>();

  Object.entries(exerciseRegistry).forEach(([id, { metadata }]) => {
    if (!uniqueExercises.has(metadata.name)) {
      uniqueExercises.set(metadata.name, metadata);
    }
  });

  return Array.from(uniqueExercises.entries()).map(([name, metadata]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    metadata,
  }));
}

/**
 * Check if an exercise processor exists
 */
export function hasExerciseProcessor(exerciseId: string): boolean {
  const normalizedId = exerciseId.toLowerCase().trim();
  return normalizedId in exerciseRegistry;
}

// Export for direct use if needed
export {
  processBicepCurl,
  processShoulderPress,
  bicepCurlMetadata,
  shoulderPressMetadata,
};
