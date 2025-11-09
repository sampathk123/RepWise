import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Play, Clock, Target, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExercisePanelProps {
  selectedMuscle: string | null;
  onStartFormCheck?: (exerciseName: string, exerciseId: string) => void;
}

const exerciseData: Record<string, any> = {
  chest: {
    name: 'Chest',
    exercises: [
      {
        id: 'pushup',
        name: 'Push-Ups',
        difficulty: 'Beginner',
        duration: '3 sets × 12 reps',
        description: 'Classic bodyweight exercise targeting the chest, shoulders, and triceps.',
        tips: ['Keep your body in a straight line', 'Lower until chest nearly touches floor', 'Push explosively back up'],
        hasFormCheck: true,
      },
      {
        id: 'bench_press',
        name: 'Bench Press',
        difficulty: 'Intermediate',
        duration: '4 sets × 8-10 reps',
        description: 'Fundamental chest exercise for building mass and strength.',
        tips: ['Keep feet flat on floor', 'Lower bar to mid-chest', 'Drive through your chest'],
        hasFormCheck: true,
      },
      {
        id: 'dumbbell_flyes',
        name: 'Dumbbell Flyes',
        difficulty: 'Intermediate',
        duration: '3 sets × 12 reps',
        description: 'Isolation exercise for chest development and stretch.',
        tips: ['Slight bend in elbows', 'Feel the stretch at bottom', 'Control the movement'],
        hasFormCheck: true,
      },
    ],
  },
  shoulders: {
    name: 'Shoulders',
    exercises: [
      {
        id: 'overhead_press',
        name: 'Overhead Press',
        difficulty: 'Intermediate',
        duration: '4 sets × 8 reps',
        description: 'Compound movement for overall shoulder development.',
        tips: ['Keep core tight', 'Press straight overhead', 'Control the descent'],
        hasFormCheck: true,
      },
      {
        id: 'lateral_raises',
        name: 'Lateral Raises',
        difficulty: 'Beginner',
        duration: '3 sets × 15 reps',
        description: 'Isolation exercise targeting the lateral deltoids.',
        tips: ['Slight bend in elbows', 'Raise to shoulder height', 'Control on the way down'],
        hasFormCheck: true,
      },
      {
        id: 'face_pulls',
        name: 'Face Pulls',
        difficulty: 'Beginner',
        duration: '3 sets × 15 reps',
        description: 'Excellent for rear delts and shoulder health.',
        tips: ['Pull towards face', 'Squeeze shoulder blades', 'Keep elbows high'],
        hasFormCheck: true,
      },
    ],
  },
  biceps: {
    name: 'Biceps',
    exercises: [
      {
        id: 'bicep_curl',
        name: 'Bicep Curls',
        difficulty: 'Beginner',
        duration: '3 sets × 10 reps',
        description: 'Classic bicep builder for mass and strength.',
        tips: ['Keep elbows stationary', 'Control the weight', 'Full range of motion'],
        hasFormCheck: true,
      },
      {
        id: 'hammer_curls',
        name: 'Hammer Curls',
        difficulty: 'Beginner',
        duration: '3 sets × 12 reps',
        description: 'Targets biceps and forearms with neutral grip.',
        tips: ['Thumbs pointing up', 'No swinging', 'Squeeze at top'],
        hasFormCheck: true,
      },
    ],
  },
  abs: {
    name: 'Abs',
    exercises: [
      {
        id: 'planks',
        name: 'Planks',
        difficulty: 'Beginner',
        duration: '3 sets × 45 sec',
        description: 'Core stability exercise for overall abdominal strength.',
        tips: ['Keep body straight', 'Engage your core', 'Breathe steadily'],
        hasFormCheck: true,
      },
      {
        id: 'crunches',
        name: 'Crunches',
        difficulty: 'Beginner',
        duration: '3 sets × 20 reps',
        description: 'Traditional ab exercise for upper abdominals.',
        tips: ['Hands behind head', 'Lift with abs, not neck', 'Controlled movement'],
        hasFormCheck: true,
      },
      {
        id: 'russian_twists',
        name: 'Russian Twists',
        difficulty: 'Intermediate',
        duration: '3 sets × 30 reps',
        description: 'Rotational exercise for obliques.',
        tips: ['Keep feet elevated', 'Twist from core', 'Touch floor each side'],
        hasFormCheck: true,
      },
    ],
  },
  quads: {
    name: 'Quads',
    exercises: [
      {
        id: 'squat',
        name: 'Squats',
        difficulty: 'Intermediate',
        duration: '4 sets × 8-10 reps',
        description: 'King of leg exercises for overall quad development.',
        tips: ['Feet shoulder-width', 'Knees track over toes', 'Go deep'],
        hasFormCheck: true,
      },
      {
        id: 'lunges',
        name: 'Lunges',
        difficulty: 'Beginner',
        duration: '3 sets × 12 reps each leg',
        description: 'Unilateral movement for balanced leg development.',
        tips: ['Step forward controlled', 'Back knee nearly touches', 'Push through front heel'],
        hasFormCheck: true,
      },
      {
        id: 'leg_extensions',
        name: 'Leg Extensions',
        difficulty: 'Beginner',
        duration: '3 sets × 15 reps',
        description: 'Isolation exercise for quad definition.',
        tips: ['Full extension', 'Control the weight', 'Squeeze at top'],
        hasFormCheck: true,
      },
    ],
  },
  calves: {
    name: 'Calves',
    exercises: [
      {
        id: 'calf_raises',
        name: 'Calf Raises',
        difficulty: 'Beginner',
        duration: '4 sets × 15-20 reps',
        description: 'Essential exercise for calf development.',
        tips: ['Full range of motion', 'Pause at top', 'Control the descent'],
        hasFormCheck: true,
      },
      {
        id: 'seated_calf_raises',
        name: 'Seated Calf Raises',
        difficulty: 'Beginner',
        duration: '3 sets × 15 reps',
        description: 'Targets the soleus muscle.',
        tips: ['Knees at 90 degrees', 'Push through balls of feet', 'Hold at peak'],
        hasFormCheck: true,
      },
    ],
  },
  traps: {
    name: 'Traps',
    exercises: [
      {
        id: 'barbell_shrugs',
        name: 'Barbell Shrugs',
        difficulty: 'Beginner',
        duration: '4 sets × 12 reps',
        description: 'Primary exercise for upper trap development.',
        tips: ['Straight up and down', 'Hold at top', 'Control the weight'],
        hasFormCheck: true,
      },
      {
        id: 'farmer_walks',
        name: 'Farmer Walks',
        difficulty: 'Intermediate',
        duration: '3 sets × 40 seconds',
        description: 'Functional exercise for traps and grip.',
        tips: ['Stand tall', 'Shoulders back', 'Walk controlled'],
        hasFormCheck: true,
      },
    ],
  },
  lats: {
    name: 'Lats',
    exercises: [
      {
        id: 'pull_up',
        name: 'Pull-Ups',
        difficulty: 'Intermediate',
        duration: '4 sets × 8-10 reps',
        description: 'Premier lat-building exercise.',
        tips: ['Full hang at bottom', 'Pull with lats, not arms', 'Chest to bar'],
        hasFormCheck: true,
      },
      {
        id: 'lat_pulldowns',
        name: 'Lat Pulldowns',
        difficulty: 'Beginner',
        duration: '3 sets × 12 reps',
        description: 'Great alternative to pull-ups for lat development.',
        tips: ['Lean back slightly', 'Pull to upper chest', 'Squeeze lats'],
        hasFormCheck: true,
      },
      {
        id: 'bent_over_rows',
        name: 'Bent-Over Rows',
        difficulty: 'Intermediate',
        duration: '4 sets × 10 reps',
        description: 'Compound movement for back thickness.',
        tips: ['Hip hinge position', 'Pull to lower chest', 'Squeeze shoulder blades'],
        hasFormCheck: true,
      },
    ],
  },
  glutes: {
    name: 'Glutes',
    exercises: [
      {
        id: 'hip_thrusts',
        name: 'Hip Thrusts',
        difficulty: 'Intermediate',
        duration: '4 sets × 10 reps',
        description: 'Most effective exercise for glute activation.',
        tips: ['Shoulders on bench', 'Drive through heels', 'Full hip extension'],
        hasFormCheck: true,
      },
      {
        id: 'glute_bridges',
        name: 'Glute Bridges',
        difficulty: 'Beginner',
        duration: '3 sets × 15 reps',
        description: 'Bodyweight exercise for glute strength.',
        tips: ['Squeeze at top', 'Keep core engaged', 'Control movement'],
        hasFormCheck: true,
      },
    ],
  },
  hamstrings: {
    name: 'Hamstrings',
    exercises: [
      {
        id: 'deadlift',
        name: 'Romanian Deadlifts',
        difficulty: 'Intermediate',
        duration: '4 sets × 10 reps',
        description: 'Premier hamstring builder.',
        tips: ['Slight knee bend', 'Hinge at hips', 'Feel the stretch'],
        hasFormCheck: true,
      },
      {
        id: 'leg_curls',
        name: 'Leg Curls',
        difficulty: 'Beginner',
        duration: '3 sets × 12 reps',
        description: 'Isolation exercise for hamstrings.',
        tips: ['Full range of motion', 'Squeeze at top', 'Control the weight'],
        hasFormCheck: true,
      },
    ],
  },
  forearms: {
    name: 'Forearms',
    exercises: [
      {
        id: 'wrist_curls',
        name: 'Wrist Curls',
        difficulty: 'Beginner',
        duration: '3 sets × 15 reps',
        description: 'Develops forearm flexors.',
        tips: ['Forearms on bench', 'Full range of motion', 'Control the movement'],
        hasFormCheck: true,
      },
      {
        id: 'dead_hangs',
        name: 'Dead Hangs',
        difficulty: 'Beginner',
        duration: '3 sets × 30 seconds',
        description: 'Builds grip strength and forearm endurance.',
        tips: ['Fully extended arms', 'Active hang', 'Breathe steadily'],
        hasFormCheck: true,
      },
    ],
  },
  'lower-back': {
    name: 'Lower Back',
    exercises: [
      {
        id: 'deadlift',
        name: 'Deadlifts',
        difficulty: 'Advanced',
        duration: '4 sets × 5 reps',
        description: 'Fundamental exercise for lower back and overall strength.',
        tips: ['Keep back neutral', 'Drive through heels', 'Hinge at hips'],
        hasFormCheck: true,
      },
      {
        id: 'superman_holds',
        name: 'Superman Holds',
        difficulty: 'Beginner',
        duration: '3 sets × 30 seconds',
        description: 'Bodyweight exercise for lower back strength.',
        tips: ['Arms extended', 'Lift chest and legs', 'Hold the position'],
        hasFormCheck: true,
      },
    ],
  },
};

