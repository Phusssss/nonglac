/**
 * Audio Helper Utilities for Video Call Feature
 * 
 * This module provides utilities for processing audio data in the video call feature,
 * including PCM encoding/decoding and audio buffer management.
 */

/**
 * Convert Float32Array audio data to PCM blob format
 * 
 * @param {Float32Array} float32Data - Audio data in Float32 format
 * @returns {{ data: string, mimeType: string }} - Base64 encoded PCM data and mime type
 */
export const createPcmBlob = (float32Data) => {
  // Convert Float32Array to Int16Array
  const int16Array = new Int16Array(float32Data.length);
  
  for (let i = 0; i < float32Data.length; i++) {
    // Clamp the float32 value to [-1, 1] range and convert to int16 range [-32768, 32767]
    const clampedValue = Math.max(-1, Math.min(1, float32Data[i]));
    int16Array[i] = clampedValue < 0 
      ? clampedValue * 0x8000  // -32768
      : clampedValue * 0x7FFF; // 32767
  }
  
  // Convert Int16Array to Uint8Array (raw bytes)
  const uint8Array = new Uint8Array(int16Array.buffer);
  
  // Encode to base64
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  const base64Data = btoa(binaryString);
  
  // Return object with data and mimeType
  return {
    data: base64Data,
    mimeType: 'audio/pcm;rate=16000'
  };
};

/**
 * Decode base64 string to Uint8Array
 * 
 * @param {string} base64String - Base64 encoded string
 * @returns {Uint8Array} - Decoded binary data
 */
export const decode = (base64String) => {
  // Decode base64 to binary string
  const binaryString = atob(base64String);
  
  // Convert binary string to Uint8Array
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  
  return uint8Array;
};

/**
 * Decode audio data and create AudioBuffer
 * 
 * @param {Uint8Array} uint8Data - Raw audio data (PCM Int16)
 * @param {AudioContext} audioContext - Web Audio API context
 * @returns {Promise<AudioBuffer>} - Decoded audio buffer
 */
export const decodeAudioData = async (uint8Data, audioContext) => {
  // Convert Uint8Array to Int16Array
  // Each Int16 value is 2 bytes, so divide length by 2
  const int16Array = new Int16Array(uint8Data.buffer, uint8Data.byteOffset, uint8Data.length / 2);
  
  // Get the sample rate from the audio context
  const sampleRate = audioContext.sampleRate;
  
  // Create AudioBuffer with correct sample rate
  // 1 channel (mono), length in samples, sample rate
  const audioBuffer = audioContext.createBuffer(
    1, // numberOfChannels (mono)
    int16Array.length, // length in samples
    sampleRate // sample rate
  );
  
  // Get the channel data (Float32Array)
  const channelData = audioBuffer.getChannelData(0);
  
  // Normalize audio data to Float32Array
  // Convert Int16 range [-32768, 32767] to Float32 range [-1, 1]
  for (let i = 0; i < int16Array.length; i++) {
    channelData[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7FFF);
  }
  
  return audioBuffer;
};
