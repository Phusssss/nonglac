/**
 * useAudioProcessor Hook
 * 
 * Custom hook for processing audio input/output in video calls.
 * Manages AudioContext instances, AnalyserNodes, and audio processing pipeline.
 */

import { useRef, useCallback, useEffect } from 'react';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audioHelpers';

/**
 * Audio processor hook for managing audio input/output
 * 
 * @param {number} inputSampleRate - Sample rate for input audio (default: 16000)
 * @param {number} outputSampleRate - Sample rate for output audio (default: 24000)
 * @returns {Object} Audio processor API
 */
const useAudioProcessor = (inputSampleRate = 16000, outputSampleRate = 24000) => {
  // Audio context refs
  const inputContextRef = useRef(null);
  const outputContextRef = useRef(null);
  
  // Analyser node refs
  const inputAnalyserRef = useRef(null);
  const outputAnalyserRef = useRef(null);
  
  // Audio processing refs
  const scriptProcessorRef = useRef(null);
  const mediaStreamSourceRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  
  /**
   * Initialize audio contexts and analysers
   */
  useEffect(() => {
    // Create input context (16kHz sample rate)
    if (!inputContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        inputContextRef.current = new AudioContextClass({
          sampleRate: inputSampleRate
        });
        
        // Auto-resume on creation if possible
        if (inputContextRef.current.state === 'suspended') {
          inputContextRef.current.resume().catch(console.warn);
        }
      } catch (error) {
        console.error('Failed to create input audio context:', error);
      }
    }
    
    // Create output context (24kHz sample rate)
    if (!outputContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        outputContextRef.current = new AudioContextClass({
          sampleRate: outputSampleRate
        });
        
        // Auto-resume on creation if possible
        if (outputContextRef.current.state === 'suspended') {
          outputContextRef.current.resume().catch(console.warn);
        }
      } catch (error) {
        console.error('Failed to create output audio context:', error);
      }
    }
    
    // Create input analyser with FFT size 256
    if (!inputAnalyserRef.current && inputContextRef.current && inputContextRef.current.state !== 'closed') {
      try {
        inputAnalyserRef.current = inputContextRef.current.createAnalyser();
        inputAnalyserRef.current.fftSize = 256;
      } catch (error) {
        console.error('Failed to create input analyser:', error);
      }
    }
    
    // Create output analyser with FFT size 256
    if (!outputAnalyserRef.current && outputContextRef.current && outputContextRef.current.state !== 'closed') {
      try {
        outputAnalyserRef.current = outputContextRef.current.createAnalyser();
        outputAnalyserRef.current.fftSize = 256;
      } catch (error) {
        console.error('Failed to create output analyser:', error);
      }
    }
    
    // Cleanup on unmount
    return () => {
      // Only cleanup if contexts exist and are not already closed
      if (inputContextRef.current?.state !== 'closed' || outputContextRef.current?.state !== 'closed') {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  
  /**
   * Process input audio stream
   * 
   * @param {MediaStream} stream - Audio input stream
   * @param {Function} onAudioData - Callback for processed audio data
   * @returns {Function} Cleanup function
   */
  const processInput = useCallback((stream, onAudioData) => {
    if (!inputContextRef.current || !inputAnalyserRef.current) {
      console.warn('Audio context not ready yet, skipping audio processing');
      return () => {};
    }
    
    // Check if context is closed (can happen in React Strict Mode)
    if (inputContextRef.current.state === 'closed') {
      console.warn('Audio context is closed, skipping audio processing');
      return () => {};
    }
    
    try {
      // Create MediaStreamSource
      const source = inputContextRef.current.createMediaStreamSource(stream);
      mediaStreamSourceRef.current = source;
      
      // Connect to analyser
      source.connect(inputAnalyserRef.current);
      
      // Create ScriptProcessor (2048 buffer size for lower latency)
      const bufferSize = 2048;
      const scriptProcessor = inputContextRef.current.createScriptProcessor(
        bufferSize,
        1, // input channels
        1  // output channels
      );
      scriptProcessorRef.current = scriptProcessor;
      
      // Process audio chunks
      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const inputData = inputBuffer.getChannelData(0); // Get mono channel
        
        // Create PCM blob from Float32Array
        const pcmData = createPcmBlob(inputData);
        
        // Call callback with processed audio data
        if (onAudioData && typeof onAudioData === 'function') {
          onAudioData(pcmData);
        }
      };
      
      // Connect nodes: source -> analyser -> scriptProcessor -> destination
      inputAnalyserRef.current.connect(scriptProcessor);
      scriptProcessor.connect(inputContextRef.current.destination);
      
      // Return cleanup function
      return () => {
        if (scriptProcessorRef.current) {
          try {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current.onaudioprocess = null;
          } catch (e) {
            console.warn('Error disconnecting script processor:', e);
          }
          scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
          try {
            mediaStreamSourceRef.current.disconnect();
          } catch (e) {
            console.warn('Error disconnecting media stream source:', e);
          }
          mediaStreamSourceRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error processing input audio:', error);
      return () => {};
    }
  }, []);
  
  /**
   * Play output audio
   * 
   * @param {string} base64Audio - Base64 encoded audio data
   * @returns {Promise<void>}
   */
  const playOutput = useCallback(async (base64Audio) => {
    if (!outputContextRef.current || !outputAnalyserRef.current) {
      console.error('Output audio context not initialized');
      return;
    }
    
    try {
      // Decode base64 audio
      const uint8Data = decode(base64Audio);
      
      // Create AudioBuffer
      const audioBuffer = await decodeAudioData(uint8Data, outputContextRef.current);
      
      // Create BufferSource
      const source = outputContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      
      // Connect to analyser and destination
      source.connect(outputAnalyserRef.current);
      outputAnalyserRef.current.connect(outputContextRef.current.destination);
      
      // Schedule playback with timing queue
      const currentTime = outputContextRef.current.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      
      source.start(startTime);
      
      // Update next start time for seamless playback
      nextStartTimeRef.current = startTime + audioBuffer.duration;
      
      // Handle playback completion
      source.onended = () => {
        source.disconnect();
        // Reset next start time if we've caught up
        if (outputContextRef.current && 
            nextStartTimeRef.current <= outputContextRef.current.currentTime) {
          nextStartTimeRef.current = 0;
        }
      };
    } catch (error) {
      console.error('Error playing output audio:', error);
      // Reset timing on error
      nextStartTimeRef.current = 0;
    }
  }, []);
  
  /**
   * Cleanup audio contexts and nodes
   */
  const cleanup = useCallback(() => {
    // Disconnect script processor
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }
    
    // Disconnect media stream source
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    
    // Close input context
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
      inputContextRef.current.close().catch(err => {
        console.error('Error closing input context:', err);
      });
      inputContextRef.current = null;
    }
    
    // Close output context
    if (outputContextRef.current && outputContextRef.current.state !== 'closed') {
      outputContextRef.current.close().catch(err => {
        console.error('Error closing output context:', err);
      });
      outputContextRef.current = null;
    }
    
    // Clear analyser refs
    inputAnalyserRef.current = null;
    outputAnalyserRef.current = null;
    
    // Reset timing
    nextStartTimeRef.current = 0;
  }, []);
  
  return {
    inputContext: inputContextRef.current,
    outputContext: outputContextRef.current,
    inputAnalyser: inputAnalyserRef.current,
    outputAnalyser: outputAnalyserRef.current,
    processInput,
    playOutput,
    cleanup
  };
};

export default useAudioProcessor;
