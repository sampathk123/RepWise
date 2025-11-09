import { useState } from "react";
import { MuscleMap } from "./components/MuscleMap";
import VideoRecorder from "./components/VideoRecorder";
import { ArrowLeft, Dumbbell, BarChart3 } from "lucide-react";
import { ProgressTracker } from "./components/ProgressTracker";

type Page = "muscle-map" | "form-check" | "progress-tracker";

export interface SelectedExercise {
  name: string;
  id: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("muscle-map");
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] =
    useState<SelectedExercise | null>(null);

  const handleSelectMuscle = (muscle: string) => setSelectedMuscle(muscle);

  const handleStartFormCheck = (exerciseName: string, exerciseId: string) => {
    setSelectedExercise({ name: exerciseName, id: exerciseId });
    setCurrentPage("form-check");
  };

  const handleBackToMuscleMap = () => {
    setCurrentPage("muscle-map");
    setSelectedExercise(null);
  };

  const handleGoToProgress = () => {
    setCurrentPage("progress-tracker");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  AI Fitness Coach
                </h1>
                <p className="text-xs text-slate-600">
                  {currentPage === "muscle-map" && "Muscle Map & Library"}
                  {currentPage === "form-check" && "Form Check"}
                  {currentPage === "progress-tracker" && "Progress Tracker"}
                </p>
              </div>
            </div>

            {/* Header Buttons */}
            <div className="flex items-center gap-4">
              {currentPage === "form-check" && (
                <button
                  onClick={handleBackToMuscleMap}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Exercises
                </button>
              )}

              {currentPage !== "progress-tracker" && (
                <button
                  onClick={handleGoToProgress}
                  className="flex items-center gap-2 px-4 py-2 border border-indigo-500 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold hover:opacity-80 transition"
                >
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Progress Tracker</span>
                </button>
              )}

              {currentPage === "progress-tracker" && (
                <button
                  onClick={() => setCurrentPage("muscle-map")}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Main
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === "muscle-map" && (
          <MuscleMap
            selectedMuscle={selectedMuscle}
            onSelectMuscle={handleSelectMuscle}
            onStartFormCheck={handleStartFormCheck}
          />
        )}

        {currentPage === "form-check" && selectedExercise && (
          <VideoRecorder exercise={selectedExercise} />
        )}

        {currentPage === "progress-tracker" && <ProgressTracker />}
      </main>
    </div>
  );
}
