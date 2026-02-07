import React from 'react';

/**
 * LacLacMascot - The interactive mascot for NongLac AI
 * Based on official brand guidelines 3.0
 */
const LacLacMascot = ({ status = 'idle', size = 'large', onClick }) => {
  const pixelSize = size === 'large' ? 200 : size === 'medium' ? 100 : 40;
  
  // Colors (Brand 3.0)
  const PRIMARY = '#3A9947';
  const SECONDARY = '#1CBECF';
  const ACCENT = '#EDB324';
  const WHITE = '#FFFFFF';
  const DARK_SCREEN = '#1A1C1E';

  // Animation logic
  const bodyAnim = status === 'speaking' ? 'animate-bounce' : status === 'announcement' ? 'animate-pulse' : 'animate-float';
  const eyeAnim = status === 'thinking' ? 'animate-spin' : 'animate-blink';
  const shimmerClass = status === 'announcement' ? 'animate-shimmer' : '';
  const antennaAnim = 'animate-antenna-wave';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${bodyAnim} cursor-pointer transition-transform active:scale-95`}
      style={{ width: pixelSize, height: pixelSize }}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl filter"
      >
        {/* SHADOW */}
        <ellipse cx="100" cy="180" rx="60" ry="10" fill="black" fillOpacity="0.15" />

        {/* --- BODY (White Ceramic Robot) --- */}
        <g transform="translate(0, 10)">
          <defs>
            <linearGradient id="bodyShimmer" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={WHITE} />
              <stop offset="50%" stopColor="#F0F9FF" />
              <stop offset="100%" stopColor={WHITE} />
            </linearGradient>
          </defs>
          <path
            d="M50 100 C 50 160, 150 160, 150 100 C 150 60, 50 60, 50 100"
            fill={status === 'announcement' ? "url(#bodyShimmer)" : WHITE}
            stroke="#E5E7EB"
            strokeWidth="2"
          />
          {/* Belly Patch (Tech Panel) */}
          <circle cx="100" cy="120" r="35" fill={status === 'announcement' ? "#E0F2FE" : "#F0F9FF"} />
          <path d="M85 120 Q100 135 115 120" stroke={SECONDARY} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* --- HEAD (Rounded Cube) --- */}
        <rect x="40" y="40" width="120" height="100" rx="45" fill={WHITE} />
        {/* Face Screen (Black Glass) */}
        <rect x="55" y="65" width="90" height="60" rx="25" fill={DARK_SCREEN} />

        {/* --- EYES (LED Expression) --- */}
        {status === 'error' ? (
          <g stroke={ACCENT} strokeWidth="4" strokeLinecap="round">
            <path d="M70 85 L90 105 M90 85 L70 105" />
            <path d="M110 85 L130 105 M130 85 L110 105" />
          </g>
        ) : status === 'thinking' ? (
          <g className="origin-center" style={{ transformOrigin: '100px 95px' }}>
            <circle cx="80" cy="95" r="8" stroke={SECONDARY} strokeWidth="3" strokeDasharray="10 5" className="animate-spin" style={{ transformOrigin: '80px 95px' }} />
            <circle cx="120" cy="95" r="8" stroke={SECONDARY} strokeWidth="3" strokeDasharray="10 5" className="animate-spin" style={{ transformOrigin: '120px 95px' }} />
          </g>
        ) : (
          <g className={`${eyeAnim} origin-center`} style={{ transformOrigin: '100px 95px' }}>
            {/* Left Eye */}
            <ellipse cx="80" cy="95" rx="8" ry="12" fill={status === 'announcement' ? ACCENT : SECONDARY} />
            <circle cx="82" cy="90" r="3" fill="white" fillOpacity="0.8" />
            {/* Right Eye */}
            <ellipse cx="120" cy="95" rx="8" ry="12" fill={status === 'announcement' ? ACCENT : SECONDARY} />
            <circle cx="122" cy="90" r="3" fill="white" fillOpacity="0.8" />
          </g>
        )}

        {/* --- MOUTH (Waveform) --- */}
        {(status === 'speaking' || status === 'announcement') && (
          <g transform="translate(100, 115)">
            <rect x="-15" y="-2" width="4" height="4" rx="2" fill={WHITE} className="animate-pulse" />
            <rect x="-5" y="-4" width="4" height="8" rx="2" fill={WHITE} className="animate-pulse" style={{ animationDelay: '0.1s' }} />
            <rect x="5" y="-6" width="4" height="12" rx="2" fill={WHITE} className="animate-pulse" style={{ animationDelay: '0.2s' }} />
            <rect x="15" y="-4" width="4" height="8" rx="2" fill={WHITE} className="animate-pulse" style={{ animationDelay: '0.3s' }} />
          </g>
        )}

        {/* --- CHEEKS (Blush) --- */}
        <circle cx="65" cy="105" r="5" fill="#FDA4AF" opacity="0.6" />
        <circle cx="135" cy="105" r="5" fill="#FDA4AF" opacity="0.6" />

        {/* --- HEADGEAR: NÓN LÁ TECH (Holographic Hat) --- */}
        <path
          d="M20 60 Q 100 -20, 180 60"
          fill="url(#hatGradient)"
          fillOpacity="0.8"
          stroke={PRIMARY}
          strokeWidth="2"
          className={shimmerClass}
        />
        <path d="M20 60 Q 100 80, 180 60" fill="none" stroke={PRIMARY} strokeWidth="2" opacity="0.5" />

        {/* --- ANTENNA (Lúa Sprout) --- */}
        <g className={antennaAnim} style={{ transformOrigin: '100px 20px' }}>
          <path d="M100 20 Q 90 0, 80 -10" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" />
          <path d="M100 20 Q 110 5, 120 -5" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" />
          <circle cx="80" cy="-10" r="3" fill={PRIMARY} />
          <circle cx="120" cy="-5" r="3" fill={PRIMARY} />
        </g>

        {/* Headphones (Chim Lạc Wings stylized) */}
        <path d="M35 80 L 25 80 Q 15 90, 25 100 L 35 100 Z" fill={PRIMARY} />
        <path d="M165 80 L 175 80 Q 185 90, 175 100 L 165 100 Z" fill={PRIMARY} />

        {/* Gradients */}
        <defs>
          <linearGradient id="hatGradient" x1="100" y1="0" x2="100" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={PRIMARY} stopOpacity="0.1" />
            <stop offset="100%" stopColor={SECONDARY} stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default LacLacMascot;