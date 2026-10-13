import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { BrainCircuit } from 'lucide-react';

export type ConceptNodeData = {
  label: string;
  description: string;
  centrality: number;
};

export default function ConceptNode({ data }: NodeProps) {
  const nodeData = data as ConceptNodeData;

  const isCoreConcept = nodeData.centrality > 0.3;

  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 shadow-xl
      ${
        isCoreConcept
          ? 'bg-indigo-900/80 border-indigo-400 text-white scale-110'
          : 'bg-slate-900/90 border-slate-700 text-slate-200'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-indigo-500"
      />

      <div className="flex items-center gap-2 mb-1">
        <BrainCircuit
          size={16}
          className={
            isCoreConcept ? 'text-indigo-300' : 'text-slate-400'
          }
        />

        <span className="font-bold text-sm tracking-tight">
          {nodeData.label}
        </span>
      </div>

      <p className="text-[10px] leading-relaxed text-slate-400 max-w-[150px]">
        {nodeData.description}
      </p>

      {isCoreConcept && (
        <div className="mt-2 text-[8px] font-bold uppercase tracking-widest text-indigo-300">
          Core Concept
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-indigo-500"
      />
    </div>
  );
}