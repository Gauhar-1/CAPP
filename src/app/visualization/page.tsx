"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { usePartStore } from '@/store/usePartStore';
import { ReactFlow, MiniMap, Controls, Background, BackgroundVariant, useNodesState, useEdgesState, MarkerType, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomOpNode } from '@/components/CustomOpNode';
import Link from 'next/link';
import { ArrowLeft, GitMerge } from 'lucide-react';

const nodeTypes = {
  custom: CustomOpNode,
};

export default function VisualizationPage() {
  const { operations, partName, material } = usePartStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (operations.length > 0) {
      const generatedNodes = operations.map((op, index) => ({
        id: op.opNo.toString(),
        type: 'custom',
        position: { x: window.innerWidth / 2 - 144, y: index * 250 + 100 }, // centered roughly, spaced 250px vertically
        data: op,
      }));

      const generatedEdges = [];
      for (let i = 1; i < operations.length; i++) {
        generatedEdges.push({
          id: `e-${operations[i-1].opNo}-${operations[i].opNo}`,
          source: operations[i-1].opNo.toString(),
          target: operations[i].opNo.toString(),
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#00f0ff', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#00f0ff',
          },
        });
      }

      setNodes(generatedNodes);
      setEdges(generatedEdges);
    }
  }, [operations, setNodes, setEdges]);

  if (!isClient) return null;

  if (operations.length === 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0d0f12] text-slate-200">
        <GitMerge className="w-16 h-16 text-slate-600 mb-6" />
        <h2 className="text-2xl font-bold text-white glow-text mb-2">No Process Plan Active</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">
          You need to define features and generate a plan on the dashboard before we can visualize it.
        </p>
        <Link href="/" className="glow-button px-6 py-3 flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#090a0c] flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors bg-[#0d0f12] p-2 rounded-md border border-[#232a32]">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Back to Canvas</span>
          </Link>
        </div>
        <div className="px-6 py-3 bg-[#14181d] border border-[#232a32] rounded-md shadow-xl backdrop-blur-md pointer-events-auto">
          <h1 className="text-xl font-bold text-white glow-text tracking-wider uppercase">{partName}</h1>
          <p className="text-xs text-cyan-400 font-mono text-center mt-1">2D PROCESS FLOW</p>
        </div>
      </div>

      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }} // standard to try to hide watermark if requested for premium feel, though requires license. 
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#232a32" />
          <Controls className="!bg-[#14181d] !border-[#232a32] !fill-cyan-400" />
          <MiniMap 
            nodeColor={(n: any) => {
              return '#00f0ff';
            }}
            maskColor="rgba(9, 10, 12, 0.8)"
            style={{ backgroundColor: '#14181d', border: '1px solid #232a32' }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
