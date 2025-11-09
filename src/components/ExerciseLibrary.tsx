import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Play, Clock, TrendingUp, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const allExercises = [
  {
    id: 1,
    name: 'Push-Ups',
    category: 'Chest',
    difficulty: 'Beginner',
    duration: '3 sets × 12 reps',
    equipment: 'None',
    calories: 85,
  },
  {
    id: 2,
    name: 'Squats',
    category: 'Quads',
    difficulty: 'Intermediate',
    duration: '4 sets × 8-10 reps',
    equipment: 'Barbell',
    calories: 120,
  },
  {
    id: 3,
    name: 'Pull-Ups',
    category: 'Lats',
    difficulty: 'Intermediate',
    duration: '4 sets × 8-10 reps',
    equipment: 'Pull-up Bar',
    calories: 95,
  },
  {
    id: 4,
    name: 'Planks',
    category: 'Abs',
    difficulty: 'Beginner',
    duration: '3 sets × 45 sec',
    equipment: 'None',
    calories: 70,
  },
  {
    id: 5,
    name: 'Deadlifts',
    category: 'Lower Back',
    difficulty: 'Advanced',
    duration: '4 sets × 5 reps',
    equipment: 'Barbell',
    calories: 150,
  },
  {
    id: 6,
    name: 'Overhead Press',
    category: 'Shoulders',
    difficulty: 'Intermediate',
    duration: '4 sets × 8 reps',
    equipment: 'Barbell',
    calories: 100,
  },
  {
    id: 7,
    name: 'Barbell Curls',
    category: 'Biceps',
    difficulty: 'Beginner',
    duration: '3 sets × 10 reps',
    equipment: 'Barbell',
    calories: 60,
  },
  {
    id: 8,
    name: 'Hip Thrusts',
    category: 'Glutes',
    difficulty: 'Intermediate',
    duration: '4 sets × 10 reps',
    equipment: 'Barbell',
    calories: 110,
  },
  {
    id: 9,
    name: 'Calf Raises',
    category: 'Calves',
    difficulty: 'Beginner',
    duration: '4 sets × 15-20 reps',
    equipment: 'None',
    calories: 50,
  },
  {
    id: 10,
    name: 'Romanian Deadlifts',
    category: 'Hamstrings',
    difficulty: 'Intermediate',
    duration: '4 sets × 10 reps',
    equipment: 'Barbell',
    calories: 130,
  },
  {
    id: 11,
    name: 'Lateral Raises',
    category: 'Shoulders',
    difficulty: 'Beginner',
    duration: '3 sets × 15 reps',
    equipment: 'Dumbbells',
    calories: 65,
  },
  {
    id: 12,
    name: 'Bench Press',
    category: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets × 8-10 reps',
    equipment: 'Barbell',
    calories: 115,
  },
];

export function ExerciseLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredExercises = allExercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-slate-900 mb-2">Exercise Library</h2>
        <p className="text-slate-600">
          Browse our complete collection of exercises with video tutorials and form guides
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <div className="flex gap-2">
              <Button
                variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={selectedDifficulty === 'Beginner' ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty('Beginner')}
                size="sm"
              >
                Beginner
              </Button>
              <Button
                variant={selectedDifficulty === 'Intermediate' ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty('Intermediate')}
                size="sm"
              >
                Intermediate
              </Button>
              <Button
                variant={selectedDifficulty === 'Advanced' ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty('Advanced')}
                size="sm"
              >
                Advanced
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Exercise Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Exercise Image Placeholder */}
              <div className="bg-gradient-to-br from-slate-200 to-slate-300 aspect-video flex items-center justify-center">
                <Play className="w-12 h-12 text-slate-400" />
              </div>

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">{exercise.name}</h3>
                    <p className="text-slate-600 text-sm">{exercise.category}</p>
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

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{exercise.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>~{exercise.calories} calories per session</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Equipment:</span> {exercise.equipment}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                    <Play className="w-4 h-4 mr-2" />
                    Watch
                  </Button>
                  <Button variant="outline" size="icon">
                    <span className="text-xl">+</span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredExercises.length === 0 && (
        <Card className="p-12 text-center">
          <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-slate-900 mb-2">No exercises found</h3>
          <p className="text-slate-600 text-sm">
            Try adjusting your search or filter criteria
          </p>
        </Card>
      )}
    </div>
  );
}