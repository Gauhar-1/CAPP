"use client";

import React from 'react';
import { usePartStore } from '@/store/usePartStore';
import { Settings, Cpu, Layers } from 'lucide-react';

export function Sidebar() {
  const { partName, material, dimensions, includeLifecycle, setPartName, setMaterial, setDimensions, setIncludeLifecycle } = usePartStore();

  const materials = ['Aluminum 6061', 'Mild Steel 1018', 'Titanium Grade 5', 'Brass'];

  return (
    <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#232a32] p-4 lg:p-6 flex flex-col gap-4 lg:gap-8 h-auto lg:h-full lg:overflow-y-auto glass-panel rounded-none shrink-0 space-y-4 lg:space-y-6">
      <div className="flex items-center gap-3 text-cyan-400">
        <Cpu className="w-8 h-8" />
        <h1 className="text-xl font-bold tracking-wider uppercase text-white glow-text">
          ProcessPlanner<span className="text-cyan-400">.AI</span>
        </h1>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2">
          <Layers className="w-5 h-5 text-[#00f0ff]" />
          <h2>Part Setup</h2>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Part Name</label>
          <input 
            type="text" 
            className="w-full cyber-input text-sm"
            value={partName}
            placeholder="e.g. Pneumatic Valve Block"
            onChange={(e) => setPartName(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Raw Material</label>
          <select 
            className="w-full cyber-input text-sm"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            {materials.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3 pt-2">
          <label className="block text-xs uppercase tracking-wider text-slate-500">Block Dimensions (mm)</label>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">X length</label>
              <input 
                type="number" 
                className="w-full cyber-input text-sm text-center"
                value={dimensions.x}
                onChange={(e) => setDimensions({ ...dimensions, x: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Y width</label>
              <input 
                type="number" 
                className="w-full cyber-input text-sm text-center"
                value={dimensions.y}
                onChange={(e) => setDimensions({ ...dimensions, y: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Z height</label>
              <input 
                type="number" 
                className="w-full cyber-input text-sm text-center"
                value={dimensions.z}
                onChange={(e) => setDimensions({ ...dimensions, z: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 cursor-pointer">
            <input 
              type="checkbox" 
              className="form-checkbox text-cyan-400 bg-[#0d0f12] border-[#232a32] rounded focus:ring-0 focus:ring-offset-0"
              checked={includeLifecycle}
              onChange={(e) => setIncludeLifecycle(e.target.checked)}
            />
            <span>Include Lifecycle Ops</span>
          </label>
        </div>
      </div>
      
      <div className="flex-1" />
      
      <div className="border-t border-[#232a32] pt-6 flex flex-col gap-2">
        <div className="text-xs text-slate-500">Status</div>
        <div className="flex items-center gap-2 text-sm text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></div>
          System Ready
        </div>
      </div>
    </aside>
  );
}
