"use client";

import React, { useState } from 'react';
import { Search, Upload, Sparkles, History } from 'lucide-react';
import KnowledgeGraphView from '@/components/KnowledgeGraphView';
import FlashcardModal from '@/components/FlashcardModal';
import HistoryModal from '@/components/HistoryModal';

export default function StudyGraphPage() {
  // --- State Management ---
  const [text, setText] = useState('');
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Flashcard State
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);

  // History State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- API Handlers ---

  // 1. Extract Graph from Text
  const handleExtract = async () => {
    console.log("--- 🛠️ DEBUG: handleExtract triggered ---");

    if (!text) {
      console.log("--- ❌ DEBUG: Text is empty, returning early ---");
      return;
    }

    console.log("--- 🛠️ DEBUG: Starting API call... ---");
    setLoading(true);

    try {
      console.log("--- 🛠️ DEBUG: Sending fetch request to backend... ---");
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/extract-graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      

      console.log("--- 🛠️ DEBUG: Response received. Status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("--- ❌ DEBUG: Server error response:", errorText);
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("--- ✅ DEBUG: Data successfully received:", data);

      if (data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
      } else {
        console.error("--- ❌ DEBUG: Data format is wrong. Expected nodes/edges, got:", data);
      }
    } catch (e: any) {
      console.error("--- ❌ DEBUG: Catch block triggered. Error:", e);
      alert(`Extraction failed: ${e.message}`);
    } finally {
      console.log("--- 🛠️ DEBUG: Setting loading to false ---");
      setLoading(false);
    }
  };

  // 2. Generate Flashcards for a Node
  const handleNodeClick = async (node: any) => {
    setSelectedNode(node);
    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/generate-flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: node.data.label,
          description: node.data.description
        }),
      });
      const data = await res.json();
      setCards(data);
    } catch (e) {
      console.error("Flashcard generation failed:", e);
    }
  };

  // 3. Fetch History from MongoDB
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/history`);
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  const toggleHistory = async () => {
    if (!historyOpen) {
      await fetchHistory(); // Refresh history list when opening
    }
    setHistoryOpen(!historyOpen);
  };

  // 4. Load a specific graph from history
  const handleLoadHistory = (item: any) => {
    setNodes(item.data.nodes);
    setEdges(item.data.edges);
    setHistoryOpen(false);
  };

  return (
    <main className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">

      {/* LEFT PANEL: Controls & Input */}
      <div className="w-1/3 h-full border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-6 backdrop-blur-xl z-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Synapse AI</h1>
          </div>

          {/* History Trigger Button */}
          <button
            onClick={toggleHistory}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            title="View History"
          >
            <History size={20} />
          </button>
        </div>

        {/* Input Area */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-400">Learning Material</label>
          <textarea
            className="w-full h-64 p-4 rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm leading-relaxed"
            placeholder="Paste lecture notes, textbook content, or research abstracts here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleExtract}
          disabled={loading || !text}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          {loading ? 'Analyzing...' : <><Upload size={18} /> Generate Study Graph</>}
        </button>

        {/* Tooltip/Tip */}
        <div className="mt-auto p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
          <strong>Tip:</strong> Click on any node in the graph to generate AI-powered active recall flashcards for that specific concept.
        </div>
      </div>

      {/* RIGHT PANEL: Graph Visualization */}
      <div className="flex-1 relative bg-slate-950" style={{ minHeight: '800px' }}>

        {/* Empty State Overlay - IMPORTANT: Ensure this disappears when nodes exist */}
        {nodes.length === 0 && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4 z-10 bg-slate-950">
            <Search size={48} strokeWidth={1} />
            <p className="text-center max-w-xs">Enter text and generate a graph to begin visualizing knowledge.</p>
          </div>
        )}

        {/* THE BRUTE FORCE FIX: Hardcoded height in pixels */}
        <div style={{ width: '100%', height: '800px', position: 'relative' }}>
          <KnowledgeGraphView
            initialNodes={nodes}
            initialEdges={edges}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>

      {/* MODALS */}

      {/* 1. History Modal */}
      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelect={handleLoadHistory}
      />

      {/* 2. Flashcard Modal */}
      {selectedNode && (
        <FlashcardModal
          cards={cards}
          onClose={() => setSelectedNode(null)}
        />
      )}

    </main>
  );
}