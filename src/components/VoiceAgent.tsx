// import { useState, useEffect, useRef } from 'react';
// import { Mic, MicOff, Volume2, MessageCircle } from 'lucide-react';
// import { DeepgramAgent } from '../services/deepgramAgent';

// interface VoiceAgentProps {
//   exerciseName: string;
//   currentReps: number;
//   onFeedbackSpoken?: () => void;
// }

// export default function VoiceAgent({ exerciseName, currentReps }: VoiceAgentProps) {
//   const [isActive, setIsActive] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [agentResponse, setAgentResponse] = useState('');
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [conversation, setConversation] = useState<Array<{role: 'user' | 'agent', text: string}>>([]);
  
//   const agentRef = useRef<DeepgramAgent | null>(null);

//   const systemPrompt = `You are an enthusiastic and knowledgeable fitness coach assistant helping someone during their ${exerciseName} workout. 

// Current workout status:
// - Exercise: ${exerciseName}
// - Current reps completed: ${currentReps}

// Your role:
// 1. Answer questions about exercise form, technique, breathing, rest times, and rep counts
// 2. Provide motivation and encouragement
// 3. Keep responses concise (1-3 sentences)
// 4. Be supportive and energetic
// 5. If asked about rep count, reference the current count

// Examples of questions you might receive:
// - "How many reps should I do?"
// - "Is my form correct?"
// - "How long should I rest?"
// - "Should I breathe in or out?"
// - "How many have I done so far?"

// Always be positive, concise, and helpful!`;

//   const handleTranscript = (text: string, isFinal: boolean) => {
//     setTranscript(text);
    
//     if (isFinal) {
//       setConversation(prev => [...prev, { role: 'user', text }]);
//       setTranscript(''); // Clear interim transcript
//     }
//   };

//   const handleAgentSpeaking = (speaking: boolean) => {
//     setIsSpeaking(speaking);
//     if (!speaking) {
//       // Agent finished speaking, show response in conversation
//       setAgentResponse('');
//     }
//   };

//   const toggleAgent = async () => {
//     if (isActive) {
//       // Stop agent
//       if (agentRef.current) {
//         agentRef.current.stop();
//         agentRef.current = null;
//       }
//       setIsActive(false);
//       setTranscript('');
//     } else {
//       // Start agent
//       try {
//         const agent = new DeepgramAgent(handleTranscript, handleAgentSpeaking);
//         await agent.start(systemPrompt);
//         agentRef.current = agent;
//         setIsActive(true);
        
//         // Welcome message
//         await agent.speak(`Hey! I'm your workout assistant. I'm here to help you with your ${exerciseName}. Feel free to ask me anything!`);
//       } catch (error) {
//         console.error('Failed to start voice agent:', error);
//         alert('Microphone access denied or unavailable');
//       }
//     }
//   };

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (agentRef.current) {
//         agentRef.current.stop();
//       }
//     };
//   }, []);

//   // Update system prompt when reps change
//   useEffect(() => {
//     // System prompt is updated on each interaction through the ref
//   }, [currentReps]);

//   return (
//     <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 flex flex-col h-full">
//       <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 flex-shrink-0">
//         <Volume2 className="text-purple-600" size={24} />
//         AI Voice Coach
//       </h4>
      
//       <div className="flex-1 flex flex-col gap-4 min-h-0">
//         {/* Control Button */}
//         <button
//           onClick={toggleAgent}
//           className={`py-4 px-6 rounded-xl font-semibold text-white transition-all transform hover:scale-105 flex items-center justify-center gap-3 flex-shrink-0 ${
//             isActive
//               ? 'bg-red-500 hover:bg-red-600'
//               : 'bg-purple-600 hover:bg-purple-700'
//           }`}
//         >
//           {isActive ? (
//             <>
//               <MicOff size={24} />
//               Stop Coach
//             </>
//           ) : (
//             <>
//               <Mic size={24} />
//               Start Voice Coach
//             </>
//           )}
//         </button>

//         {/* Status Indicators */}
//         {isActive && (
//           <div className="flex gap-2 flex-shrink-0">
//             <div className={`flex-1 px-3 py-2 rounded-lg text-center text-sm font-medium ${
//               transcript ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
//             }`}>
//               {transcript ? '🎤 Listening...' : '🎤 Ready'}
//             </div>
//             <div className={`flex-1 px-3 py-2 rounded-lg text-center text-sm font-medium ${
//               isSpeaking ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-gray-100 text-gray-500'
//             }`}>
//               {isSpeaking ? '🔊 Speaking...' : '🔊 Idle'}
//             </div>
//           </div>
//         )}

//         {/* Interim Transcript */}
//         {transcript && (
//           <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 flex-shrink-0 animate-pulse">
//             <p className="text-sm text-blue-700 italic">{transcript}</p>
//           </div>
//         )}

//         {/* Conversation History */}
//         <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0">
//           {conversation.length === 0 && !isActive && (
//             <div className="text-center py-8">
//               <MessageCircle className="mx-auto mb-3 text-gray-400" size={48} />
//               <p className="text-gray-500 text-sm">
//                 Start the voice coach to ask questions during your workout
//               </p>
//             </div>
//           )}
          
//           {conversation.map((msg, i) => (
//             <div
//               key={i}
//               className={`p-3 rounded-lg ${
//                 msg.role === 'user'
//                   ? 'bg-blue-100 border-l-4 border-blue-500 ml-4'
//                   : 'bg-purple-100 border-l-4 border-purple-500 mr-4'
//               }`}
//             >
//               <p className="text-xs font-semibold mb-1 text-gray-600">
//                 {msg.role === 'user' ? 'You' : 'Coach'}
//               </p>
//               <p className="text-sm text-gray-800">{msg.text}</p>
//             </div>
//           ))}
//         </div>

//         {/* Quick Tips */}
//         {!isActive && (
//           <div className="text-xs text-gray-600 space-y-1 flex-shrink-0 bg-white p-3 rounded-lg">
//             <p className="font-semibold text-gray-800 mb-2">💡 Try asking:</p>
//             <ul className="list-disc list-inside space-y-1 ml-2">
//               <li>"How many reps should I do?"</li>
//               <li>"What's the proper form for {exerciseName}?"</li>
//               <li>"How long should I rest?"</li>
//               <li>"How should I breathe?"</li>
//               <li>"How many reps have I done?"</li>
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // Export function to speak feedback from outside
// export function useFeedbackAnnouncer() {
//   const agentRef = useRef<DeepgramAgent | null>(null);

//   const announceFeedback = async (text: string) => {
//     if (agentRef.current) {
//       await agentRef.current.speakFeedback(text);
//     }
//   };

//   return { announceFeedback, agentRef };
// }