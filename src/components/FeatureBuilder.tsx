"use client";

import React, { useState } from 'react';
import { usePartStore } from '@/store/usePartStore';
import { FeatureModal } from './FeatureModal';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FeatureBuilder() {
  const { features, addFeature, removeFeature, dimensions } = usePartStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex-1 p-8 flex flex-col h-full bg-[#090a0c] relative overflow-hidden">
      
      {/* Background Stylized 2D Grid Representation */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none flex items-center justify-center">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f0ff" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white glow-text mb-1">Feature Canvas</h2>
          <p className="text-slate-500 text-sm">Define prismatic features to generate the process plan.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="glow-button px-6 py-3 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Feature
        </button>
      </div>

      {/* Feature Cards Area */}
      <div className="relative z-10 flex-1 overflow-y-auto pr-4">
        {features.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 border-2 border-dashed border-[#232a32] rounded-xl">
            <div className="p-4 rounded-full bg-[#14181d] border border-[#232a32]">
              <Plus className="w-8 h-8 text-[#00f0ff] opacity-50" />
            </div>
            <p>No features defined. Click 'Add Feature' to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {features.map((feature) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="glass-panel p-5 relative group"
                >
                  <button 
                    onClick={() => removeFeature(feature.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-1">{feature.type}</div>
                  <h3 className="text-lg font-bold text-slate-200 mb-4">{feature.name}</h3>
                  <div className="space-y-2">
                    {Object.entries(feature.parameters).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-sm border-b border-[#232a32] pb-1">
                        <span className="text-slate-500 capitalize">{key}</span>
                        <span className="text-slate-300 font-mono">{val} mm</span>
                      </div>
                    ))}
                    {Object.keys(feature.parameters).length === 0 && (
                      <div className="text-sm text-slate-500 italic">No parameters</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <FeatureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addFeature} 
      />
    </div>
  );
}
