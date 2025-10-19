'use client';

import { useState, useEffect, useRef } from 'react';
import { CategoryType, MediaType, WatchlistItem } from '../page';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddItem: (item: Omit<WatchlistItem, 'id'>) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

interface SearchResult {
  title: string;
  poster: string;
  type: MediaType;
  year?: string;
}

export default function Sidebar({ isOpen, onToggle, onAddItem, onExport, onImport }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualPoster, setManualPoster] = useState('');
  const [selectedType, setSelectedType] = useState<MediaType>('movie');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('planning');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchQuery.length > 2 && !manualMode) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        await searchMedia(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, manualMode]);

  const searchMedia = async (query: string) => {
    try {
      const results: SearchResult[] = [];

      // iTunes API for movies
      try {
        const movieRes = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=movie&limit=5`
        );
        const movieData = await movieRes.json();
        if (movieData.results) {
          movieData.results.forEach((item: any) => {
            results.push({
              title: item.trackName,
              poster: item.artworkUrl100?.replace('100x100', '500x500') || '',
              type: 'movie',
              year: item.releaseDate?.split('-')[0]
            });
          });
        }
      } catch (error) {
        console.error('iTunes API error:', error);
      }

      // TVMaze API for TV shows
      try {
        const tvRes = await fetch(
          `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
        );
        const tvData = await tvRes.json();
        if (tvData) {
          tvData.slice(0, 5).forEach((item: any) => {
            results.push({
              title: item.show.name,
              poster: item.show.image?.original || item.show.image?.medium || '',
              type: 'tv',
              year: item.show.premiered?.split('-')[0]
            });
          });
        }
      } catch (error) {
        console.error('TVMaze API error:', error);
      }

      setSearchResults(results);
      setShowResults(results.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    setSearchQuery(result.title);
    setManualTitle(result.title);
    setManualPoster(result.poster);
    setSelectedType(result.type);
    setShowResults(false);
  };

  const handleAdd = () => {
    const title = manualMode ? manualTitle : searchQuery;
    const poster = manualPoster || 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=No+Poster';

    if (!title.trim()) return;

    onAddItem({
      title: title.trim(),
      poster,
      type: selectedType,
      category: selectedCategory
    });

    // Reset form
    setSearchQuery('');
    setManualTitle('');
    setManualPoster('');
    setManualMode(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 glass-dark rounded-lg p-3 hover:bg-white/10 transition-smooth"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen z-40 transition-all duration-300 ${
          isOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full'
        }`}
      >
        <div className="h-full glass-dark p-6 overflow-y-auto flex flex-col gap-6">
          <div className="mt-12">
            <h1 className="text-2xl font-bold mb-2">Watchlist</h1>
            <div className="h-0.5 w-16 bg-gradient-to-r from-white to-transparent" />
          </div>

          {/* Search / Add Section */}
          <div className="space-y-4">
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => setManualMode(false)}
                className={`px-3 py-1 rounded ${!manualMode ? 'bg-white/20' : 'bg-white/5'}`}
              >
                Search
              </button>
              <button
                onClick={() => setManualMode(true)}
                className={`px-3 py-1 rounded ${manualMode ? 'bg-white/20' : 'bg-white/5'}`}
              >
                Manual
              </button>
            </div>

            {manualMode ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Title"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Poster URL (optional)"
                  value={manualPoster}
                  onChange={(e) => setManualPoster(e.target.value)}
                  className="w-full rounded-lg"
                />
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies & shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg"
                />
                {showResults && (
                  <div className="absolute top-full mt-2 w-full glass-dark rounded-lg overflow-hidden max-h-64 overflow-y-auto z-10">
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectResult(result)}
                        className="p-3 hover:bg-white/10 cursor-pointer flex gap-3 border-b border-white/5 last:border-0"
                      >
                        {result.poster && (
                          <img
                            src={result.poster}
                            alt={result.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          <div className="text-xs text-white/60">
                            {result.type === 'movie' ? 'Movie' : 'TV Show'}
                            {result.year && ` • ${result.year}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Type & Category Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as MediaType)}
                  className="w-full rounded-lg text-sm"
                >
                  <option value="movie">Movie</option>
                  <option value="tv">TV Show</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Add to</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                  className="w-full rounded-lg text-sm"
                >
                  <option value="planning">Planning</option>
                  <option value="watching">Watching</option>
                  <option value="watched">Watched</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg font-medium"
            >
              Add to Watchlist
            </button>
          </div>

          {/* Import/Export */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <button
              onClick={onExport}
              className="w-full glass py-2 rounded-lg text-sm hover:bg-white/10"
            >
              Export
            </button>
            <button
              onClick={handleImportClick}
              className="w-full glass py-2 rounded-lg text-sm hover:bg-white/10"
            >
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="mt-auto pt-4 border-t border-white/10 text-xs text-white/40 text-center">
            Watchlist Organizer v1.0
          </div>
        </div>
      </div>
    </>
  );
}
