import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileAudio, Settings2, Copy, Sparkles, MoveRight, List, MousePointerClick, AlignLeft, Loader2 } from 'lucide-react';
import { cn } from '../components/Layout';

export default function ScriptLab() {
  const activeProjectId = localStorage.getItem('id_buddy_active_project_id') || 'default';
  const projectTitle = localStorage.getItem('id_buddy_active_project_title') || "Unnamed Project";

  const [isCleaning, setIsCleaning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [highlightedText, setHighlightedText] = useState<number | null>(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_sl_highlighted`);
    return saved !== null ? Number(saved) : null;
  });

  const [rawScript, setRawScript] = useState(() => {
    return localStorage.getItem(`id_buddy_${activeProjectId}_sl_raw_script`) || "";
  });

  const [cleanScriptBlocks, setCleanScriptBlocks] = useState<string[]>(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_sl_clean_blocks`);
    return saved ? JSON.parse(saved) : [];
  });

  const [suggestions, setSuggestions] = useState<Array<{ type: 'timeline' | 'drag-drop' | 'quiz', title: string, description: string }>>(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_sl_suggestions`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_sl_raw_script`, rawScript);
  }, [rawScript, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_sl_clean_blocks`, JSON.stringify(cleanScriptBlocks));
  }, [cleanScriptBlocks, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_sl_suggestions`, JSON.stringify(suggestions));
  }, [suggestions, activeProjectId]);

  useEffect(() => {
    if (highlightedText !== null) {
      localStorage.setItem(`id_buddy_${activeProjectId}_sl_highlighted`, String(highlightedText));
    } else {
      localStorage.removeItem(`id_buddy_${activeProjectId}_sl_highlighted`);
    }
  }, [highlightedText, activeProjectId]);

  const sampleRawText = "[00:00:00] Speaker 1: Uh, yeah, so today we're gonna talk about, you know, the main principles of adult learning theory. Basically, it's like, adults learn differently than kids do.\n\n[00:00:15] Speaker 1: They need relevance. And, um, they want to apply things immediately to their jobs. So, like, Malcolm Knowles talked about this stuff.";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('mediaFile', file);
      
      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to transcribe media');
        }
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await response.json();
          setRawScript(data.transcript || 'No transcript generated.');
          setCleanScriptBlocks([]);
        } else {
          throw new Error('Received unexpected response from server. Please wait and try again.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('An error occurred during transcription. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCleanScript = async () => {
    if (!rawScript.trim()) return;
    setIsCleaning(true);
    
    try {
      const response = await fetch('/api/clean-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: rawScript }),
      });

      if (!response.ok) {
        throw new Error('Failed to clean script');
      }

      const data = await response.json();
      setCleanScriptBlocks(data.cleanedBlocks || []);
      setHighlightedText(null);
      setSuggestions([]);
    } catch (error) {
      alert('Failed to clean script. Please try again.');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleSelectBlock = async (idx: number, blockText: string) => {
    if (highlightedText === idx) {
      setHighlightedText(null);
      setSuggestions([]);
      return;
    }
    
    setHighlightedText(idx);
    setIsSuggesting(true);
    setSuggestions([]);
    
    try {
      const response = await fetch('/api/suggest-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockText }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Interaction suggestions error:', error);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-500 text-ink">
      <div className="px-8 py-6 border-b border-gray-200 bg-background flex items-center justify-between shrink-0 transition-colors duration-500">
        <div>
          <span className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">
            01 — Workspace
          </span>
          <h1 className="text-2xl font-display font-bold text-ink lowercase tracking-tight mt-1">
            script lab <span className="text-gray-400 font-mono text-xs ml-2">({projectTitle.toLowerCase()})</span>
          </h1>
          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-mono">Clean raw transcripts and identify interactive opportunities.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Upload Zone */}
        {!rawScript && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-background border border-dashed border-gray-300 rounded p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-ink hover:bg-gray-50/50 transition-colors cursor-pointer shadow-bryl-resting"
          >
            <div className="p-3 border border-gray-200 rounded bg-gray-50 text-ink">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-sans font-semibold text-ink">Upload Media for Analysis</h2>
              <p className="text-xs text-gray-500 mt-1 font-sans">Drag and drop audio/video files, or click to browse.</p>
              <p className="text-[10px] text-gray-400 font-mono uppercase mt-2">Supports MP4, MP3, WAV, VTT, SRT (Max 500MB)</p>
            </div>
            <button className="px-4 py-2 bg-ink text-background text-[10px] font-mono tracking-widest uppercase hover:bg-ink/90 transition-colors mt-2 flex items-center gap-2">
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {isUploading ? "processing..." : "browse files"}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".mp4,.mp3,.wav,.vtt,.srt" 
              onChange={handleFileUpload}
            />
          </div>
        )}

        {rawScript && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[550px]">
          
          {/* Script Processing Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Raw Transcript */}
            <div className="flex flex-col bg-background border border-gray-200 rounded shadow-bryl-resting h-1/2 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">
                <h3 className="flex items-center gap-1.5">
                  <FileAudio className="w-3.5 h-3.5 text-gray-400" />
                  original transcript
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono border border-gray-200 px-1.5 py-0.5 rounded bg-background text-gray-500">03:45</span>
                  <button 
                    onClick={() => { setRawScript(""); setCleanScriptBlocks([]); setHighlightedText(null); }}
                    className="text-[9px] font-mono uppercase tracking-widest text-ink hover:underline"
                  >
                    clear
                  </button>
                </div>
              </div>
              <textarea 
                className="p-4 overflow-y-auto text-xs text-ink leading-relaxed font-mono bg-gray-50 border-none resize-none w-full h-full focus:outline-none"
                value={rawScript}
                onChange={(e) => setRawScript(e.target.value)}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-center -my-6 z-10 relative">
              <button 
                onClick={handleCleanScript}
                disabled={isCleaning || rawScript.trim() === ""}
                className="bg-ink text-background rounded-full p-3 border-4 border-background hover:bg-ink/90 transition-all shadow-bryl-resting group disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clean and Format Script"
              >
                {isCleaning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </button>
            </div>

            {/* Clean Script */}
            <div className="flex flex-col bg-background border border-gray-200 rounded shadow-bryl-resting h-1/2 overflow-hidden relative">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">
                <h3 className="flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5" />
                  clean script output
                </h3>
                <button className="text-gray-400 hover:text-ink transition-colors p-1">
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto text-xs text-ink leading-relaxed bg-background h-full relative font-sans">
                  {cleanScriptBlocks.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">
                      Click the sparkle button to generate a clean script.
                    </div>
                  ) : (
                    <div className="space-y-3 pb-12">
                      {cleanScriptBlocks.map((block, idx) => (
                         <p 
                           key={idx}
                           className={cn(
                             "p-2 -ml-2 rounded border-l-2 cursor-pointer transition-all duration-200",
                             highlightedText === idx 
                               ? "bg-gray-50 border-ink font-semibold text-ink" 
                               : "border-transparent text-gray-500 hover:bg-gray-50/50"
                           )}
                           onClick={() => handleSelectBlock(idx, block)}
                         >
                           {block}
                         </p>
                      ))}
                    </div>
                  )}
              </div>

              {/* Copy FAB */}
              {cleanScriptBlocks.length > 0 && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(cleanScriptBlocks.join('\n\n'));
                    alert('Copied full script to clipboard!');
                  }}
                  className="absolute bottom-4 right-4 bg-ink text-background rounded border border-gray-200 text-[10px] font-mono tracking-widest uppercase py-2 px-4 shadow-bryl-resting hover:shadow-bryl-hover hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>copy script</span>
                </button>
              )}
            </div>
          </div>

          {/* Interaction Suggester Column */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-background border border-gray-200 rounded shadow-bryl-resting flex flex-col h-full overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex flex-col gap-1">
                <h3 className="text-xs font-mono uppercase tracking-widest text-ink font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  interaction suggestions
                </h3>
                <p className="text-[10px] text-gray-500 font-sans leading-normal">Select a script block to see recommended interactive treatments.</p>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto bg-background space-y-3">
                {isSuggesting && (
                  <div className="h-full flex flex-col items-center justify-center text-ink py-12">
                     <Loader2 className="w-6 h-6 mb-2 animate-spin opacity-60" />
                     <p className="text-[10px] font-mono uppercase tracking-widest animate-pulse">generating interactive treatments...</p>
                  </div>
                )}

                {!isSuggesting && highlightedText !== null && suggestions.length > 0 && (
                  <>
                    {suggestions.map((suggestion, i) => {
                      let Icon = MoveRight;
                      if (suggestion.type === 'drag-drop') {
                        Icon = MousePointerClick;
                      } else if (suggestion.type === 'quiz') {
                        Icon = List;
                      }
                      
                      return (
                        <div key={i} className="p-4 bg-background border border-gray-200 hover:border-ink rounded cursor-pointer transition-colors shadow-bryl-resting flex gap-3 group">
                          <div className="p-2 border border-gray-200 rounded bg-gray-50 text-ink h-fit">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 block mb-1">treatment 0{i + 1} ({suggestion.type})</span>
                            <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold group-hover:underline">{suggestion.title.toLowerCase()}</h4>
                            <p className="text-[11px] text-gray-500 mt-1 font-sans leading-normal">{suggestion.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {!isSuggesting && highlightedText !== null && suggestions.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 text-gray-400 py-12">
                    <p className="text-xs font-mono uppercase tracking-widest">no interaction ideas found for this block.</p>
                  </div>
                )}

                {!isSuggesting && highlightedText === null && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 text-gray-400 py-12">
                    <MousePointerClick className="w-6 h-6 mb-2 opacity-40" />
                    <p className="text-xs font-mono uppercase tracking-widest">click a clean script paragraph to inspect treatments.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
        )}
      </div>
    </div>
  );
}
