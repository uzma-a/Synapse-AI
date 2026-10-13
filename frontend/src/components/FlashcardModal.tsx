"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, RotateCcw } from "lucide-react";

interface Flashcard {
  question: string;
  answer: string;
  node_id: string; // Required by backend
}

type Rating = "Hard" | "Medium" | "Easy";

export default function FlashcardModal({
  cards,
  title,
  onClose,
}: {
  cards: Flashcard[];
  title?: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<number, Rating>>({});
  const [finished, setFinished] = useState(false);

  if (!cards || cards.length === 0) return null;

  const safeIndex = Math.min(index, cards.length - 1);
  const card = cards[safeIndex];

  if (!card) return null;

  const handleRating = async (rating: Rating) => {
    // 1. Save rating to backend
    try {
      const response = await fetch("http://localhost:8000/api/rate-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card_id: card.node_id,
          rating: rating,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save rating: ${response.status}`);
      }
    } catch (e) {
      console.error("Failed to save progress:", e);
    }

    // 2. Keep local rating state
    setRatings((r) => ({
      ...r,
      [safeIndex]: rating,
    }));

    // 3. Move to next card / finish
    setFlipped(false);

    if (safeIndex >= cards.length - 1) {
      setFinished(true);
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setFinished(false);
    setRatings({});
  };

  const counts = Object.values(ratings).reduce(
    (acc, r) => ({
      ...acc,
      [r]: (acc[r] ?? 0) + 1,
    }),
    {} as Record<string, number>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl select-none"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {title && (
          <p className="text-center text-sm text-slate-400 mb-1 px-6 truncate">
            {title}
          </p>
        )}

        {finished ? (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Session complete 🎉
            </h2>

            <p className="text-slate-300 mb-6">
              Hard: {counts.Hard ?? 0} · Medium: {counts.Medium ?? 0} · Easy:{" "}
              {counts.Easy ?? 0}
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={restart}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Restart
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                Active Recall: {safeIndex + 1} / {cards.length}
              </span>
            </div>

            {/* Flip card */}
            <div
              className="relative h-64 w-full cursor-pointer"
              style={{ perspective: "1000px" }}
              onClick={() => setFlipped((f) => !f)}
            >
              <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center p-6 text-center text-lg font-medium text-white overflow-y-auto"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {card.question}
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-indigo-600 border border-indigo-400 rounded-2xl flex items-center justify-center p-6 text-center text-base text-white overflow-y-auto"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {card.answer}
                </div>
              </motion.div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-3">
              {flipped
                ? "Rate how well you recalled it"
                : "Click the card to reveal the answer"}
            </p>

            <div className="mt-6 flex justify-between items-center gap-4">
              <button
                onClick={() => {
                  setFlipped(false);
                  setIndex(Math.max(0, safeIndex - 1));
                }}
                disabled={safeIndex === 0}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                aria-label="Previous card"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="flex gap-2">
                {(["Hard", "Medium", "Easy"] as Rating[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleRating(level)}
                    className="px-3 py-1 text-xs rounded-full bg-slate-800 hover:bg-indigo-500 text-slate-300 hover:text-white transition-all border border-slate-700"
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
