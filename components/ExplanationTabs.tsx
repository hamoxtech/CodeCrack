import React, { useState } from 'react';
import { ExplanationResponse } from '../types';
import CodeBlock from './CodeBlock';

interface ExplanationTabsProps {
  data: ExplanationResponse;
  isMemeLoading: boolean;
  memeUrl: string | null;
  isPosterLoading: boolean;
  posterUrl: string | null;
}

type Tab = 'Hollywood' | 'Meme' | 'Anime/Cartoon' | 'Sports' | 'Serious';

const TABS: Tab[] = ['Hollywood', 'Meme', 'Anime/Cartoon', 'Sports', 'Serious'];

const FallbackMessage: React.FC<{ type: string }> = ({ type }) => (
    <div className="flex flex-col items-center justify-center text-center text-slate-400 p-8 bg-slate-800/50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-semibold">No {type} Explanation Available</p>
        <p className="mt-1 text-sm">The AI couldn't generate a suitable {type.toLowerCase()} analogy for this topic.</p>
    </div>
);

const ImageLoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);


const ExplanationTabs: React.FC<ExplanationTabsProps> = ({ 
    data, isMemeLoading, memeUrl, isPosterLoading, posterUrl 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('Hollywood');

  const renderContent = () => {
    switch (activeTab) {
      case 'Meme':
        if (!data.meme?.caption) return <FallbackMessage type="Meme" />;
        return (
          <div className="text-center">
            <div className="max-w-md w-full mx-auto rounded-lg shadow-lg mb-4 bg-slate-700/50 min-h-[250px] flex items-center justify-center overflow-hidden">
              {isMemeLoading && <ImageLoadingSpinner />}
              {!isMemeLoading && memeUrl && (
                 <img src={memeUrl} alt={data.meme.template_hint || 'Meme'} className="w-full h-auto object-contain" />
              )}
              {!isMemeLoading && !memeUrl && (
                <div className="text-slate-400 p-4">Meme image could not be loaded.</div>
              )}
            </div>
            <p className="text-xl font-semibold text-sky-300">{data.meme.caption}</p>
            {data.meme.template_hint && <p className="text-sm text-slate-400 mt-1">(Template: {data.meme.template_hint})</p>}
          </div>
        );
      case 'Hollywood':
  if (!data.hollywood?.analogy) return <FallbackMessage type="Hollywood" />;
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-800/50 rounded-lg p-4">
       <div className="w-48 h-72 rounded-lg shadow-lg bg-slate-700/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
          {isPosterLoading && <ImageLoadingSpinner />}
          {!isPosterLoading && posterUrl && (
              <img src={posterUrl} alt={data.hollywood.title_hint || 'Movie Poster'} className="w-full h-full object-cover" />
          )}
          {!isPosterLoading && !posterUrl && (
              <div className="text-slate-400 text-center p-2 text-sm">Poster not found.</div>
          )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-sky-300 mb-2">Analogy from: {data.hollywood.title_hint || 'a movie'}</h3>
        <p className="text-lg text-slate-200 leading-relaxed">{data.hollywood.analogy}</p>
      </div>
    </div>
  );
      case 'Anime/Cartoon':
        if (!data.anime?.analogy) return <FallbackMessage type="Anime/Cartoon" />;
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-sky-300 mb-2">Anime/Cartoon Analogy</h3>
            <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">{data.anime.analogy}</p>
          </div>
        );
      case 'Sports':
         if (!data.sports?.analogy) return <FallbackMessage type="Sports" />;
         return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-sky-300 mb-2">Sports Analogy</h3>
            <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">{data.sports.analogy}</p>
          </div>
        );
      case 'Serious':
        if (!data.serious?.definition) return <FallbackMessage type="Serious" />;
        return (
          <div className="text-left space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-sky-300 border-b-2 border-sky-800 pb-2 mb-2">Definition</h3>
              <p className="text-slate-200">{data.serious.definition}</p>
            </div>
            {data.serious.code_example && (
                <div>
                    <h3 className="text-xl font-semibold text-sky-300 border-b-2 border-sky-800 pb-2 mb-2">Code Example</h3>
                    <CodeBlock code={data.serious.code_example} />
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                { (data.serious.common_pitfalls && data.serious.common_pitfalls.length > 0) &&
                    <div>
                        <h3 className="text-xl font-semibold text-amber-300 border-b-2 border-amber-800 pb-2 mb-2">Common Pitfalls</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-200">
                            {data.serious.common_pitfalls.map((pitfall, i) => <li key={i}>{pitfall}</li>)}
                        </ul>
                    </div>
                }
                { (data.serious.best_practices && data.serious.best_practices.length > 0) &&
                    <div>
                        <h3 className="text-xl font-semibold text-emerald-300 border-b-2 border-emerald-800 pb-2 mb-2">Best Practices</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-200">
                            {data.serious.best_practices.map((practice, i) => <li key={i}>{practice}</li>)}
                        </ul>
                    </div>
                }
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap border-b border-slate-700 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold text-sm sm:text-base transition-colors duration-200 focus:outline-none ${
              activeTab === tab
                ? 'border-b-2 border-sky-500 text-sky-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4 animate-fade-in">{renderContent()}</div>
    </div>
  );
};

export default ExplanationTabs;