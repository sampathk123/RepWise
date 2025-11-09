import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, TrendingUp, Award, Target, Flame } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';

const workoutData = [
  { date: 'Mon', workouts: 2, duration: 45 },
  { date: 'Tue', workouts: 1, duration: 30 },
  { date: 'Wed', workouts: 3, duration: 60 },
  { date: 'Thu', workouts: 0, duration: 0 },
  { date: 'Fri', workouts: 2, duration: 50 },
  { date: 'Sat', workouts: 1, duration: 35 },
  { date: 'Sun', workouts: 2, duration: 55 },
];

const formScoreData = [
  { week: 'Week 1', score: 72 },
  { week: 'Week 2', score: 75 },
  { week: 'Week 3', score: 78 },
  { week: 'Week 4', score: 85 },
];

const recentWorkouts = [
  {
    id: 1,
    date: 'Today, 9:30 AM',
    exercises: ['Push-Ups', 'Bench Press', 'Dumbbell Flyes'],
    duration: 45,
    formScore: 85,
    muscleGroup: 'Chest',
  },
  {
    id: 2,
    date: 'Yesterday, 6:00 PM',
    exercises: ['Squats', 'Lunges', 'Leg Extensions'],
    duration: 50,
    formScore: 82,
    muscleGroup: 'Quads',
  },
  {
    id: 3,
    date: '2 days ago, 10:00 AM',
    exercises: ['Pull-Ups', 'Lat Pulldowns', 'Bent-Over Rows'],
    duration: 40,
    formScore: 88,
    muscleGroup: 'Lats',
  },
];

const achievements = [
  { id: 1, title: '7-Day Streak', icon: '🔥', unlocked: true },
  { id: 2, title: 'Form Master', icon: '🎯', unlocked: true },
  { id: 3, title: '50 Workouts', icon: '💪', unlocked: false },
  { id: 4, title: 'All Muscle Groups', icon: '⭐', unlocked: false },
];

export function ProgressTracker() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-slate-900 mb-2">Your Progress</h2>
        <p className="text-slate-600">
          Track your fitness journey and celebrate your achievements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <Badge className="bg-green-100 text-green-800">+2 this week</Badge>
            </div>
            <div className="text-3xl mb-1">24</div>
            <p className="text-slate-600 text-sm">Total Workouts</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <Badge className="bg-green-100 text-green-800">+13%</Badge>
            </div>
            <div className="text-3xl mb-1">85%</div>
            <p className="text-slate-600 text-sm">Avg Form Score</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Flame className="w-6 h-6 text-amber-600" />
              </div>
              <Badge className="bg-amber-100 text-amber-800">On fire!</Badge>
            </div>
            <div className="text-3xl mb-1">7</div>
            <p className="text-slate-600 text-sm">Day Streak</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <Badge className="bg-purple-100 text-purple-800">75%</Badge>
            </div>
            <div className="text-3xl mb-1">9/12</div>
            <p className="text-slate-600 text-sm">Muscle Groups Hit</p>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-slate-900 mb-6">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={workoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="workouts" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-slate-900 mb-6">Form Score Improvement</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={formScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[60, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ fill: '#14b8a6', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Workouts and Achievements */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-6">Recent Workouts</h3>
          <div className="space-y-4">
            {recentWorkouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-slate-900 mb-1">{workout.muscleGroup} Day</h4>
                      <p className="text-slate-600 text-sm">{workout.date}</p>
                    </div>
                    <Badge
                      className={
                        workout.formScore >= 85
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {workout.formScore}% form
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 mb-2">
                    {workout.exercises.join(' • ')}
                  </div>
                  <div className="text-sm text-slate-500">{workout.duration} minutes</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-6">Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`p-4 text-center transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200'
                      : 'bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="text-4xl mb-2 grayscale-0">
                    {achievement.icon}
                  </div>
                  <h4 className="text-slate-900 text-sm mb-1">{achievement.title}</h4>
                  {achievement.unlocked ? (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">Unlocked</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Locked</Badge>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Progress towards next achievement */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="text-slate-900 text-sm">Next: 50 Workouts</h4>
                <p className="text-slate-600 text-xs">26 more to go!</p>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-teal-600 h-2 rounded-full transition-all"
                style={{ width: '48%' }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
