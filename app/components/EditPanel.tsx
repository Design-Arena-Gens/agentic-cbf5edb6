'use client';

import { useState, useEffect } from 'react';
import { WatchlistItem } from '../page';

interface EditPanelProps {
  item: WatchlistItem;
  onUpdate: (updates: Partial<WatchlistItem>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function EditPanel({ item, onUpdate, onDelete, onClose }: EditPanelProps) {
  const [localTitle, setLocalTitle] = useState(item.title);
  const [localPoster, setLocalPoster] = useState(item.poster);
  const [localNotes, setLocalNotes] = useState(item.notes || '');
  const [localScore, setLocalScore] = useState(item.score);

  useEffect(() => {
    setLocalTitle(item.title);
    setLocalPoster(item.poster);
    setLocalNotes(item.notes || '');
    setLocalScore(item.score);
  }, [item]);

  const handleSave = () => {
    onUpdate({
      title: localTitle,
      poster: localPoster,
      notes: localNotes,
      score: localScore
    });
  };

  const handleScoreClick = (score: number) => {
    const newScore = localScore === score ? undefined : score;
    setLocalScore(newScore);
    onUpdate({ score: newScore });
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in"
      onClick={handleOverlayClick}
    >
      <div className="glass-dark rounded-2xl p-8 max-w-md w-full mx-4 relative fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit Item</h2>

        <div className="space-y-4">
          {/* Poster Preview */}
          <div className="flex justify-center">
            <img
              src={localPoster}
              alt={localTitle}
              className="w-40 h-60 object-cover rounded-lg"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Title</label>
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleSave}
              className="w-full rounded-lg"
            />
          </div>

          {/* Poster URL */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Poster URL</label>
            <input
              type="text"
              value={localPoster}
              onChange={(e) => setLocalPoster(e.target.value)}
              onBlur={handleSave}
              className="w-full rounded-lg"
            />
          </div>

          {/* Score */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Score</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => handleScoreClick(score)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    localScore === score
                      ? 'bg-white/30 scale-110'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Notes</label>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={handleSave}
              rows={3}
              className="w-full rounded-lg resize-none"
              placeholder="Add your thoughts..."
            />
          </div>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
