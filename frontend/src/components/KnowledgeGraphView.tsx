import React from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  ConnectionLineType 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ConceptNode from './ConceptNode';

const nodeTypes = { conceptNode: ConceptNode };

interface NodeData {
  label: string;
  description: string;
  centrality: number;
}

interface GraphProps {
  initialNodes: any[];
  initialEdges: any[];
  onNodeClick: (node: any) => void;
}

export default function KnowledgeGraphView({ initialNodes, initialEdges, onNodeClick }: GraphProps) {
  // FIX: Remove the 'normalize' state. Use initialNodes directly.
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // IMPORTANT: This forces the graph to update when the backend sends new nodes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} className="bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node)}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Background color="#334155" gap={20} />
        <Controls className="!bg-slate-900 !border-slate-700" />
        <MiniMap 
          nodeColor={(n) => ((n.data as NodeData)?.centrality > 0.3 ? '#818cf8' : '#475569')} 
          className="!bg-slate-900 !border-2 !border-slate-700"
          maskColor="rgba(15, 23, 42, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}