// import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

// // const deepgram = createClient(import.meta.env.VITE_DEEPGRAM_API_KEY);

// export class DeepgramAgent {
//   private connection: any = null;
//   private mediaRecorder: MediaRecorder | null = null;
//   private mediaStream: MediaStream | null = null;
//   private audioContext: AudioContext | null = null;
//   private audioQueue: AudioBuffer[] = [];
//   private isPlaying: boolean = false;

//   constructor(
//     private onTranscript: (text: string, isFinal: boolean) => void,
//     private onAgentSpeaking: (speaking: boolean) => void
//   ) {}

//   async start(systemPrompt: string) {
//     try {
//       // Get microphone access
//       this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         } 
//       });

//       // Initialize audio context for playback
//       this.audioContext = new AudioContext();

//       // Create Deepgram connection with STT
//       this.connection = deepgram.listen.live({
//         model: 'nova-2',
//         language: 'en-US',
//         smart_format: true,
//         interim_results: true,
//         punctuate: true,
//         endpointing: 300,
//       });

//       // Set up event listeners
//       this.connection.on(LiveTranscriptionEvents.Open, () => {
//         console.log('Deepgram connection opened');
//         this.startRecording();
//       });

//       this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
//         const transcript = data.channel.alternatives[0].transcript;
//         const isFinal = data.is_final;
        
//         if (transcript && transcript.trim().length > 0) {
//           this.onTranscript(transcript, isFinal);
          
//           // If final transcript, send to agent for response
//           if (isFinal) {
//             this.getAgentResponse(transcript, systemPrompt);
//           }
//         }
//       });

//       this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
//         console.error('Deepgram error:', error);
//       });

//       this.connection.on(LiveTranscriptionEvents.Close, () => {
//         console.log('Deepgram connection closed');
//       });

//     } catch (error) {
//       console.error('Error starting Deepgram agent:', error);
//       throw error;
//     }
//   }

//   private startRecording() {
//     if (!this.mediaStream) return;

//     this.mediaRecorder = new MediaRecorder(this.mediaStream, {
//       mimeType: 'audio/webm',
//     });

//     this.mediaRecorder.addEventListener('dataavailable', (event) => {
//       if (event.data.size > 0 && this.connection) {
//         this.connection.send(event.data);
//       }
//     });

//     this.mediaRecorder.start(250); // Send audio chunks every 250ms
//   }

//   private async getAgentResponse(userMessage: string, systemPrompt: string) {
//     try {
//       // Use Anthropic Claude API for intelligent responses
//       const response = await fetch('https://api.anthropic.com/v1/messages', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'anthropic-version': '2023-06-01',
//         },
//         body: JSON.stringify({
//           model: 'claude-sonnet-4-20250514',
//           max_tokens: 200,
//           system: systemPrompt,
//           messages: [{
//             role: 'user',
//             content: userMessage
//           }]
//         })
//       });

//       const data = await response.json();
//       const agentResponse = data.content[0].text;

//       // Convert response to speech using Deepgram TTS
//       await this.speak(agentResponse);

//     } catch (error) {
//       console.error('Error getting agent response:', error);
//       await this.speak('Sorry, I encountered an error. Please try again.');
//     }
//   }

//   async speak(text: string) {
//     try {
//       this.onAgentSpeaking(true);

//       const response = await deepgram.speak.request(
//         { text },
//         {
//           model: 'aura-asteria-en', // Natural female voice
//           encoding: 'linear16',
//           container: 'wav',
//         }
//       );

//       const stream = await response.getStream();
//       const audioData = await this.getAudioBuffer(stream);
      
//       if (!this.audioContext) return;

//       const audioBuffer = await this.audioContext.decodeAudioData(audioData);
//       await this.playAudio(audioBuffer);

//       this.onAgentSpeaking(false);
//     } catch (error) {
//       console.error('Error speaking:', error);
//       this.onAgentSpeaking(false);
//     }
//   }

//   private async getAudioBuffer(stream: ReadableStream): Promise<ArrayBuffer> {
//     const reader = stream.getReader();
//     const chunks: Uint8Array[] = [];

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;
//       chunks.push(value);
//     }

//     const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
//     const result = new Uint8Array(totalLength);
//     let offset = 0;
    
//     for (const chunk of chunks) {
//       result.set(chunk, offset);
//       offset += chunk.length;
//     }

//     return result.buffer;
//   }

//   private async playAudio(audioBuffer: AudioBuffer): Promise<void> {
//     if (!this.audioContext) return;

//     return new Promise((resolve) => {
//       const source = this.audioContext!.createBufferSource();
//       source.buffer = audioBuffer;
//       source.connect(this.audioContext!.destination);
      
//       source.onended = () => {
//         this.isPlaying = false;
//         resolve();
//       };

//       this.isPlaying = true;
//       source.start(0);
//     });
//   }

//   async speakFeedback(text: string) {
//     // Announce workout feedback without waiting for response
//     await this.speak(text);
//   }

//   stop() {
//     if (this.mediaRecorder) {
//       this.mediaRecorder.stop();
//       this.mediaRecorder = null;
//     }

//     if (this.mediaStream) {
//       this.mediaStream.getTracks().forEach(track => track.stop());
//       this.mediaStream = null;
//     }

//     if (this.connection) {
//       this.connection.finish();
//       this.connection = null;
//     }

//     if (this.audioContext) {
//       this.audioContext.close();
//       this.audioContext = null;
//     }
//   }
// }