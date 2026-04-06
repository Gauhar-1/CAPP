"use client";

import React, { useState } from 'react';
import { usePartStore } from '@/store/usePartStore';
import { FeatureModal } from './FeatureModal';
import { Plus, Trash2, Library, Loader2, ChevronDown, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function FeatureBuilder() {
  const { features, addFeature, updateFeature, removeFeature, dimensions, applyTemplate, setIsLoading } = usePartStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);

  // Fetch standard templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const res = await axios.get('/api/templates');
      return res.data.templates;
    }
  });

  const loadTemplate = (template: any) => {
    setIsDropdownOpen(false);
    setIsLoading(true);
    
    // Smooth transition
    setTimeout(() => {
      applyTemplate(template);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="flex-1 p-4 lg:p-8 flex flex-col h-[50vh] lg:h-full bg-[#090a0c] relative">
      
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

      <div className="relative z-50 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 lg:mb-8">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white glow-text mb-1">Feature Canvas</h2>
          <p className="text-slate-500 text-xs lg:text-sm">Define prismatic features or load a standard Part Family template.</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 w-full md:w-auto">
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="glow-button secondary px-4 py-3 flex items-center gap-2"
            >
              <Library className="w-5 h-5" />
              Load Template
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-[#14181d] border border-[#232a32] rounded-md shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-[#232a32] bg-[#0d0f12]">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Standard Part Families</h4>
                </div>
                {isLoadingTemplates ? (
                  <div className="p-6 flex justify-center">
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {templates?.map((t: any) => (
                      <button 
                        key={t._id || t.familyCode}
                        onClick={() => loadTemplate(t)}
                        className="w-full text-left p-3 hover:bg-[#232a32] border-b border-[#232a32] transition-colors flex flex-col gap-1 group"
                      >
                        <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{t.familyName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{t.familyCode} | {t.defaultMaterial}</span>
                      </button>
                    ))}
                    {!templates?.length && (
                      <div className="p-4 text-xs text-slate-500 text-center">No templates seeded. Run backend seed logic.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              setEditingFeature(null);
              setIsModalOpen(true);
            }}
            className="glow-button px-4 lg:px-6 py-2 lg:py-3 flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            Add Feature
          </button>
        </div>
      </div>

      {/* Feature Cards Area */}
      <div className="relative z-10 flex-1 overflow-y-auto pr-2 lg:pr-4">
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
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => {
                        setEditingFeature(feature);
                        setIsModalOpen(true);
                      }}
                      className="text-slate-500 hover:text-cyan-400 p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeFeature(feature.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingFeature(null);
        }} 
        onSaveFeature={(featureData: any) => {
          if (editingFeature) {
            updateFeature(editingFeature.id, featureData);
          } else {
            addFeature({
              id: Math.random().toString(36).substr(2, 9),
              ...featureData
            });
          }
        }} 
        initialData={editingFeature}
      />
    </div>
  );
}
