/**
 * Video Call Feature Type Definitions
 * 
 * This file contains all TypeScript type definitions for the AI Video Call feature.
 */

/**
 * Call status representing the current state of the video call session
 */
export type CallStatus = 
  | 'connecting'    // Initial connection to AI service
  | 'listening'     // AI is listening to user input
  | 'thinking'      // AI is processing user request
  | 'speaking'      // AI is responding with voice
  | 'error'         // Error state
  | 'announcement'; // AI is making an announcement

/**
 * Camera facing mode for video stream
 */
export type FacingMode = 'user' | 'environment';

/**
 * Complete state object for video call session
 */
export interface VideoCallState {
  status: CallStatus;
  errorMessage: string;
  isCameraOn: boolean;
  facingMode: FacingMode;
  isMicOn: boolean;
  isSimulationMode: boolean;
  mascotMessage: string | null;
  activeTool: string | null;
  flash: boolean;
}

/**
 * Media stream configuration for getUserMedia
 */
export interface MediaStreamConfig {
  video: MediaTrackConstraints;
  audio: MediaTrackConstraints;
}

/**
 * Audio processing configuration
 */
export interface AudioConfig {
  inputSampleRate: number;   // Sample rate for microphone input (typically 16kHz)
  outputSampleRate: number;  // Sample rate for AI voice output (typically 24kHz)
  fftSize: number;           // FFT size for audio visualization (typically 256)
}

/**
 * Tool call response structure for Gemini Live API
 */
export interface ToolCallResponse {
  id: string;                // Unique identifier for the tool call
  name: string;              // Name of the tool being called
  response: {
    result: any;             // Result data from the tool execution
  };
}
