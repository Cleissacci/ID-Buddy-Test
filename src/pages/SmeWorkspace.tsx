import { useState, useEffect } from 'react';
import { Sparkles, Replace, FileText, Info, Loader2 } from 'lucide-react';
import { cn } from '../components/Layout';

export default function SmeWorkspace() {
  const activeProjectId = localStorage.getItem('id_buddy_active_project_id') || 'default';
  const projectTitle = localStorage.getItem('id_buddy_active_project_title') || "Unnamed Project";

  const [activeTab, setActiveTab] = useState<'jargon' | 'analogy'>('jargon');
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [inputText, setInputText] = useState(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_sme_input`);
    return saved !== null ? saved : "The pedagogy relies on a heuristic evaluation of the user's cognitive load during the onboarding flow. We need to scaffold the learning experience to mitigate churn.";
  });

  const [apiResults, setApiResults] = useState<{
    jargonTerms: Array<{ term: string, alternatives: string[] }>,
    analogies: Array<{ title: string, text: string }>
  }>(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_sme_results`);
    return saved ? JSON.parse(saved) : { jargonTerms: [], analogies: [] };
  });

  const [hasProcessed, setHasProcessed] = useState(() => {
    return localStorage.getItem(`id_buddy_${activeProjectId}_sme_processed`) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_sme_input`, inputText);
  }, [inputText, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_sme_results`, JSON.stringify(apiResults));
  }, [apiResults, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_sme_processed`, String(hasProcessed));
  }, [hasProcessed, activeProjectId]);

  const handleProcessInput = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await fetch('/api/sme-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to process SME input');
      }
      
      const data = await response.json();
      setApiResults(data);
      setHasProcessed(true);
      setActiveTab('jargon');
    } catch (error) {
      setErrorMessage("Failed to process input. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReplace = (term: string, replacement: string) => {
    const regex = new RegExp(term, 'gi');
    const updatedText = inputText.replace(regex, replacement);
    setInputText(updatedText);
    
    // Remove the replaced term from jargon highlight list
    setApiResults(prev => ({
      ...prev,
      jargonTerms: prev.jargonTerms.filter(t => t.term.toLowerCase() !== term.toLowerCase())
    }));
  };

  // Helper to render text with highlighted jargon
  const renderHighlightedText = () => {
    let result = inputText;
    apiResults.jargonTerms.forEach(({ term }) => {
      // Very basic regex for demo purposes
      const regex = new RegExp(`(${term})`, 'gi');
      result = result.replace(regex, `|${term}|`);
    });

    const parts = result.split('|');
    return (
      <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs text-ink">
        {parts.map((part, i) => {
          const matchedTerm = apiResults.jargonTerms.find(t => t.term.toLowerCase() === part.toLowerCase());
          if (matchedTerm) {
            return (
              <span 
                key={i} 
                className={cn(
                  "relative inline-block border-b border-dashed border-ink bg-gray-50 text-ink font-mono px-1 rounded-sm cursor-help transition-colors",
                  hoveredTerm === matchedTerm.term && "bg-ink text-background"
                )}
                onMouseEnter={() => setHoveredTerm(matchedTerm.term)}
                onMouseLeave={() => setHoveredTerm(null)}
              >
                {part}
                {hoveredTerm === matchedTerm.term && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-ink text-background text-[10px] font-mono border border-gray-200 rounded shadow-bryl-modal z-10 flex flex-col gap-1">
                    <span className="font-semibold text-gray-400 uppercase tracking-widest">Alternatives:</span>
                    {matchedTerm.alternatives.map((alt, i) => (
                      <span key={i} className="flex items-center gap-1.5 lowercase">
                        <span>-</span>
                        {alt}
                      </span>
                    ))}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink"></span>
                  </span>
                )}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-500 text-ink">
      <div className="px-8 py-6 border-b border-gray-200 bg-background flex items-center justify-between shrink-0 transition-colors duration-500">
        <div>
          <span className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">
            01 — Workspace
          </span>
          <h1 className="text-2xl font-display font-bold text-ink lowercase tracking-tight mt-1">
            sme dump <span className="text-gray-400 font-mono text-xs ml-2">({projectTitle.toLowerCase()})</span>
          </h1>
          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-mono">Translate subject matter expert inputs into clear course topics.</p>
        </div>
        <button 
          onClick={handleProcessInput}
          disabled={isLoading || !inputText.trim()}
          className="flex items-center gap-2 px-3 py-2 bg-ink text-background rounded text-[10px] font-mono tracking-widest uppercase hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {isLoading ? "processing..." : "process input"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Input */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 bg-background p-6 transition-colors duration-500">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <h2 className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">raw input</h2>
          </div>
          <textarea 
            className="flex-1 w-full bg-gray-50 border border-gray-200 rounded p-4 text-xs font-sans focus:outline-none focus:border-ink resize-none leading-relaxed transition-colors duration-500"
            placeholder="Paste transcript, meeting notes, or raw whitepapers here..."
            value={inputText}
            onChange={(e) => {
                setInputText(e.target.value);
                setHasProcessed(false);
            }}
          />
        </div>

        {/* Right Column: Output Pane */}
        <div className="w-1/2 flex flex-col bg-background transition-colors duration-500">
          <div className="flex border-b border-gray-200 px-6 pt-2 shrink-0 bg-gray-50 transition-colors duration-500">
            <button 
              className={cn(
                "px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest border-b-2 transition-colors",
                activeTab === 'jargon' ? "border-ink text-ink font-bold" : "border-transparent text-gray-400 hover:text-ink"
              )}
              onClick={() => setActiveTab('jargon')}
            >
              jargon scrubber
            </button>
            <button 
              className={cn(
                "px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest border-b-2 transition-colors",
                activeTab === 'analogy' ? "border-ink text-ink font-bold" : "border-transparent text-gray-400 hover:text-ink"
              )}
              onClick={() => setActiveTab('analogy')}
            >
              analogy generator
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 relative">
            {!hasProcessed && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-background/80 backdrop-blur-[2px] z-10 transition-colors duration-500">
                 <Sparkles className="w-8 h-8 mb-3 opacity-40" />
                 <p className="text-[10px] font-mono uppercase tracking-widest">paste input and click process to begin.</p>
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-ink bg-background/80 backdrop-blur-[2px] z-10 transition-colors duration-500">
                 <Loader2 className="w-8 h-8 mb-3 animate-spin opacity-60" />
                 <p className="text-[10px] font-mono uppercase tracking-widest animate-pulse">analyzing pedagogical structures...</p>
              </div>
            )}

            {errorMessage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-ink bg-background/80 backdrop-blur-[2px] z-10 transition-colors duration-500">
                 <p className="text-[10px] font-mono uppercase tracking-widest border border-gray-200 px-4 py-2 bg-gray-50 rounded text-red-500">{errorMessage}</p>
              </div>
            )}

            {activeTab === 'jargon' && (
              <div className="space-y-6 max-w-2xl">
                <div className="p-4 border border-gray-200 rounded bg-gray-50 text-ink text-[11px] font-mono uppercase tracking-wider leading-relaxed">
                  pedagogy feedback — we found <strong className="text-ink font-bold">{apiResults.jargonTerms.length}</strong> complex terms. hover highlights to inspect alternatives.
                </div>
                
                <div className="bg-background p-6 rounded border border-gray-200 leading-relaxed font-sans text-xs shadow-bryl-resting">
                  {renderHighlightedText()}
                </div>

                <div className="space-y-2">
                  <h3 className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">detected terms</h3>
                  {apiResults.jargonTerms.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded border border-gray-200 bg-background hover:border-ink transition-colors group shadow-bryl-resting">
                      <span className="text-xs font-mono text-ink font-semibold">"{t.term.toLowerCase()}"</span>
                      <button 
                        onClick={() => handleQuickReplace(t.term, t.alternatives[0])}
                        className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded text-[9px] font-mono uppercase tracking-widest hover:bg-gray-50 bg-background"
                      >
                        <Replace className="w-3 h-3 text-gray-400" />
                        replace: "{t.alternatives[0].toLowerCase()}"
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analogy' && (
              <div className="space-y-6 max-w-2xl">
                <div className="p-4 border border-gray-200 rounded bg-gray-50 text-ink text-[11px] font-mono uppercase tracking-wider leading-relaxed">
                  creative pedagogy — here are {apiResults.analogies.length} analogies to simplify complex learning.
                </div>

                <div className="space-y-4">
                  {apiResults.analogies.map((analogy, i) => (
                    <div key={i} className="p-5 rounded border border-gray-200 bg-background shadow-bryl-resting hover:shadow-bryl-hover transition-all duration-350">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 block mb-1">analogy 0{i + 1}</span>
                      <h3 className="text-sm font-sans font-semibold text-ink mb-2">{analogy.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-sans">{analogy.text}</p>
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${analogy.title}\n${analogy.text}`);
                            alert('Copied analogy to clipboard!');
                          }}
                          className="px-3 py-1.5 border border-gray-200 rounded text-[10px] font-mono tracking-widest uppercase hover:bg-gray-50 bg-background transition-colors"
                        >
                          copy
                        </button>
                        <button 
                          onClick={() => alert(`Saved "${analogy.title}" to project resources!`)}
                          className="px-3 py-1.5 border border-gray-200 rounded text-[10px] font-mono tracking-widest uppercase hover:bg-gray-50 bg-background transition-colors"
                        >
                          save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
