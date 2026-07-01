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
    <div className="flex flex-col h-full bg-surface">
      <div className="px-8 py-6 border-b border-border bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Script Lab <span className="text-primary font-medium text-base ml-2">({projectTitle})</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Clean raw transcripts and identify interactive opportunities.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Upload Zone */}
        {!rawScript && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white border border-border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-accent hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Upload Media for Analysis</h2>
              <p className="text-sm text-muted-foreground mt-1">Drag and drop audio/video files, or click to browse.</p>
              <p className="text-xs text-slate-400 mt-2">Supports MP4, MP3, WAV, VTT, SRT (Max 500MB)</p>
            </div>
            <button className="px-6 py-2 bg-slate-900 text-white font-medium text-sm rounded-md hover:bg-slate-800 transition-colors mt-2 flex items-center gap-2">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isUploading ? "Processing..." : "Browse Files"}
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
            <div className="flex flex-col bg-white border border-border rounded-xl shadow-sm h-1/2 overflow-hidden">
              <div className="px-4 py-3 bg-surface-container-low border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-slate-500" />
                  Original Transcript
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-surface px-2 py-1 rounded text-slate-500 border border-border">03:45</span>
                  <button 
                    onClick={() => { setRawScript(""); setCleanScriptBlocks([]); setHighlightedText(null); }}
                    className="text-xs text-slate-500 hover:text-red-500"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea 
                className="p-5 overflow-y-auto text-sm text-slate-600 leading-relaxed font-mono bg-slate-50 resize-none w-full h-full focus:outline-none"
                value={rawScript}
                onChange={(e) => setRawScript(e.target.value)}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-center -my-6 z-10 relative">
              <button 
                onClick={handleCleanScript}
                disabled={isCleaning || rawScript.trim() === ""}
                className="bg-primary text-white rounded-full p-3 border-4 border-surface hover:bg-primary/90 transition-all shadow-md group disabled:opacity-70 disabled:cursor-not-allowed"
                title="Clean and Format Script"
              >
                {isCleaning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
              </button>
            </div>

            {/* Clean Script */}
            <div className="flex flex-col bg-white border border-accent/30 rounded-xl shadow-sm h-1/2 overflow-hidden relative">
              <div className="px-4 py-3 bg-accent/5 border-b border-accent/20 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-accent flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" />
                  Clean Script Output
                </h3>
                <button className="text-slate-400 hover:text-accent transition-colors p-1 rounded hover:bg-accent/10">
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto text-sm text-slate-800 leading-relaxed bg-white h-full relative">
                  {cleanScriptBlocks.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 italic">
                      Click the sparkle button to generate a clean script.
                    </div>
                  ) : (
                    <div className="space-y-4 pb-12">
                      {cleanScriptBlocks.map((block, idx) => (
                         <p 
                           key={idx}
                           className={cn(
                             "p-2 -ml-2 rounded-r border-l-4 cursor-pointer transition-colors",
                             highlightedText === idx 
                               ? "bg-accent/10 border-accent" 
                               : "border-transparent hover:bg-surface-container-low"
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
                  className="absolute bottom-4 right-4 bg-slate-900 text-white rounded-full p-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group px-4 animate-in fade-in duration-300"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copy Script</span>
                </button>
              )}
            </div>
          </div>

          {/* Interaction Suggester Column */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
              <div className="px-5 py-4 bg-surface-container-low border-b border-border">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Interaction Suggester
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Select a script block to see recommended interactive treatments.</p>
              </div>
              
              <div className="flex-1 p-5 overflow-y-auto bg-surface space-y-3">
                {isSuggesting && (
                  <div className="h-full flex flex-col items-center justify-center text-primary py-12">
                     <Loader2 className="w-8 h-8 mb-2 animate-spin opacity-80" />
                     <p className="text-sm font-medium animate-pulse">Generating interactive treatments...</p>
                  </div>
                )}

                {!isSuggesting && highlightedText !== null && suggestions.length > 0 && (
                  <>
                    {suggestions.map((suggestion, i) => {
                      let iconColor = "bg-blue-50 text-blue-600";
                      let Icon = MoveRight;
                      if (suggestion.type === 'drag-drop') {
                        iconColor = "bg-emerald-50 text-emerald-600";
                        Icon = MousePointerClick;
                      } else if (suggestion.type === 'quiz') {
                        iconColor = "bg-purple-50 text-purple-600";
                        Icon = List;
                      }
                      
                      return (
                        <div key={i} className="p-4 bg-white border border-border hover:border-accent rounded-lg cursor-pointer transition-colors shadow-sm group">
                          <div className="flex gap-3">
                            <div className={cn("p-2 rounded-md h-fit transition-colors", iconColor)}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">{suggestion.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {!isSuggesting && highlightedText !== null && suggestions.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 text-slate-400 py-12">
                    <p className="text-sm">No specific interaction ideas found for this block.</p>
                  </div>
                )}

                {!isSuggesting && highlightedText === null && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 text-slate-400 py-12">
                    <MousePointerClick className="w-8 h-8 mb-3 opacity-50" />
                    <p className="text-sm">Click on a paragraph in the Clean Script Output to generate interaction ideas.</p>
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
