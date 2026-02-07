import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * AudioVisualizer Component
 * 
 * Displays real-time audio waveform visualization for video call
 * Uses Web Audio API AnalyserNode to visualize audio activity
 * 
 * @component
 * @param {Object} props
 * @param {AnalyserNode} props.analyserNode - Web Audio API AnalyserNode for audio analysis
 * @param {boolean} props.isActive - Whether visualization should be active
 */
const AudioVisualizer = ({ analyserNode = null, isActive }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode || !isActive) {
      return;
    }

    const ctx = canvas.getContext('2d');
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Set canvas size to match display size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();

    // Render loop for waveform visualization
    const draw = () => {
      if (!isActive) {
        return;
      }

      animationFrameRef.current = requestAnimationFrame(draw);

      // Get audio data
      analyserNode.getByteTimeDomainData(dataArray);

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1CBECF'; // Cyan color
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    // Start visualization
    draw();

    // Handle window resize
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [analyserNode, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-70"
      style={{
        mixBlendMode: 'screen',
        zIndex: 10
      }}
      aria-hidden="true"
    />
  );
};

AudioVisualizer.propTypes = {
  analyserNode: PropTypes.object,
  isActive: PropTypes.bool.isRequired
};

export default AudioVisualizer;
