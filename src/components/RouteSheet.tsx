"use client";

import React, { useState } from 'react';
import { usePartStore } from '@/store/usePartStore';
import { Download, Share2, Play, Loader2, GitMerge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export function RouteSheet() {
  const router = useRouter();
  const { partName, material, dimensions, includeLifecycle, features, operations, setOperations, getBase64, setIsLoading } = usePartStore();
  
  const { mutate: generatePlan, isPending } = useMutation({
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
    mutationFn: async () => {
      const response = await axios.post('/api/generate-plan', {
        partName,
        material,
        dimensions,
        includeLifecycle,
        features
      });
      return response.data.part.features;
    },
    onSuccess: (data) => {
      // Flatten operations correctly
      const ops = data.flatMap((f: any) => 
        f.operations.map((op: any) => ({ ...op, featureId: f.id }))
      );
      // Ensure operations are sorted visually
      ops.sort((a: any, b: any) => a.opNo - b.opNo);
      setOperations(ops);
    },
    onError: (error) => {
      alert('Failed to generate process plan: ' + error.message);
    }
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('ProcessPlanner.AI - Route Sheet', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Part Name: ${partName}`, 14, 32);
    doc.text(`Material: ${material}`, 14, 38);
    doc.text(`Block Dimensions: ${dimensions.x} x ${dimensions.y} x ${dimensions.z} mm`, 14, 44);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 50);

    autoTable(doc, {
      startY: 50,
      head: [['Op No', 'Machine', 'Operation Type', 'Tooling', 'Spindle Speed (RPM)', 'Feed Rate (mm/min)']],
      body: operations.map(op => [
        op.opNo,
        op.machine,
        op.type,
        op.tooling,
        op.spindleSpeed,
        op.feedRate
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 71, 255] }
    });

    doc.save('route-sheet.pdf');
  };

  return (
    <div className="w-full lg:w-[450px] border-t lg:border-t-0 lg:border-l border-[#232a32] bg-[#0d0f12] h-[50vh] lg:h-full flex flex-col relative z-20 shrink-0">
      <div className="p-4 lg:p-6 border-b border-[#232a32] flex justify-between items-center bg-[#14181d]">
        <div>
          <h2 className="text-lg font-bold text-white glow-text">Generated Route Sheet</h2>
          <p className="text-xs text-slate-400 mt-1">{partName} | {material}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/visualization')}
            disabled={operations.length === 0}
            title={operations.length === 0 ? "Generate a process plan to unlock the visual flowchart." : "View 2D Process Flow"}
            className={`px-4 py-2 text-xs flex items-center gap-2 rounded-md transition-all duration-300 font-medium ${
              operations.length === 0 
                ? "bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/50"
            }`}
          >
            <GitMerge className="w-4 h-4" />
            <span className="hidden sm:inline">Visual Flowchart</span>
          </button>

          <button 
            onClick={() => generatePlan()}
            disabled={isPending || features.length === 0}
            className="glow-button px-4 py-2 text-xs flex items-center gap-2 disabled:opacity-50 font-medium"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPending ? 'Calculating...' : 'Generate Plan'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
        {operations.length === 0 && !isPending ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm text-center px-6">
            <div className="mb-4 opacity-50">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            Define features and click Generate to run the AI engine.
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-12 text-[10px] uppercase tracking-wider text-slate-500 pb-2 px-2 border-b border-[#232a32] mb-2 sticky top-0 bg-[#0d0f12] z-10 pt-2">
              <div className="col-span-1">Op</div>
              <div className="col-span-3">Machine</div>
              <div className="col-span-3">Operation</div>
              <div className="col-span-3">Tooling</div>
              <div className="col-span-2 text-right">Data</div>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {operations.map((op, idx) => (
                  <motion.div
                    key={`${op.featureId}-${op.opNo}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="grid grid-cols-12 gap-2 text-sm items-center p-2 rounded-md hover:bg-[#14181d] transition-colors border border-transparent hover:border-[#232a32]"
                  >
                    <div className="col-span-1 font-mono text-cyan-400 text-xs">
                      {op.opNo.toString().padStart(4, '0')}
                    </div>
                    <div className="col-span-3 text-slate-300 text-xs truncate pr-2" title={op.machine}>
                      {op.machine}
                    </div>
                    <div className="col-span-3 text-slate-200 truncate pr-2" title={op.type}>
                      {op.type}
                    </div>
                    <div className="col-span-3 text-slate-400 text-xs truncate pr-2" title={op.tooling}>
                      {op.tooling}
                    </div>
                    <div className="col-span-2 text-right text-[10px] text-slate-500 flex flex-col font-mono">
                      <span>S{op.spindleSpeed}</span>
                      <span>F{op.feedRate}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 lg:p-6 border-t border-[#232a32] bg-[#14181d] grid grid-cols-2 gap-4">
        <button 
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set('state', getBase64());
            navigator.clipboard.writeText(url.toString());
            alert('Shareable link copied!');
          }}
          className="glow-button secondary flex items-center justify-center gap-2 py-3 rounded-md"
        >
          <Share2 className="w-4 h-4" />
          Share UI
        </button>
        <button 
          onClick={handleDownloadPDF}
          disabled={operations.length === 0}
          className="glow-button flex items-center justify-center gap-2 py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>
    </div>
  );
}
