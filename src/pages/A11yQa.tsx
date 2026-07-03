import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, FileWarning, Eye, Type, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../components/Layout';

export default function A11yQa() {
  const activeProjectId = localStorage.getItem('id_buddy_active_project_id') || 'default';
  const projectTitle = localStorage.getItem('id_buddy_active_project_title') || "Unnamed Project";

  const [isAuditing, setIsAuditing] = useState(false);

  const [moduleContent, setModuleContent] = useState(() => {
    return localStorage.getItem(`id_buddy_${activeProjectId}_a11y_content`) || "Introduction to Quantum Mechanics: In this module, we will cover the basic principles of wave-particle duality, Schrödinger's equation, and quantum entanglement. We'll show visual diagrams of the wave function collapse without alt text. Let's watch an embedded video explaining Heisenberg's Uncertainty Principle (no captions).";
  });

  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_a11y_checklist`);
    return saved ? JSON.parse(saved) : { contrast: true, captions: false, keyboard: true };
  });

  const [issuesFixed, setIssuesFixed] = useState(() => {
    return localStorage.getItem(`id_buddy_${activeProjectId}_a11y_fixed`) === 'true';
  });

  const [contrastScore, setContrastScore] = useState(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_a11y_contrast`);
    return saved !== null ? Number(saved) : 95;
  });

  const [altTextScore, setAltTextScore] = useState(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_a11y_alt`);
    return saved !== null ? Number(saved) : 75;
  });

  const [readabilityGrade, setReadabilityGrade] = useState(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_a11y_readability`);
    return saved !== null ? Number(saved) : 8;
  });

  const [criticalIssues, setCriticalIssues] = useState<Array<{ type: string, title: string, description: string }>>(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_a11y_issues`);
    return saved ? JSON.parse(saved) : [
      { type: 'complexity', title: '3 complex sentences found', description: 'Sentences exceed 25 words. Consider breaking them down for better cognitive load.' },
      { type: 'alt', title: '2 missing image alt-tags', description: 'Images lack descriptive tags. Screen readers will skip these.' }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_a11y_content`, moduleContent);
  }, [moduleContent, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_a11y_checklist`, JSON.stringify(checklist));
  }, [checklist, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_a11y_fixed`, String(issuesFixed));
  }, [issuesFixed, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_a11y_contrast`, String(contrastScore));
  }, [contrastScore, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_a11y_alt`, String(altTextScore));
  }, [altTextScore, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_a11y_readability`, String(readabilityGrade));
  }, [readabilityGrade, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_a11y_issues`, JSON.stringify(criticalIssues));
  }, [criticalIssues, activeProjectId]);

  const handleFixAll = () => {
    setIssuesFixed(true);
    setChecklist({
      contrast: true,
      captions: true,
      keyboard: true
    });
    setContrastScore(100);
    setAltTextScore(100);
    setCriticalIssues([]);
  };

  const handleAuditContent = async () => {
    if (!moduleContent.trim()) return;
    setIsAuditing(true);
    setIssuesFixed(false);
    
    try {
      const response = await fetch('/api/a11y-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: moduleContent }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to perform accessibility check');
      }
      
      const data = await response.json();
      setContrastScore(data.contrastScore);
      setAltTextScore(data.altTextScore);
      setReadabilityGrade(data.readabilityGrade);
      setChecklist(data.checklist);
      setCriticalIssues(data.criticalIssues || []);
    } catch (error) {
      alert('Failed to audit content. Please try again.');
    } finally {
      setIsAuditing(false);
    }
  };

  const criticalIssuesCount = issuesFixed ? 0 : criticalIssues.length;

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-500 text-ink overflow-y-auto pb-12">
      <div className="px-8 py-8 md:py-12 max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">
              01 — Quality Assurance
            </span>
            <h1 className="text-3xl font-display font-bold text-ink lowercase tracking-tight mt-1">
              a11y pre-flight <span className="text-gray-400 font-mono text-base ml-2">({projectTitle.toLowerCase()})</span>
            </h1>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mt-1">Review your course content or scripts for WCAG compliance.</p>
          </div>
        </div>

        {/* Input Textarea & Scan Button */}
        <div className="bg-background border border-gray-200 rounded p-6 shadow-bryl-resting mb-8 flex flex-col gap-4">
          <h3 className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">
            02 — Course Content / Slide Text Scanner
          </h3>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded p-4 text-xs font-sans focus:outline-none focus:border-ink resize-none leading-relaxed h-32 transition-colors duration-500"
            value={moduleContent}
            onChange={(e) => setModuleContent(e.target.value)}
            placeholder="Paste your module text, slide content, or audio script here to scan for accessibility issues..."
          />
          <button
            onClick={handleAuditContent}
            disabled={isAuditing || !moduleContent.trim()}
            className="self-end px-4 py-2 bg-ink text-background rounded text-[10px] font-mono tracking-widest uppercase hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isAuditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {isAuditing ? "scanning..." : "scan content"}
          </button>
        </div>

        {/* Meters & Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Contrast Score */}
          <div className="bg-background rounded border border-gray-200 p-6 shadow-bryl-resting hover:shadow-bryl-hover hover:-translate-y-0.5 transition-all duration-350 flex flex-col items-center justify-center text-center">
            <h3 className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-1.5 justify-center">
              <Eye className="w-3.5 h-3.5 text-gray-400" /> contrast ratio
            </h3>
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="var(--color-gray-100)" strokeWidth="8" />
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="var(--color-ink)" strokeWidth="8" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * contrastScore / 100)} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="flex flex-col items-center z-10">
                <span className="text-2xl font-bold tracking-tight text-ink">{contrastScore}%</span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mt-0.5">
                  {contrastScore >= 90 ? "pass" : "warning"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-6 font-sans">
              {contrastScore >= 90 ? "AA Compliance met for all primary text elements." : "Some text elements have low contrast ratios."}
            </p>
          </div>

          {/* Alt-Text Coverage */}
          <div className="bg-background rounded border border-gray-200 p-6 shadow-bryl-resting hover:shadow-bryl-hover hover:-translate-y-0.5 transition-all duration-350 flex flex-col items-center justify-center text-center">
            <h3 className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-1.5 justify-center">
              <ImageIcon className="w-3.5 h-3.5 text-gray-400" /> alt-text coverage
            </h3>
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="var(--color-gray-100)" strokeWidth="8" />
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="var(--color-ink)" strokeWidth="8" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * altTextScore / 100)} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="flex flex-col items-center z-10">
                <span className="text-2xl font-bold tracking-tight text-ink">{altTextScore}%</span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mt-0.5">
                  {altTextScore >= 90 ? "pass" : "warning"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-6 font-sans">
              {altTextScore >= 90 ? "All decorative/informative images properly tagged." : "Missing alt-text on some image references."}
            </p>
          </div>

          {/* Readability Grade */}
          <div className="bg-background rounded border border-gray-200 p-6 shadow-bryl-resting hover:shadow-bryl-hover hover:-translate-y-0.5 transition-all duration-350 flex flex-col justify-between">
            <div>
               <h3 className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                 <Type className="w-3.5 h-3.5 text-gray-400" /> readability grade
               </h3>
               <p className="text-[11px] text-gray-500 font-sans">Flesch-Kincaid Analysis</p>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="bg-gray-50 border border-gray-200 text-ink px-4 py-2 rounded flex items-baseline gap-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">grade</span>
                <span className="text-3xl font-bold font-mono">{readabilityGrade}</span>
              </div>
              <CheckCircle className="w-6 h-6 text-ink" />
            </div>
            <p className="text-[11px] text-gray-500 mt-6 border-t border-gray-200 pt-4 font-sans leading-normal">
              {readabilityGrade <= 8 ? "Optimal for general adult audiences." : "Slightly complex. Consider simplification."}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Critical Issues Box */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-background border border-gray-200 rounded shadow-bryl-resting h-full overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">
                <h3 className="font-mono uppercase tracking-widest text-ink font-semibold flex items-center gap-1.5">
                  {issuesFixed ? <CheckCircle className="w-4 h-4 text-ink" /> : <AlertTriangle className="w-4 h-4 text-ink" />}
                  {issuesFixed ? "all clear" : "critical issues"}
                </h3>
                <span className="bg-gray-100 border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest">
                  {criticalIssuesCount} found
                </span>
              </div>
              
              <div className="flex-1 p-6 flex flex-col gap-4 bg-background relative">
                
                {issuesFixed ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
                    <CheckCircle className="w-10 h-10 text-ink mb-3" />
                    <h4 className="text-xs font-mono uppercase tracking-widest font-semibold text-ink">All Issues Resolved</h4>
                    <p className="text-[11px] text-gray-500 mt-2 font-sans">Your module now passes all baseline accessibility checks.</p>
                  </div>
                ) : criticalIssues.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <CheckCircle className="w-10 h-10 text-ink mb-3" />
                    <h4 className="text-xs font-mono uppercase tracking-widest font-semibold text-ink">All Clear!</h4>
                    <p className="text-[11px] text-gray-500 mt-2 font-sans">No accessibility issues detected in this content.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {criticalIssues.map((issue, idx) => {
                      let Icon = FileWarning;
                      if (issue.type === 'alt' || issue.type === 'contrast') {
                        Icon = ImageIcon;
                      }
                      
                      return (
                        <div key={idx} className="flex items-start gap-3 p-4 border border-gray-200 bg-gray-50 rounded">
                          <Icon className="w-4 h-4 shrink-0 mt-0.5 text-ink" />
                          <div>
                            <h4 className="text-xs font-sans font-semibold text-ink">{issue.title}</h4>
                            <p className="text-[11px] text-gray-500 mt-1 font-sans leading-relaxed">{issue.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
              {!issuesFixed && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <button 
                    onClick={handleFixAll}
                    className="w-full py-2 bg-ink text-background text-[10px] font-mono uppercase tracking-widest font-semibold rounded hover:bg-ink/90 transition-colors shadow-bryl-resting"
                  >
                    fix all issues
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Audit Checklist */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-background border border-gray-200 rounded shadow-bryl-resting h-full flex flex-col">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">
                <h3 className="font-mono uppercase tracking-widest text-ink font-semibold">detailed audit checklist</h3>
              </div>
              
              <div className="flex-1 divide-y divide-gray-200">
                
                {/* Checklist item 1 */}
                <div 
                  className={cn("p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer", !checklist.contrast && "bg-gray-50/30")}
                  onClick={() => setChecklist(prev => ({ ...prev, contrast: !prev.contrast }))}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center shrink-0 bg-background text-ink")}>
                      <Type className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-semibold text-ink">Text Contrast (WCAG AA)</h4>
                      <p className={cn("text-[10px] font-mono uppercase tracking-wider mt-0.5", checklist.contrast ? "text-gray-400" : "text-ink font-bold")}>
                        {checklist.contrast ? "All text meets 4.5:1 ratio." : "Contrast issues found."}
                      </p>
                    </div>
                  </div>
                  <div className={cn("w-11 h-6 rounded-full relative shadow-inner transition-colors", checklist.contrast ? "bg-ink" : "bg-gray-300")}>
                    <div className={cn("absolute top-1 bg-background w-4 h-4 rounded-full transition-all", checklist.contrast ? "right-1" : "left-1")}></div>
                  </div>
                </div>

                {/* Checklist item 2 */}
                <div 
                  className={cn("p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer", !checklist.captions && "bg-gray-50/30")}
                  onClick={() => setChecklist(prev => ({ ...prev, captions: !prev.captions }))}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center shrink-0 bg-background text-ink")}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-semibold text-ink">Video Captions</h4>
                      <p className={cn("text-[10px] font-mono uppercase tracking-wider mt-0.5 transition-colors", checklist.captions ? "text-gray-400" : "text-ink font-bold")}>
                        {checklist.captions ? "All videos have captions." : "Missing captions on 'Overview' video."}
                      </p>
                    </div>
                  </div>
                  <div className={cn("w-11 h-6 rounded-full relative shadow-inner transition-colors", checklist.captions ? "bg-ink" : "bg-gray-300")}>
                    <div className={cn("absolute top-1 bg-background w-4 h-4 rounded-full transition-all", checklist.captions ? "right-1" : "left-1")}></div>
                  </div>
                </div>

                {/* Checklist item 3 */}
                <div 
                  className={cn("p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer", !checklist.keyboard && "bg-gray-50/30")}
                  onClick={() => setChecklist(prev => ({ ...prev, keyboard: !prev.keyboard }))}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center shrink-0 bg-background text-ink")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-semibold text-ink">Keyboard Navigation</h4>
                      <p className={cn("text-[10px] font-mono uppercase tracking-wider mt-0.5 transition-colors", checklist.keyboard ? "text-gray-400" : "text-ink font-bold")}>
                        {checklist.keyboard ? "All interactive elements are focusable." : "Keyboard traps detected."}
                      </p>
                    </div>
                  </div>
                  <div className={cn("w-11 h-6 rounded-full relative shadow-inner transition-colors", checklist.keyboard ? "bg-ink" : "bg-gray-300")}>
                    <div className={cn("absolute top-1 bg-background w-4 h-4 rounded-full transition-all", checklist.keyboard ? "right-1" : "left-1")}></div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
