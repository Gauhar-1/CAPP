"use client";

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

// --- Zod Schema definition with Discriminated Union ---
export const featureSchema = z.discriminatedUnion("type", [
  z.object({
    name: z.string().optional(),
    type: z.literal("Face Mill"),
    depthOfCut: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    surfaceFinish: z.enum(["0.8", "1.6", "3.2", "6.3"])
  }),
  z.object({
    name: z.string().optional(),
    type: z.literal("Peripheral Mill"),
    profileDepth: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    widthOfCut: z.number({ message: "Required" }).min(0.1, "Min 0.1")
  }),
  z.object({
    name: z.string().optional(),
    type: z.literal("Blind Hole"),
    diameter: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    depth: z.number({ message: "Required" }).min(0.1, "Min 0.1")
  }),
  z.object({
    name: z.string().optional(),
    type: z.literal("Through Hole"),
    diameter: z.number({ message: "Required" }).min(0.1, "Min 0.1")
  }),
  z.object({
    name: z.string().optional(),
    type: z.literal("Threaded Hole"),
    threadSize: z.enum(["M4", "M5", "M6", "M8", "M10", "M12"]),
    pitch: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    threadDepth: z.number({ message: "Required" }).min(0.1, "Min 0.1")
  }),
  z.object({
    name: z.string().optional(),
    type: z.literal("Reamed Hole"),
    targetDiameter: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    depth: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    toleranceGrade: z.enum(["H7", "H8"])
  }),
  z.object({
    name: z.string().optional(),
    type: z.literal("Step / Counterbore"),
    majorDiameter: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    stepDepth: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    minorDiameter: z.number({ message: "Required" }).min(0.1, "Min 0.1")
  }),
  z.object({
    name: z.string().optional(),
    type: z.literal("Keyway / Slot"),
    slotWidth: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    slotDepth: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    length: z.number({ message: "Required" }).min(0.1, "Min 0.1")
  }),
  z.object({
    name: z.string().optional(),
    type: z.literal("Internal Groove"),
    grooveWidth: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    internalDiameter: z.number({ message: "Required" }).min(0.1, "Min 0.1")
  }),
  z.object({
    name: z.string().optional(),
    type: z.literal("Chamfer"),
    chamferSize: z.number({ message: "Required" }).min(0.1, "Min 0.1"),
    angle: z.number({ message: "Required" }).min(1, "Min 1")
  })
]);

// Auto-fill logic for Thread pitch
const THREAD_PITCH_MAP: Record<string, number> = {
  "M4": 0.7, "M5": 0.8, "M6": 1.0, "M8": 1.25, "M10": 1.5, "M12": 1.75
};

export type FeatureFormValues = z.infer<typeof featureSchema>;

