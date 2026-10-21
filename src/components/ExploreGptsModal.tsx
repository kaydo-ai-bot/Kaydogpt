import React, { useState } from 'react';
import {
  X,
  Compass,
  Search,
  Plus,
  Sparkles,
  Bot,
  Palette,
  Code,
  PenTool,
  Languages,
  Sigma,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { CUSTOM_GPTS } from '../data/customGpts';
import { CustomGPT } from '../types';

interface ExploreGptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGpt: (gpt: CustomGPT) => void;
}

export const ExploreGptsModal: React.FC<ExploreGptsModalProps> = ({
  isOpen,
  onClose,
  onSelectGpt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Featured', 'Writing', 'Coding', 'Education', 'Productivity'];

  const filteredGpts = CUSTOM_GPTS.filter((gpt) => {
    const matchesCategory =
      selectedCategory === 'All' || gpt.category === selectedCategory;
    const matchesSearch =
      gpt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gpt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getGptIcon = (iconName: string) => {
    switch (iconName) {
      case 'palette':
        return <Palette size={18} />;
      case 'code':
        return <Code size={18} />;
      case 'pen-tool':
        return <PenTool size={18} />;
      case 'languages':
        return <Languages size={18} />;
      case 'sigma':
        return <Sigma size={18} />;
      case 'bar-chart-3':
        return <BarChart3 size={18} />;
      default:
        return <Bot size={18} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in zoom-in-95 duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#383838] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#333]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Compass size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                Explorer les GPTs
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Découvrez des versions personnalisées de Kaydo GPT adaptées à des besoins précis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Category Tabs */}
        <div className="my-4 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des GPTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-100 dark:bg-[#2c2c2c] border border-transparent focus:border-purple-500 rounded-xl text-gray-900 dark:text-gray-100 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-[#2c2c2c] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333]'
                }`}
              >
                {cat === 'All' ? 'Tous' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* GPTs Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#333]">
          {filteredGpts.map((gpt) => (
            <button
              key={gpt.id}
              onClick={() => {
                onSelectGpt(gpt);
                onClose();
              }}
              className="p-4 rounded-2xl bg-gray-50 dark:bg-[#282828] border border-gray-200/80 dark:border-[#383838] hover:bg-white dark:hover:bg-[#303030] hover:border-purple-400/50 dark:hover:border-purple-500/50 transition-all text-left group flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${gpt.avatarBg} text-white flex items-center justify-center shrink-0 shadow-xs`}
                >
                  {getGptIcon(gpt.avatarIcon)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                      {gpt.name}
                    </h4>
                  </div>
                  <span className="text-[10px] text-gray-400">Par {gpt.author}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {gpt.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-200/60 dark:border-[#383838] flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                <span>Démarrer la discussion</span>
                <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
