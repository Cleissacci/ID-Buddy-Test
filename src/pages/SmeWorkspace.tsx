import { useState } from 'react';
import { Sparkles, Replace, FileText, Info, Loader2 } from 'lucide-react';
import { cn } from '../components/Layout';

export default function SmeWorkspace() {
  const [activeTab, setActiveTab] = useState<'jargon' | 'analogy'>('jargon');
  const [inputText, setInputText] = useState("The pedagogy relies on a heuristic evaluation of the user's cognitive load during the onboarding flow. We need to scaffold the learning experience to mitigate churn.");
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [apiResults, setApiResults] = useState<{
    jargonTerms: Array<{ term: string, alternatives: string[] }>,
    analogies: Array<{ title: string, text: string }>
  }>({ jargonTerms: [], analogies: [] });

  const handleProcessInput = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      // Placeholder for real AI API call
      // const response = await fetch('YOUR_API_ENDPOINT', { ... })
      // const data = await response.json();

      // Simulate API call processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const data = {
        jargonTerms: [
          { term: "pedagogy", alternatives: ["teaching method", "instructional approach", "educational strategy"] },
          { term: "heuristic evaluation", alternatives: ["expert review", "usability check", "rule-of-thumb assessment"] },
          { term: "cognitive load", alternatives: ["mental effort", "brain power", "thinking required"] },
          { term: "scaffold", alternatives: ["support", "structure", "guide step-by-step"] },
          { term: "mitigate churn", alternatives: ["reduce drop-offs", "keep learners engaged", "prevent quitting"] }
        ],
        analogies: [
          { title: "The Foundation Analogy", text: "Think of 'scaffolding' like training wheels on a bicycle. You provide a lot of support at first, and gradually remove it as the learner gains confidence and balance." },
          { title: "The Backpack Analogy", text: "'Cognitive load' is like packing a backpack for a hike. If you put too many heavy rocks (complex concepts) in at once, the hiker (learner) will get exhausted and stop. We need to unpack the heavy rocks and hand them out one by one." },
          { title: "The Tour Guide Analogy", text: "A 'heuristic evaluation' is like having an experienced tour guide walk through your museum before it opens to the public, pointing out where visitors might get lost or confused based on their past experience." }
        ]
      };
      
      setApiResults(data);
      setHasProcessed(true);
      setActiveTab('jargon');
    } catch (error) {
      setErrorMessage("Failed to process input. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
      <div className="leading-relaxed whitespace-pre-wrap font-medium text-slate-700">
        {parts.map((part, i) => {
          const matchedTerm = apiResults.jargonTerms.find(t => t.term.toLowerCase() === part.toLowerCase());
          if (matchedTerm) {
            return (
              <span 
                key={i} 
                className={cn(
                  "relative inline-block bg-accent/15 text-accent font-semibold px-1.5 py-0.5 rounded cursor-help border border-accent/20 transition-colors",
                  hoveredTerm === matchedTerm.term && "bg-accent/30 border-accent/40"
                )}
                onMouseEnter={() => setHoveredTerm(matchedTerm.term)}
                onMouseLeave={() => setHoveredTerm(null)}
              >
                {part}
                {hoveredTerm === matchedTerm.term && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-10 flex flex-col gap-1">
                    <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Alternatives:</span>
                    {matchedTerm.alternatives.map((alt, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-accent"></span>
                        {alt}
                      </span>
                    ))}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
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
    <div className="flex flex-col h-full">
      <div className="px-8 py-6 border-b border-border bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">SME Brain Dump Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">Translate dense subject matter expert transcripts into clear instructional content.</p>
        </div>
        <button 
          onClick={handleProcessInput}
          disabled={isLoading || !inputText.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isLoading ? "Processing..." : "Process Input"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Input */}
        <div className="w-1/2 flex flex-col border-r border-border bg-surface-container-low p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Raw SME Input</h2>
          </div>
          <textarea 
            className="flex-1 w-full bg-white border border-border rounded-xl p-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm leading-relaxed"
            placeholder="Paste transcript, meeting notes, or raw whitepapers here..."
            value={inputText}
            onChange={(e) => {
                setInputText(e.target.value);
                setHasProcessed(false);
            }}
          />
        </div>

        {/* Right Column: Output Pane */}
        <div className="w-1/2 flex flex-col bg-white">
          <div className="flex border-b border-border px-6 pt-2 shrink-0 bg-surface">
            <button 
              className={cn(
                "px-6 py-3 text-sm font-semibold border-b-2 transition-colors",
                activeTab === 'jargon' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"
              )}
              onClick={() => setActiveTab('jargon')}
            >
              Jargon Scrubber
            </button>
            <button 
              className={cn(
                "px-6 py-3 text-sm font-semibold border-b-2 transition-colors",
                activeTab === 'analogy' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"
              )}
              onClick={() => setActiveTab('analogy')}
            >
              Analogy Generator
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 relative">
            {!hasProcessed && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white/80 backdrop-blur-[2px] z-10">
                 <Sparkles className="w-10 h-10 mb-4 opacity-50" />
                 <p>Paste your content and click "Process Input" to begin.</p>
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-primary bg-white/80 backdrop-blur-[2px] z-10">
                 <Loader2 className="w-10 h-10 mb-4 animate-spin opacity-80" />
                 <p className="font-medium animate-pulse">Analyzing pedagogical structures...</p>
              </div>
            )}

            {errorMessage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-white/80 backdrop-blur-[2px] z-10">
                 <p className="font-medium">{errorMessage}</p>
              </div>
            )}

            {activeTab === 'jargon' && (
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-900 text-sm">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p>We found <strong>{apiResults.jargonTerms.length}</strong> complex terms in your input. Hover over the highlighted terms below to see plain-language alternatives.</p>
                </div>
                
                <div className="bg-surface p-6 rounded-xl border border-border">
                  {renderHighlightedText()}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Detected Terms</h3>
                  {apiResults.jargonTerms.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:border-accent transition-colors group cursor-pointer">
                      <span className="font-medium text-slate-800">"{t.term}"</span>
                      <button className="flex items-center gap-1.5 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        <Replace className="w-3.5 h-3.5" />
                        Quick Replace
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analogy' && (
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-100 rounded-lg text-purple-900 text-sm">
                  <Sparkles className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                  <p>Here are {apiResults.analogies.length} everyday analogies generated to help explain the complex concepts in your text.</p>
                </div>

                <div className="space-y-4">
                  {apiResults.analogies.map((analogy, i) => (
                    <div key={i} className="p-5 rounded-xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-base font-semibold text-slate-900 mb-2">{analogy.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{analogy.text}</p>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1.5 bg-surface text-slate-700 text-xs font-medium rounded-md border border-border hover:bg-surface-container-highest transition-colors">
                          Copy Analogy
                        </button>
                        <button className="px-3 py-1.5 bg-surface text-slate-700 text-xs font-medium rounded-md border border-border hover:bg-surface-container-highest transition-colors">
                          Save to Project
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