interface FeatureBuilderFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function FeatureBuilderForm({ onSave, onCancel }: FeatureBuilderFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      type: "Face Mill",
      name: "",
      surfaceFinish: "3.2",
      toleranceGrade: "H7"
    } as any
  });

  const selectedType = watch("type");
  const threadSize = watch("threadSize" as any);

  // Auto-fill thread pitch
  useEffect(() => {
    if (selectedType === "Threaded Hole" && threadSize) {
      if (THREAD_PITCH_MAP[threadSize]) {
        setValue("pitch" as any, THREAD_PITCH_MAP[threadSize]);
      }
    }
  }, [threadSize, selectedType, setValue]);

  const onSubmit = (data: any) => {
    // Sanitize parameters object for saving by adapting schema fields back
    // to universal names used by old engine if needed, or keeping them as requested.
    // The request required strict polymorphic names like `targetDiameter`, so we send raw data.
    if (!data.name) {
      data.name = `${data.type} ${Math.floor(Math.random() * 1000)}`;
    }
    // Also, map generic references used by cappEngine for backward compatibility (e.g. diameter vs targetDiameter)
    if (data.targetDiameter && !data.diameter) data.diameter = data.targetDiameter;
    
    onSave(data);
  };

  const getError = (field: string) => {
    const err = (errors as any)[field];
    return err ? err.message : null;
  };

  const NumberInput = ({ label, field, unit, step="0.1" }: { label: string, field: string, unit: string, step?: string }) => (
    <div className="relative">
      <label className="block text-[10px] text-slate-400 mb-1">{label}</label>
      <input type="number" step={step} {...register(field as any, { valueAsNumber: true })} className="w-full cyber-input text-sm pr-12" />
      <span className="absolute right-3 top-[26px] text-xs text-slate-500 font-mono">{unit}</span>
      {getError(field) && <p className="text-red-400 text-[10px] mt-1">{getError(field)}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Feature Type</label>
          <select {...register("type")} className="w-full cyber-input text-sm">
            <option value="Face Mill">Face Mill</option>
            <option value="Peripheral Mill">Peripheral Mill</option>
            <option value="Blind Hole">Blind Hole</option>
            <option value="Through Hole">Through Hole</option>
            <option value="Threaded Hole">Threaded Hole</option>
            <option value="Reamed Hole">Reamed Hole</option>
            <option value="Step / Counterbore">Step / Counterbore</option>
            <option value="Keyway / Slot">Keyway / Slot</option>
            <option value="Internal Groove">Internal Groove</option>
            <option value="Chamfer">Chamfer</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Custom Name (Optional)</label>
          <input type="text" {...register("name")} placeholder={`e.g. ${selectedType} 1`} className="w-full cyber-input text-sm" />
        </div>
      </div>

      <div className="pt-2 border-t border-[#232a32] min-h-[160px] relative overflow-hidden">
        <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">Feature Parameters</h3>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {selectedType === "Face Mill" && (
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Depth of Cut" field="depthOfCut" unit="mm" />
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Surface Finish</label>
                  <select {...register("surfaceFinish" as any)} className="w-full cyber-input text-sm">
                    <option value="0.8">0.8 Ra</option>
                    <option value="1.6">1.6 Ra</option>
                    <option value="3.2">3.2 Ra</option>
                    <option value="6.3">6.3 Ra</option>
                  </select>
                </div>
              </div>
            )}

            {selectedType === "Peripheral Mill" && (
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Profile Depth" field="profileDepth" unit="mm" />
                <NumberInput label="Width of Cut" field="widthOfCut" unit="mm" />
              </div>
            )}

            {selectedType === "Blind Hole" && (
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Diameter" field="diameter" unit="mm" />
                <NumberInput label="Depth" field="depth" unit="mm" />
              </div>
            )}

            {selectedType === "Through Hole" && (
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Diameter" field="diameter" unit="mm" />
              </div>
            )}

            {selectedType === "Threaded Hole" && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Thread Size</label>
                  <select {...register("threadSize" as any)} className="w-full cyber-input text-sm">
                    {Object.keys(THREAD_PITCH_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <NumberInput label="Pitch" field="pitch" unit="mm" step="0.01" />
                <NumberInput label="Thread Depth" field="threadDepth" unit="mm" />
              </div>
            )}

            {selectedType === "Reamed Hole" && (
              <div className="grid grid-cols-3 gap-4">
                <NumberInput label="Target Diameter" field="targetDiameter" unit="mm" />
                <NumberInput label="Depth" field="depth" unit="mm" />
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Tolerance Grade</label>
                  <select {...register("toleranceGrade" as any)} className="w-full cyber-input text-sm">
                    <option value="H7">H7</option>
                    <option value="H8">H8</option>
                  </select>
                </div>
              </div>
            )}

            {selectedType === "Step / Counterbore" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <NumberInput label="Major Diameter" field="majorDiameter" unit="mm" />
                  <NumberInput label="Minor Diameter" field="minorDiameter" unit="mm" />
                  <NumberInput label="Step Depth" field="stepDepth" unit="mm" />
                </div>
              </div>
            )}

            {selectedType === "Keyway / Slot" && (
              <div className="grid grid-cols-3 gap-4">
                <NumberInput label="Slot Width" field="slotWidth" unit="mm" />
                <NumberInput label="Length" field="length" unit="mm" />
                <NumberInput label="Slot Depth" field="slotDepth" unit="mm" />
              </div>
            )}

            {selectedType === "Internal Groove" && (
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Groove Width" field="grooveWidth" unit="mm" />
                <NumberInput label="Internal Diameter" field="internalDiameter" unit="mm" />
              </div>
            )}

            {selectedType === "Chamfer" && (
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Chamfer Size" field="chamferSize" unit="mm" />
                <NumberInput label="Angle" field="angle" unit="deg" step="1" />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-[#232a32]">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
          Cancel
        </button>
        <button type="submit" className="glow-button px-6 py-2 text-sm">
          Save Feature
        </button>
      </div>
    </form>
  );
}
