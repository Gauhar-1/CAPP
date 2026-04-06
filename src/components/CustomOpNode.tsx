import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Settings, Cpu, Zap, Activity } from 'lucide-react';

export function CustomOpNode({ data }: { data: any }) {
  return (
    <div className="bg-[#14181d] border border-[#232a32] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] w-72 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in duration-300">
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-3 !h-3 !border-none" />
      
      {/* Header */}
      <div className="bg-[#090a0c] p-3 border-b border-[#232a32] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase">
            OP {data.opNo.toString().padStart(3, '0')}
          </span>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 relative">
        <h3 className="text-lg font-bold text-white tracking-wide glow-text truncate" title={data.type}>
          {data.type}
        </h3>
        
        <div className="flex items-start gap-2">
          <Cpu className="w-4 h-4 text-slate-500 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Machine</span>
            <span className="text-sm text-slate-300">{data.machine}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Activity className="w-4 h-4 text-slate-500 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Tooling</span>
            <span className="text-sm text-slate-300 truncate w-52" title={data.tooling}>{data.tooling}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#090a0c] p-3 border-t border-[#232a32] flex px-4">
        <div className="flex-1 flex flex-col border-r border-[#232a32]">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" /> Speed
          </span>
          <span className="text-sm font-mono text-slate-200">{data.spindleSpeed} <span className="text-xs text-slate-500">RPM</span></span>
        </div>
        <div className="flex-1 flex flex-col pl-4 text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-end gap-1">
             Feed
          </span>
          <span className="text-sm font-mono text-slate-200">{data.feedRate} <span className="text-xs text-slate-500">mm/m</span></span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-3 !h-3 !border-none" />
    </div>
  );
}
