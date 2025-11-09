import { useEffect, useRef, useState } from 'react';
import type { SelectedExercise } from '../App';
import * as mpPose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
// Import the exercise detectors from the separate file
import { exerciseDetectors } from './exerciseDetectors';

interface VideoRecorderProps {
  exercise: SelectedExercise;
}

export default function VideoRecorder({ exercise }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [reps, setReps] = useState<number>(0);
  const exerciseStateRef = useRef<any>({ up: false, down: false });
  const lastFeedbackRef = useRef<string>('');
  const feedbackCooldownRef = useRef<number>(0);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    // Reset state when exercise changes
    setReps(0);
    setFeedback([]);
    exerciseStateRef.current = { up: false, down: false };
    lastFeedbackRef.current = '';
    feedbackCooldownRef.current = 0;

    const pose = new mpPose.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (!canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Always clear and draw video frame
      ctx.save();
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw pose landmarks and connections if available
      if (results.poseLandmarks) {
        // Draw connections (skeleton lines)
        drawConnectors(ctx, results.poseLandmarks, mpPose.POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 4
        });
        
        // Draw landmarks (joint points)
        drawLandmarks(ctx, results.poseLandmarks, {
          color: '#FF0000',
          fillColor: '#FF0000',
          lineWidth: 2,
          radius: 6
        });

        // Run exercise-specific detection
        const detector = exerciseDetectors[exercise.id];
        if (detector) {
          const { repDetected, feedback: newFeedback, newState } = detector({
            landmarks: results.poseLandmarks,
            prevState: exerciseStateRef.current
          });

          exerciseStateRef.current = newState;

          if (repDetected) {
            setReps((prev) => prev + 1);
          }

          // Debounce feedback to prevent flooding
          const currentTime = Date.now();
          if (newFeedback.length > 0) {
            // Filter out duplicate consecutive feedback
            const uniqueFeedback = newFeedback.filter(fb => {
              // Allow rep completion messages immediately
              if (fb.includes('!') || fb.includes('💪') || fb.includes('🔥') || fb.includes('👍')) {
                return true;
              }
              // For form corrections, check cooldown and duplicates
              if (fb !== lastFeedbackRef.current && currentTime - feedbackCooldownRef.current > 2000) {
                lastFeedbackRef.current = fb;
                feedbackCooldownRef.current = currentTime;
                return true;
              }
              return false;
            });

            if (uniqueFeedback.length > 0) {
              setFeedback((prev) => {
                const combined = [...prev, ...uniqueFeedback];
                // Keep only last 15 feedback messages
                return combined.slice(-15);
              });
            }
          }
        }
      }

      ctx.restore();
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await pose.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480
    });
    
    camera.start();

    return () => {
      camera.stop();
      pose.close();
    };
  }, [exercise]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Exercise Form Tracker
        </h1>
        
        <div className="flex gap-6 h-[calc(100vh-180px)]">
          {/* Left Column - Video Feed (Takes ~70% width) */}
          <div className="flex-[7] flex-shrink-0 relative bg-black rounded-2xl overflow-hidden shadow-2xl h-full">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="hidden"
            />
            <canvas 
              ref={canvasRef}
              width={640}
              height={480}
              className="w-full h-full object-contain"
            />
            
            {/* Rep Counter Overlay */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-lg">
              <div className="text-sm font-medium text-gray-300">Reps</div>
              <div className="text-4xl font-bold">{reps}</div>
            </div>

            {/* Exercise Name Overlay */}
            <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg">
              <div className="text-lg font-semibold">{exercise.name}</div>
            </div>

            {/* Live Feedback Overlay - Bottom of Video */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="space-y-2">
                {feedback.slice(-3).reverse().map((tip, i) => (
                  <div 
                    key={i} 
                    className="bg-black/80 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-lg border-l-4 border-indigo-500 animate-fadeIn"
                  >
                    <p className="text-sm font-medium">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Feedback Panel (Takes ~30% width, Fixed Height) */}
          <div className="flex-[3] flex flex-col gap-6 h-full overflow-hidden">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 flex-shrink-0">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-lg text-center">
                <div className="text-4xl font-bold text-green-600">{reps}</div>
                <div className="text-sm text-green-700 font-medium mt-1">Total Reps</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl shadow-lg text-center">
                <div className="text-4xl font-bold text-purple-600">{feedback.length}</div>
                <div className="text-sm text-purple-700 font-medium mt-1">Feedback</div>
              </div>
            </div>

            {/* Exercise Tips */}
            <div className="bg-white rounded-2xl shadow-xl p-6 flex-shrink-0">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-indigo-600">💡</span>
                Form Tips
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {exercise.id === 'bicep_curl' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Keep your elbows close to your body</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Control the movement on the way down</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Don't swing your body</span>
                    </li>
                  </>
                )}
                {exercise.id === 'squat' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Keep your chest up and back straight</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Knees should track over your toes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Go as low as comfortable</span>
                    </li>
                  </>
                )}
                {exercise.id === 'pushup' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Keep your body in a straight line</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Lower until chest nearly touches ground</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Don't let your hips sag</span>
                    </li>
                  </>
                )}
                {exercise.id === 'planks' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Keep your core engaged</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Maintain neutral spine position</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Don't hold your breath</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Full Feedback History - Takes remaining space, scrolls independently */}
            <div className="bg-white rounded-2xl shadow-xl p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 flex-shrink-0">
                <span className="text-indigo-600">📋</span>
                Recent Feedback
              </h4>
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-0">
                {feedback.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">Start exercising to see feedback...</p>
                ) : (
                  feedback.slice().reverse().map((tip, i) => (
                    <div 
                      key={i} 
                      className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border-l-4 border-indigo-500 text-sm"
                    >
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}