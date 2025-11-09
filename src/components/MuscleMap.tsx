import { Card } from './ui/card';
import { ExercisePanel } from './ExercisePanel';
import { motion } from 'motion/react';
import { useState } from 'react';

interface MuscleMapProps {
  selectedMuscle: string | null;
  onSelectMuscle: (muscle: string) => void;
  onStartFormCheck: (exerciseName: string, exerciseId: string) => void;
}

interface MuscleGroup {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const muscleGroups: MuscleGroup[] = [
  { id: 'chest', label: 'Chest', color: '#3b82f6', x: 50, y: 25, width: 15, height: 12 },
  { id: 'shoulders', label: 'Shoulders', color: '#06b6d4', x: 35, y: 20, width: 10, height: 8 },
  { id: 'shoulders-right', label: 'Shoulders', color: '#06b6d4', x: 70, y: 20, width: 10, height: 8 },
  { id: 'biceps', label: 'Biceps', color: '#0ea5e9', x: 30, y: 30, width: 8, height: 12 },
  { id: 'biceps-right', label: 'Biceps', color: '#0ea5e9', x: 77, y: 30, width: 8, height: 12 },
  { id: 'abs', label: 'Abs', color: '#14b8a6', x: 50, y: 40, width: 15, height: 15 },
  { id: 'forearms', label: 'Forearms', color: '#10b981', x: 28, y: 45, width: 6, height: 10 },
  { id: 'forearms-right', label: 'Forearms', color: '#10b981', x: 81, y: 45, width: 6, height: 10 },
  { id: 'quads', label: 'Quads', color: '#059669', x: 45, y: 60, width: 8, height: 18 },
  { id: 'quads-right', label: 'Quads', color: '#059669', x: 62, y: 60, width: 8, height: 18 },
  { id: 'calves', label: 'Calves', color: '#047857', x: 46, y: 82, width: 6, height: 12 },
  { id: 'calves-right', label: 'Calves', color: '#047857', x: 63, y: 82, width: 6, height: 12 },
];

const backMuscleGroups: MuscleGroup[] = [
  { id: 'traps', label: 'Traps', color: '#8b5cf6', x: 50, y: 18, width: 15, height: 8 },
  { id: 'lats', label: 'Lats', color: '#7c3aed', x: 42, y: 28, width: 12, height: 15 },
  { id: 'lats-right', label: 'Lats', color: '#7c3aed', x: 61, y: 28, width: 12, height: 15 },
  { id: 'lower-back', label: 'Lower Back', color: '#6366f1', x: 48, y: 45, width: 19, height: 10 },
  { id: 'glutes', label: 'Glutes', color: '#4f46e5', x: 47, y: 56, width: 21, height: 12 },
  { id: 'hamstrings', label: 'Hamstrings', color: '#4338ca', x: 45, y: 68, width: 8, height: 15 },
  { id: 'hamstrings-right', label: 'Hamstrings', color: '#4338ca', x: 62, y: 68, width: 8, height: 15 },
];

export function MuscleMap({ selectedMuscle, onSelectMuscle, onStartFormCheck }: MuscleMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const currentMuscles = view === 'front' ? muscleGroups : backMuscleGroups;

  const handleMuscleClick = (muscleId: string) => {
    const baseMuscleId = muscleId.replace('-right', '');
    onSelectMuscle(baseMuscleId);
  };

  return (
    <div className="grid lg:grid-cols-[1fr,400px] gap-6">
      {/* Muscle Map */}
      <Card className="p-6">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setView('front')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              view === 'front' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Front View
          </button>
          <button
            onClick={() => setView('back')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              view === 'back' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Back View
          </button>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-md aspect-[3/4]">
            <svg
              viewBox="0 0 115 100"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
            >
              {/* Body Outline */}
              <ellipse cx="57.5" cy="15" rx="8" ry="9" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
              <rect x="45" y="23" width="25" height="35" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
              <rect x="25" y="25" width="15" height="35" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
              <rect x="75" y="25" width="15" height="35" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
              <rect x="42" y="60" width="12" height="35" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
              <rect x="61" y="60" width="12" height="35" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />

              {/* Muscle Groups */}
              {currentMuscles.map((muscle) => (
                <motion.g
                  key={muscle.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMuscleClick(muscle.id)}
                  className="cursor-pointer"
                >
                  <rect
                    x={muscle.x}
                    y={muscle.y}
                    width={muscle.width}
                    height={muscle.height}
                    rx="2"
                    fill={muscle.color}
                    opacity={selectedMuscle === muscle.id.replace('-right', '') ? 0.9 : 0.6}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  <title>{muscle.label}</title>
                </motion.g>
              ))}
            </svg>
          </div>
        </div>

        <div className="mt-6 text-center text-slate-600 text-sm">
          Click on any muscle group to view targeted exercises
        </div>
      </Card>

      {/* Exercise Panel */}
      <div>
        <ExercisePanel selectedMuscle={selectedMuscle} onStartFormCheck={onStartFormCheck} />
      </div>
    </div>
  );
}
