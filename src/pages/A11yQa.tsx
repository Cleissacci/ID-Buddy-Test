import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, FileWarning, Eye, Type, Image as ImageIcon } from 'lucide-react';
import { cn } from '../components/Layout';

export default function A11yQa() {
  const [checklist, setChecklist] = useState({
    contrast: true,
    captions: false,
    keyboard: true
  });
  const [issuesFixed, setIssuesFixed] = useState(false);

  const handleFixAll = () => {
    setIssuesFixed(true);
    setChecklist({
      contrast: true,
      captions: true,
      keyboard: true
    });
  };

  const criticalIssuesCount = issuesFixed ? 0 : 5;
  const contrastScore = 95;
  const altTextScore = issuesFixed ? 100 : 75;

  return (
    <div className="flex flex-col h-full bg-surface overflow-y-auto pb-12">
      <div className="px-8 py-8 md:py-12 max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Accessibility Pre-Flight Check</h1>
          <p className="text-muted-foreground mt-2 text-lg">Reviewing module "Introduction to Quantum Mechanics" for WCAG compliance.</p>
        </div>

        {/* Meters & Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Contrast Score */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" /> Contrast Ratio
            </h3>
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-surface-container">
              {/* Fake SVG donut chart */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="#f4f3f1" strokeWidth="12" />
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="#163328" strokeWidth="12" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * contrastScore / 100)} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="flex flex-col items-center z-10">
                <span className="text-3xl font-bold text-primary">{contrastScore}%</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Pass</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6">AA Compliance met for all primary text elements.</p>
          </div>

          {/* Alt-Text Coverage */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-500" /> Alt-Text Coverage
            </h3>
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-surface-container">
              {/* Fake SVG donut chart */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="#f4f3f1" strokeWidth="12" />
                <circle cx="64" cy="64" r="56" fill="transparent" stroke={issuesFixed ? "#163328" : "#eab308"} strokeWidth="12" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * altTextScore / 100)} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="flex flex-col items-center z-10">
                <span className={cn("text-3xl font-bold transition-colors duration-500", issuesFixed ? "text-primary" : "text-yellow-600")}>{altTextScore}%</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                  {issuesFixed ? "Pass" : "Warning"}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              {issuesFixed ? "All decorative images properly tagged." : "Missing alt-text on 2 decorative images."}
            </p>
          </div>

          {/* Readability Grade */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between">
            <div>
               <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                 <Type className="w-4 h-4 text-slate-500" /> Readability Grade
               </h3>
               <p className="text-sm text-muted-foreground">Flesch-Kincaid Analysis</p>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="bg-primary/10 text-primary px-5 py-3 rounded-lg flex items-baseline gap-1">
                <span className="text-sm font-semibold uppercase tracking-wider">Grade</span>
                <span className="text-4xl font-bold">8</span>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-6 border-t border-border pt-4">Optimal for general adult audiences.</p>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Critical Issues Box */}
          <div className="lg:col-span-5 flex flex-col">
            <div className={cn("bg-white border rounded-xl shadow-sm h-full overflow-hidden flex flex-col transition-colors duration-500", issuesFixed ? "border-primary/20" : "border-red-200")}>
              <div className={cn("px-6 py-5 border-b flex items-center justify-between transition-colors duration-500", issuesFixed ? "border-primary/10 bg-primary/5" : "border-red-100 bg-red-50")}>
                <h3 className={cn("font-semibold flex items-center gap-2", issuesFixed ? "text-primary" : "text-red-900")}>
                  {issuesFixed ? <CheckCircle className="w-5 h-5 text-primary" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {issuesFixed ? "All Clear" : "Critical Issues"}
                </h3>
                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full transition-colors", issuesFixed ? "bg-primary/10 text-primary" : "bg-red-200 text-red-800")}>
                  {criticalIssuesCount} Found
                </span>
              </div>
              
              <div className="flex-1 p-6 flex flex-col gap-4 bg-white relative">
                
                {issuesFixed ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
                    <CheckCircle className="w-12 h-12 text-primary mb-4" />
                    <h4 className="text-lg font-semibold text-slate-900">All Issues Resolved</h4>
                    <p className="text-sm text-muted-foreground mt-2">Your module now passes all baseline accessibility checks.</p>
                  </div>
                ) : (
                  <>
                    {/* Issue 1 */}
                    <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <FileWarning className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">3 complex sentences found</h4>
                        <p className="text-sm text-slate-600 mt-1">Sentences exceed 25 words. Consider breaking them down for better cognitive load.</p>
                      </div>
                    </div>

                    {/* Issue 2 */}
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">2 missing image alt-tags</h4>
                        <p className="text-sm text-slate-600 mt-1">Images in slide 4 and 7 lack descriptive tags. Screen readers will skip these.</p>
                      </div>
                    </div>
                  </>
                )}

              </div>
              {!issuesFixed && (
                <div className="p-4 border-t border-red-100 bg-red-50">
                  <button 
                    onClick={handleFixAll}
                    className="w-full py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Fix All Issues
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Audit Checklist */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white border border-border rounded-xl shadow-sm h-full flex flex-col">
              <div className="px-6 py-5 border-b border-border">
                <h3 className="text-lg font-semibold text-slate-900">Detailed Audit Checklist</h3>
              </div>
              
              <div className="flex-1 divide-y divide-border">
                
                {/* Checklist item 1 */}
                <div 
                  className={cn("p-4 sm:px-6 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer", !checklist.contrast && "bg-red-50/30")}
                  onClick={() => setChecklist(prev => ({ ...prev, contrast: !prev.contrast }))}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", checklist.contrast ? "bg-primary/10 text-primary" : "bg-red-100 text-red-600")}>
                      <Type className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Text Contrast (WCAG AA)</h4>
                      <p className={cn("text-xs mt-0.5", checklist.contrast ? "text-muted-foreground" : "text-red-600 font-medium")}>
                        {checklist.contrast ? "All text meets 4.5:1 ratio." : "Contrast issues found."}
                      </p>
                    </div>
                  </div>
                  <div className={cn("w-11 h-6 rounded-full relative shadow-inner transition-colors", checklist.contrast ? "bg-primary" : "bg-slate-300")}>
                    <div className={cn("absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all", checklist.contrast ? "right-1" : "left-1")}></div>
                  </div>
                </div>

                {/* Checklist item 2 */}
                <div 
                  className={cn("p-4 sm:px-6 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer", !checklist.captions && "bg-red-50/30")}
                  onClick={() => setChecklist(prev => ({ ...prev, captions: !prev.captions }))}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors", checklist.captions ? "bg-primary/10 text-primary" : "bg-red-100 text-red-600")}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Video Captions</h4>
                      <p className={cn("text-xs mt-0.5 transition-colors", checklist.captions ? "text-muted-foreground" : "text-red-600 font-medium")}>
                        {checklist.captions ? "All videos have captions." : "Missing captions on 'Overview' video."}
                      </p>
                    </div>
                  </div>
                  <div className={cn("w-11 h-6 rounded-full relative shadow-inner transition-colors", checklist.captions ? "bg-primary" : "bg-slate-300")}>
                    <div className={cn("absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all", checklist.captions ? "right-1" : "left-1")}></div>
                  </div>
                </div>

                {/* Checklist item 3 */}
                <div 
                  className={cn("p-4 sm:px-6 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer", !checklist.keyboard && "bg-red-50/30")}
                  onClick={() => setChecklist(prev => ({ ...prev, keyboard: !prev.keyboard }))}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors", checklist.keyboard ? "bg-primary/10 text-primary" : "bg-red-100 text-red-600")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Keyboard Navigation</h4>
                      <p className={cn("text-xs mt-0.5 transition-colors", checklist.keyboard ? "text-muted-foreground" : "text-red-600 font-medium")}>
                        {checklist.keyboard ? "All interactive elements are focusable." : "Keyboard traps detected."}
                      </p>
                    </div>
                  </div>
                  <div className={cn("w-11 h-6 rounded-full relative shadow-inner transition-colors", checklist.keyboard ? "bg-primary" : "bg-slate-300")}>
                    <div className={cn("absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all", checklist.keyboard ? "right-1" : "left-1")}></div>
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
