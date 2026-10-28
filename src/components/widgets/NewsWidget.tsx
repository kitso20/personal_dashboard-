import React, { useState } from 'react';
import { Newspaper, Send, ExternalLink, Plus, Sparkles, Tag } from 'lucide-react';
import { NewsArticle } from '../../types';

interface NewsWidgetProps {
  articles: NewsArticle[];
  selectedTopic: string;
  customKeywords: string[];
  userEmail: string;
  onSelectTopic: (topic: string) => Promise<void>;
  onAddKeyword: (keyword: string) => Promise<void>;
  onSendNewsDigest: (topic: string) => Promise<void>;
}

export const NewsWidget: React.FC<NewsWidgetProps> = ({
  articles,
  selectedTopic,
  customKeywords,
  userEmail,
  onSelectTopic,
  onAddKeyword,
  onSendNewsDigest
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);
  const [isSendingDigest, setIsSendingDigest] = useState(false);

  const defaultTopics = ['All', 'AI & Tech', 'Python & Dev', 'Science & Space', 'Markets', 'Cybersecurity'];
  const allTopics = [...defaultTopics, ...customKeywords.filter((k) => !defaultTopics.includes(k))];

  const filteredArticles = articles.filter((a) => {
    if (selectedTopic === 'All') return true;
    return a.topic.toLowerCase().includes(selectedTopic.toLowerCase()) ||
           selectedTopic.toLowerCase().includes(a.topic.toLowerCase());
  });

  const handleAddKeywordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    await onAddKeyword(newKeyword.trim());
    setNewKeyword('');
    setIsAddingKeyword(false);
  };

  const handleSendDigest = async () => {
    setIsSendingDigest(true);
    try {
      await onSendNewsDigest(selectedTopic);
    } finally {
      setIsSendingDigest(false);
    }
  };

  return (
    <div className="h-full bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-700/80 transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Topics You Like</h3>
              <p className="text-[11px] text-slate-400">Curated intelligence feed on your favorite subjects</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingKeyword(!isAddingKeyword)}
            className="flex items-center gap-1 px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 text-xs transition-colors"
            title="Track a new custom topic"
          >
            <Plus className="w-3 h-3" />
            <span className="text-[11px]">Topic</span>
          </button>
        </div>

        {/* Add Custom Keyword Drawer */}
        {isAddingKeyword && (
          <form onSubmit={handleAddKeywordSubmit} className="mt-3 p-3 bg-slate-950 border border-indigo-500/40 rounded-lg space-y-2">
            <div className="text-xs font-semibold text-white">Follow a Custom Topic</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Quantum Computing, Rust, Deep Learning"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium"
              >
                Follow
              </button>
            </div>
          </form>
        )}

        {/* Topic Selector Tabs */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar">
          {allTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => onSelectTopic(topic)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-all border ${
                selectedTopic === topic
                  ? 'bg-slate-800 border-indigo-500/50 text-white font-medium shadow-xs'
                  : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Articles List */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
          {filteredArticles.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/40">
              No recent stories matching "{selectedTopic}". Click "Topic" to track this keyword.
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-semibold text-indigo-400">{article.topic}</span>
                  <div className="flex items-center gap-2">
                    <span>{article.source}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.timeAgo}</span>
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                  {article.title}
                </h4>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{article.readTime}</span>
                  <span className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-300">
                    Read story <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={handleSendDigest}
          disabled={isSendingDigest}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          {isSendingDigest ? 'Sending...' : `Email ${selectedTopic} Digest`}
        </button>

        <span className="text-[11px] text-slate-500">
          Curated for {userEmail}
        </span>
      </div>
    </div>
  );
};
