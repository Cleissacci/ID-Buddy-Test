import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Settings2, Copy, Sparkles, MoveRight, List, MousePointerClick, AlignLeft, Loader2 } from 'lucide-react';
import { cn } from '../components/Layout';

export default function ScriptLab() {
  const [highlightedText, setHighlightedText] = useState<number | null>(null);
  const [rawScript, setRawScript] = useState("");
  const [cleanScriptBlocks, setCleanScriptBlocks] = useState<string[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCleanScript = () => {
    if (!rawScript.trim()) return;
    setIsCleaning(true);
    
    // Simulate AI cleaning delay
    setTimeout(() => {
      // Basic logic to strip timestamps like [00:00:00] and Speaker tags like "Speaker 1:"
      // Also removes filler words like "Uh,", "um," "like," 
      let cleaned = rawScript
        .replace(/\[\d{2}:\d{2}:\d{2}\]\s*/g, '') // Remove timestamps
        .replace(/Speaker \d+:\s*/g, '') // Remove speaker tags
        .replace(/\b(Uh|um|like|you know)\b,?\s*/gi, '') // Remove fillers
        .trim();
        
      // In a real app this would be more sophisticated (e.g., via LLM to rewrite cleanly)
      // For the prototype we'll split into paragraphs and slightly refine
      const blocks = cleaned.split('\n\n').filter(Boolean);
      
      // Override with the requested clean text for better demo visuals if the sample was used
      if (rawScript === sampleRawText) {
         setCleanScriptBlocks([
           "Today, we will discuss the foundational principles of Adult Learning Theory. Adults learn differently than children; they require immediate relevance and practical application to their professional roles.",
           "Renowned educator Malcolm Knowles pioneered this concept, identifying key assumptions about adult learners, such as their need for self-direction and immediate applicability."
         ]);
      } else {
         setCleanScriptBlocks(blocks);
      }
      
      setIsCleaning(false);
      setHighlightedText(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="px-8 py-6 border-b border-border bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Media & Scripting Laboratory</h1>
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
                          onClick={() => setHighlightedText(highlightedText === idx ? null : idx)}
                        >
                          {block}
                        </p>
                     ))}
                   </div>
                 )}
              </div>

              {/* Copy FAB */}
              {cleanScriptBlocks.length > 0 && (
                <button className="absolute bottom-4 right-4 bg-slate-900 text-white rounded-full p-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group px-4">
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
                {highlightedText !== null ? (
                  <>
                    <div className="p-4 bg-white border border-border hover:border-accent rounded-lg cursor-pointer transition-colors shadow-sm group">
                      <div className="flex gap-3">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-md h-fit group-hover:bg-blue-100 transition-colors">
                          <MoveRight className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">Interactive Timeline</h4>
                          <p className="text-xs text-muted-foreground mt-1">Visualize the evolution of adult learning theories over time based on Knowles' work.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white border border-border hover:border-accent rounded-lg cursor-pointer transition-colors shadow-sm group">
                      <div className="flex gap-3">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-md h-fit group-hover:bg-emerald-100 transition-colors">
                          <MousePointerClick className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">Drag-and-Drop Matching</h4>
                          <p className="text-xs text-muted-foreground mt-1">Match Knowles' 5 assumptions to practical workplace scenarios.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-border hover:border-accent rounded-lg cursor-pointer transition-colors shadow-sm group opacity-70">
                      <div className="flex gap-3">
                        <div className="bg-purple-50 text-purple-600 p-2 rounded-md h-fit group-hover:bg-purple-100 transition-colors">
                          <List className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">Knowledge Check</h4>
                          <p className="text-xs text-muted-foreground mt-1">Standard multiple choice assessing the need for self-direction.</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 text-slate-400">
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
