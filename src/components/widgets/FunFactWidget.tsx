import React, { useState } from 'react';
import { Sparkles, Heart, Shuffle, Copy, Check, Lightbulb } from 'lucide-react';
import { FunFact } from '../../types';

interface FunFactWidgetProps {
  facts: FunFact[];
  currentIndex: number;
  onNextFact: () => Promise<void>;
  onLikeFact: (index: number) => Promise<void>;
}

export const FunFactWidget: React.FC<FunFactWidgetProps> = ({
  facts,
  currentIndex,
  onNextFact,
  onLikeFact
}) => {
  const [copied, setCopied] = useState(false);
  const activeFact = facts[currentIndex] || facts[0];

  const handleCopy = () => {
    if (!activeFact) return;
    navigator.clipboard.writeText(`${activeFact.fact} - Did you know? ${activeFact.didYouKnow}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-700/80 transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Curiosity & Fun Facts</h3>
              <p className="text-[11px] text-slate-400">Mind-expanding trivia across science & technology</p>
            </div>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-medium">
            {activeFact?.category || 'Curiosity'}
          </span>
        </div>

        {/* Fact Card */}
        {activeFact && (
          <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>

              <div>
                <p className="text-sm font-medium text-white leading-relaxed">
                  "{activeFact.fact}"
                </p>

                {activeFact.didYouKnow && (
                  <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-indigo-400 block mb-0.5 text-[11px] uppercase tracking-wider">
                      Did You Know?
                    </span>
                    {activeFact.didYouKnow}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLikeFact(currentIndex)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-rose-400 transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 ${activeFact?.isSaved ? 'text-rose-500 fill-current' : ''}`} />
            <span className="font-mono text-[11px]">{activeFact?.likes || 0}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition-colors"
            title="Copy fact to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <button
          onClick={onNextFact}
          className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium shadow-xs transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Next Fact
        </button>
      </div>
    </div>
  );
};
