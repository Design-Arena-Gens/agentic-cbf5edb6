'use client';

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import EditPanel from './components/EditPanel';

export type MediaType = 'movie' | 'tv';
export type CategoryType = 'watching' | 'planning' | 'watched' | 'dropped';

export interface WatchlistItem {
  id: string;
  title: string;
  poster: string;
  type: MediaType;
  category: CategoryType;
  score?: number;
  notes?: string;
}

const INITIAL_DATA: WatchlistItem[] = [
  {
    id: '1',
    title: 'Inception',
    poster: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
    type: 'movie',
    category: 'watched',
    score: 9,
    notes: 'Mind-bending masterpiece'
  },
  {
    id: '2',
    title: 'The Matrix',
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    type: 'movie',
    category: 'watched',
    score: 10,
    notes: 'Revolutionary'
  },
  {
    id: '3',
    title: 'Interstellar',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    type: 'movie',
    category: 'watched',
    score: 9
  },
  {
    id: '4',
    title: 'Breaking Bad',
    poster: 'https://image.tmdb.org/t/p/w500/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg',
    type: 'tv',
    category: 'watching',
    score: 10,
    notes: 'Best TV show ever'
  },
  {
    id: '5',
    title: 'Stranger Things',
    poster: 'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg',
    type: 'tv',
    category: 'watching',
    score: 8
  },
  {
    id: '6',
    title: 'The Crown',
    poster: 'https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg',
    type: 'tv',
    category: 'watching',
    score: 7
  },
  {
    id: '7',
    title: 'Dune: Part Two',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    type: 'movie',
    category: 'planning',
    notes: 'Waiting for streaming'
  },
  {
    id: '8',
    title: 'Oppenheimer',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    type: 'movie',
    category: 'planning'
  },
  {
    id: '9',
    title: 'The Last of Us',
    poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
    type: 'tv',
    category: 'planning',
    notes: 'Heard great things'
  },
  {
    id: '10',
    title: 'Avatar: The Way of Water',
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    type: 'movie',
    category: 'dropped',
    score: 5,
    notes: 'Too long'
  },
  {
    id: '11',
    title: 'House of the Dragon',
    poster: 'https://image.tmdb.org/t/p/w500/7QMsOTMUswARwMMzjzw0KYkrmg5.jpg',
    type: 'tv',
    category: 'dropped',
    score: 6,
    notes: 'Not as good as GoT'
  },
  {
    id: '12',
    title: 'The Witcher',
    poster: 'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
    type: 'tv',
    category: 'dropped',
    score: 5
  }
];

export default function Home() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems(INITIAL_DATA);
      }
    } else {
      setItems(INITIAL_DATA);
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('watchlist', JSON.stringify(items));
    }
  }, [items]);

  const addItem = (item: Omit<WatchlistItem, 'id'>) => {
    const newItem: WatchlistItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<WatchlistItem>) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
    if (editingItem?.id === id) {
      setEditingItem({ ...editingItem, ...updates });
    }
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    setEditingItem(null);
  };

  const moveItem = (id: string, newCategory: CategoryType) => {
    updateItem(id, { category: newCategory });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `watchlist-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setItems(imported);
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onAddItem={addItem}
        onExport={exportData}
        onImport={importData}
      />

      <MainContent
        items={items}
        sidebarOpen={sidebarOpen}
        onMoveItem={moveItem}
        onEditItem={setEditingItem}
      />

      {editingItem && (
        <EditPanel
          item={editingItem}
          onUpdate={(updates) => updateItem(editingItem.id, updates)}
          onDelete={() => deleteItem(editingItem.id)}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
