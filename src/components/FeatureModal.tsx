"use client";

import React from 'react';
import { X } from 'lucide-react';
import { PartFeature } from '@/lib/capp-logic';
import { FeatureBuilderForm, FeatureFormValues } from './FeatureBuilderForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveFeature: (featureData: any) => void;
  initialData?: any;
}

export function FeatureModal({ isOpen, onClose, onSaveFeature, initialData }: Props) {
  if (!isOpen) return null;

  const handleSave = (data: FeatureFormValues & { name: string }) => {
    const featureData: any = {
      type: data.type,
      name: data.name || data.type,
      parameters: { ...data }
    };
    
    // Clean up parameters
    delete featureData.parameters.name;
    delete featureData.parameters.type;

    onSaveFeature(featureData);
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

        <FeatureBuilderForm onSave={handleSave} onCancel={onClose} initialData={initialData} />
      </div>
    </div>
  );
}