export function ExercisePanel({ selectedMuscle, onStartFormCheck }: ExercisePanelProps) {
  const muscleInfo = selectedMuscle ? exerciseData[selectedMuscle] : null;

  return (
    <AnimatePresence mode="wait">
      {muscleInfo ? (
        <motion.div
          key={selectedMuscle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-slate-900 mb-2">{muscleInfo.name} Exercises</h2>
              <p className="text-slate-600 text-sm">
                {muscleInfo.exercises.length} exercises available
              </p>
            </div>

            <div className="space-y-4">
              {muscleInfo.exercises.map((exercise: any) => (
                <Card key={exercise.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-slate-900 mb-1">{exercise.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{exercise.duration}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        exercise.difficulty === 'Beginner'
                          ? 'secondary'
                          : exercise.difficulty === 'Intermediate'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {exercise.difficulty}
                    </Badge>
                  </div>

                  <p className="text-slate-700 text-sm mb-3">{exercise.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Target className="w-4 h-4 text-teal-600" />
                      <span>Form Tips:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 ml-6">
                      {exercise.tips.map((tip: string, index: number) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <button 
                    onClick={() => window.open('https://youtu.be/3R14MnZbcpw?si=S3mA9lElAKAqOa0v', '_blank')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-colors flex items-center justify-center gap-2">

                      <Play className="w-4 h-4" />
                      Watch Tutorial
                    </button>
                    
                    {exercise.hasFormCheck && onStartFormCheck && (
                      <button 
                        onClick={() => onStartFormCheck(exercise.name, exercise.id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Start Form Check
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </motion.div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-slate-900 mb-2">Select a Muscle Group</h3>
          <p className="text-slate-600 text-sm">
            Click on any muscle group on the body map to view targeted exercises and workout tips.
          </p>
        </Card>
      )}
    </AnimatePresence>
  );
}