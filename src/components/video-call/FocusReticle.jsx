import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FocusReticle Component
 * 
 * Camera focus guide overlay for video call
 * Displays a reticle with corner brackets and center dot to guide users
 * when capturing images during video calls
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isActive - Whether the reticle should be visible
 */
const FocusReticle = ({ isActive }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 20 }}
        >
          {/* Reticle Container */}
          <div className="relative" style={{ width: '288px', height: '288px' }}>
            {/* Corner Brackets */}
            {/* Top Left */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white opacity-80 rounded-tl-lg" />
            
            {/* Top Right */}
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white opacity-80 rounded-tr-lg" />
            
            {/* Bottom Left */}
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white opacity-80 rounded-bl-lg" />
            
            {/* Bottom Right */}
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white opacity-80 rounded-br-lg" />

            {/* Center Dot Indicator */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-3 h-3 bg-white rounded-full opacity-80" />
            </motion.div>

            {/* Optional: Scanning line animation */}
            <motion.div
              animate={{
                y: [0, 288, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              style={{ top: 0 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

FocusReticle.propTypes = {
  isActive: PropTypes.bool.isRequired
};

export default FocusReticle;
