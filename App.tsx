import React, { useState, useCallback } from 'react';
import { ExplanationResponse, ExplanationError } from './types';
import { generateTextExplanations, generateMeme, getMoviePoster } from './services/geminiService';
import Header from './components/Header';
import TopicInput from './components/TopicInput';
import ExplanationTabs from './components/ExplanationTabs';
import AdBanner from './components/AdBanner';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [explanationData, setExplanationData] = useState<ExplanationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for asynchronous image loading
  const [isMemeLoading, setIsMemeLoading] = useState<boolean>(false);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [isPosterLoading, setIsPosterLoading] = useState<boolean>(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExplanationData(null);
    setMemeUrl(null);
    setPosterUrl(null);

    try {
      // Step 1: Get text explanations first for a fast initial render
      const result = await generateTextExplanations(topic);
      
      if ('error' in result) {
        setError((result as ExplanationError).error);
        setIsLoading(false);
        return;
      }
      
      // Step 2: Set text data immediately, which hides the main spinner
      setExplanationData(result as ExplanationResponse);
      setIsLoading(false);
      
      // Step 3: Kick off image fetching in the background
      if (result.meme?.template_hint && result.meme.caption) {
        setIsMemeLoading(true);
        generateMeme(result.meme.template_hint, result.meme.caption)
          .then(url => setMemeUrl(url))
          .finally(() => setIsMemeLoading(false));
      }
      
      if (result.hollywood?.title_hint) {
        setIsPosterLoading(true);
        getMoviePoster(result.hollywood.title_hint)
          .then(url => setPosterUrl(url))
          .finally(() => setIsPosterLoading(false));
      }

    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred. Please check the console and ensure your API key is configured.');
      setIsLoading(false);
      setIsMemeLoading(false);
      setIsPosterLoading(false);
    }
  }, [topic]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <TopicInput
              topic={topic}
              setTopic={setTopic}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />

            <div className="mt-6 min-h-[400px] bg-slate-800/50 rounded-lg p-6 flex items-center justify-center">
              {isLoading && <LoadingSpinner />}
              {error && <ErrorMessage message={error} />}
              {explanationData && !isLoading && !error && (
                <ExplanationTabs
                  data={explanationData}
                  isMemeLoading={isMemeLoading}
                  memeUrl={memeUrl}
                  isPosterLoading={isPosterLoading}
                  posterUrl={posterUrl}
                />
              )}
              {!isLoading && !error && !explanationData && (
                <div className="text-center text-slate-400">
                  <p className="text-lg">Enter a programming concept above to get started.</p>
                  <p className="text-sm mt-2">e.g., "Recursion", "Promises", "CSS Flexbox"</p>
                </div>
              )}
            </div>
          </div>
          {/* <div className="lg:col-span-3">
            <AdBanner />
          </div> */}
        </main>
      </div>
    </div>
  );
};

export default App;