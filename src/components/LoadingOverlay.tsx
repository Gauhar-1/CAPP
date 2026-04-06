"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePartStore } from '@/store/usePartStore';

export function LoadingOverlay() {
  const { isLoading } = usePartStore();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0f12]/80 backdrop-blur-md"
        >
          <div className="relative flex flex-col items-center p-8 glass-panel animate-in zoom-in duration-300">
            {/* Spinning modern loader */}
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-[#232a32]" />
              <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-cyan-400 border-transparent animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              <div className="absolute inset-2 bg-cyan-400/10 rounded-full animate-pulse" />
            </div>
            
            <h3 className="text-xl font-bold text-white tracking-widest uppercase glow-text mb-2">
              Synchronizing Plan
            </h3>
            <p className="text-xs font-mono text-cyan-400/70 tracking-widest animate-pulse">
              COMPUTING SHOP FLOOR DATA...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
