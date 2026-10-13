import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, FileText } from 'lucide-react';

interface HistoryItem {
  id: string;
  text_preview: string;
  created_at: string;
  data: any;
}

export default function HistoryModal({ 
  isOpen, 
  onClose, 
  history, 
  onSelect 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  history: HistoryItem[], 
  onSelect: (item: HistoryItem) => void 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Knowledge History</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {history.length === 0 ? (
            <p className="text-center text-slate-500 py-10">No saved graphs found.</p>
          ) : (
            <div className="grid gap-3">
              {history.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="w-full text-left p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="text-slate-500 group-hover:text-indigo-400 mt-1" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-slate-200 line-clamp-1 font-medium">{item.text_preview}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-xs text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Load →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}