'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { CategoryType, MediaType, WatchlistItem } from '../page';

interface MainContentProps {
  items: WatchlistItem[];
  sidebarOpen: boolean;
  onMoveItem: (id: string, newCategory: CategoryType) => void;
  onEditItem: (item: WatchlistItem) => void;
}

type FilterType = 'all' | 'movie' | 'tv';

const CATEGORIES: { id: CategoryType; title: string }[] = [
  { id: 'watching', title: 'Currently Watching' },
  { id: 'planning', title: 'Planning to Watch' },
  { id: 'watched', title: 'Watched' },
  { id: 'dropped', title: 'Dropped' }
];

export default function MainContent({ items, sidebarOpen, onMoveItem, onEditItem }: MainContentProps) {
  const [filters, setFilters] = useState<Record<CategoryType, FilterType>>({
    watching: 'all',
    planning: 'all',
    watched: 'all',
    dropped: 'all'
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newCategory = destination.droppableId as CategoryType;

    onMoveItem(draggableId, newCategory);
  };

  const getFilteredItems = (category: CategoryType) => {
    const categoryItems = items.filter(item => item.category === category);
    const filter = filters[category];

    if (filter === 'all') return categoryItems;
    return categoryItems.filter(item => item.type === filter);
  };

  return (
    <div
      className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? 'ml-80' : 'ml-0'
      }`}
    >
      <div className="p-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 gap-6">
            {CATEGORIES.map((category) => {
              const categoryItems = getFilteredItems(category.id);

              return (
                <div key={category.id} className="glass-dark rounded-xl p-6 fade-in">
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{category.title}</h2>
                    <div className="flex gap-1 text-xs">
                      {(['all', 'movie', 'tv'] as FilterType[]).map((filterType) => (
                        <button
                          key={filterType}
                          onClick={() =>
                            setFilters({ ...filters, [category.id]: filterType })
                          }
                          className={`px-3 py-1 rounded capitalize ${
                            filters[category.id] === filterType
                              ? 'bg-white/20'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          {filterType === 'all' ? 'All' : filterType === 'movie' ? 'Movies' : 'TV'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Items Grid */}
                  <Droppable droppableId={category.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`grid grid-cols-4 gap-4 min-h-[200px] p-2 rounded-lg transition-colors ${
                          snapshot.isDraggingOver ? 'bg-white/5' : ''
                        }`}
                      >
                        {categoryItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`group transition-smooth ${
                                  snapshot.isDragging ? 'opacity-50 scale-105' : ''
                                }`}
                              >
                                <div className="glass rounded-lg overflow-hidden hover:scale-105 transition-smooth cursor-pointer">
                                  <div
                                    className="relative aspect-[2/3]"
                                    onClick={() => onEditItem(item)}
                                  >
                                    <img
                                      src={item.poster}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                    {item.score && (
                                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-sm font-bold">
                                        {item.score}/10
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                                      <div className="p-3 w-full">
                                        <div className="text-sm font-medium line-clamp-2">
                                          {item.title}
                                        </div>
                                        {item.notes && (
                                          <div className="text-xs text-white/60 line-clamp-1 mt-1">
                                            {item.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {categoryItems.length === 0 && (
                          <div className="col-span-4 text-center text-white/30 py-12">
                            No items
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
