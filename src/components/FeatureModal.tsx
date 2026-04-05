"use client";

import React from 'react';
import { X } from 'lucide-react';
import { PartFeature } from '@/lib/capp-logic';
import { FeatureBuilderForm, FeatureFormValues } from './FeatureBuilderForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (feature: PartFeature) => void;
}

export function FeatureModal({ isOpen, onClose, onAdd }: Props) {
  if (!isOpen) return null;

  const handleSave = (data: FeatureFormValues & { name: string }) => {
    // Generate a unique ID and map form values into the expected PartFeature structure
    const newFeature: PartFeature = {
      id: Math.random().toString(36).substr(2, 9),
      type: data.type as any, // Cast to any since we changed the types
      name: data.name || data.type,
      parameters: { ...data } as any
    };
    
    // Clean up parameters (remove name and type to save space)
    delete (newFeature.parameters as any).name;
    delete (newFeature.parameters as any).type;

    onAdd(newFeature);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 shadow-[0_0_40px_rgba(0,240,255,0.1)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white glow-text">Define Feature</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-cyan-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <FeatureBuilderForm onSave={handleSave} onCancel={onClose} />
      </div>
    </div>
  );
}
