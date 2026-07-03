import { useState, useEffect } from 'react';
import { AlertCircle, Plus, BookOpen, Target, LayoutGrid, CheckCircle2, Wand2, Loader2 } from 'lucide-react';
import { cn } from '../components/Layout';

interface Objective {
  id: string;
  text: string;
  level: string;
  assessment: string;
  activity: string;
}

export default function CurriculumMapper() {
  const activeProjectId = localStorage.getItem('id_buddy_active_project_id') || 'default';
  const projectTitle = localStorage.getItem('id_buddy_active_project_title') || "Unnamed Project";

  const [distractorInput, setDistractorInput] = useState(() => {
    return localStorage.getItem(`id_buddy_${activeProjectId}_cm_dist_input`) || "";
  });
  const [correctAnswerInput, setCorrectAnswerInput] = useState(() => {
    return localStorage.getItem(`id_buddy_${activeProjectId}_cm_dist_answer`) || "";
  });
  const [showDistractors, setShowDistractors] = useState(() => {
    return localStorage.getItem(`id_buddy_${activeProjectId}_cm_dist_show`) === 'true';
  });
  const [isGeneratingDistractors, setIsGeneratingDistractors] = useState(false);
  const [distractors, setDistractors] = useState<string[]>(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_cm_distractors`);
    return saved ? JSON.parse(saved) : [];
  });

  const initialObjectives = [
    {
      id: "OBJ-01",
      text: "Identify the core components of the ADDIE model.",
      level: "Knowledge",
      assessment: "Multiple Choice Quiz: Recall phases",
      activity: "Interactive Timeline of ID Models",
    },
    {
      id: "OBJ-02",
      text: "Apply Gagne's Nine Events to a sample lesson plan.",
      level: "Application",
      assessment: "",
      activity: "Case Study Analysis",
    },
    {
      id: "OBJ-03",
      text: "Evaluate the accessibility of a provided e-learning module.",
      level: "Evaluation",
      assessment: "Peer Review Rubric",
      activity: "",
    }
  ];

  const [objectives, setObjectives] = useState<Objective[]>(() => {
    const saved = localStorage.getItem(`id_buddy_${activeProjectId}_cm_objectives`);
    return saved ? JSON.parse(saved) : initialObjectives;
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_cm_dist_input`, distractorInput);
  }, [distractorInput, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_cm_dist_answer`, correctAnswerInput);
  }, [correctAnswerInput, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_cm_dist_show`, String(showDistractors));
  }, [showDistractors, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_cm_distractors`, JSON.stringify(distractors));
  }, [distractors, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`id_buddy_${activeProjectId}_cm_objectives`, JSON.stringify(objectives));
  }, [objectives, activeProjectId]);

  const handleUpdateObjective = (id: string, field: keyof Objective, val: string) => {
    setObjectives(prev => prev.map(o => o.id === id ? { ...o, [field]: val } : o));
  };

  const handleToggleLevel = (id: string, currentLevel: string) => {
    const levels = ["Knowledge", "Comprehension", "Application", "Analysis", "Synthesis", "Evaluation"];
    const currentIndex = levels.indexOf(currentLevel);
    const nextLevel = levels[(currentIndex + 1) % levels.length];
    handleUpdateObjective(id, 'level', nextLevel);
  };

  const handlePlusRowAction = (id: string) => {
    const action = prompt("Type 'assessment' to add an assessment, or 'activity' to add an enabling activity:");
    if (action === 'assessment') {
      handleUpdateObjective(id, 'assessment', 'Formative Assessment');
    } else if (action === 'activity') {
      handleUpdateObjective(id, 'activity', 'Enabling Learning Activity');
    }
  };

  const handleGenerateDistractors = async () => {
    if (!distractorInput.trim() || !correctAnswerInput.trim()) return;
    setIsGeneratingDistractors(true);
    setShowDistractors(false);
    
    try {
      const response = await fetch('/api/generate-distractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: distractorInput, correctAnswer: correctAnswerInput }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate distractors');
      }
      
      const data = await response.json();
      setDistractors(data.distractors || []);
      setShowDistractors(true);
    } catch (error) {
      alert('Failed to generate distractors. Please try again.');
    } finally {
      setIsGeneratingDistractors(false);
    }
  };

  const handleAddObjective = () => {
    const newId = `OBJ-${String(objectives.length + 1).padStart(2, '0')}`;
    setObjectives([...objectives, {
      id: newId,
      text: "New Learning Objective...",
      level: "Knowledge",
      assessment: "",
      activity: "",
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-500 text-ink">
      <div className="px-8 py-6 border-b border-gray-200 bg-background flex items-center justify-between shrink-0 transition-colors duration-500">
        <div>
          <span className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">
            01 — Curriculum
          </span>
          <h1 className="text-2xl font-display font-bold text-ink lowercase tracking-tight mt-1">
            curriculum mapper <span className="text-gray-400 font-mono text-xs ml-2">({projectTitle.toLowerCase()})</span>
          </h1>
          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-mono">Map learning objectives to assessments and enabling activities.</p>
        </div>
        <button 
          onClick={handleAddObjective}
          className="flex items-center gap-2 px-3 py-2 bg-ink text-background rounded text-[10px] font-mono tracking-widest uppercase hover:bg-ink/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          add objective
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col xl:flex-row gap-8">
        
        {/* Main Matrix */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-widest">
              02 — curriculum matrix
            </h2>
          </div>
          
          <div className="bg-background border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-bryl-resting transition-colors duration-500">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest transition-colors duration-500">
              <div className="col-span-5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> learning objective
              </div>
              <div className="col-span-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> assessment
              </div>
              <div className="col-span-4 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> enabling activity
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-200 transition-colors duration-500">
              {objectives.map((obj) => (
                <div key={obj.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50/30 transition-colors group">
                  <div className="col-span-5 flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs font-mono font-bold text-gray-400 w-12 shrink-0">{obj.id}</span>
                      <p 
                        className="text-xs font-sans text-ink outline-none hover:bg-gray-50 p-1 -m-1 rounded transition-colors cursor-text" 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newText = e.currentTarget.textContent || "";
                          handleUpdateObjective(obj.id, 'text', newText);
                        }}
                      >
                        {obj.text}
                      </p>
                    </div>
                    <span 
                      onClick={() => handleToggleLevel(obj.id, obj.level)}
                      className="ml-14 inline-flex items-center px-2 py-0.5 rounded-full border border-gray-300 text-[9px] font-mono uppercase tracking-widest text-gray-500 bg-gray-50 hover:bg-gray-100 cursor-pointer self-start transition-colors"
                    >
                      bloom's: {obj.level.toLowerCase()}
                    </span>
                  </div>
                  
                  <div className="col-span-3 flex items-start">
                    {obj.assessment ? (
                      <div 
                        className="text-xs text-ink bg-background px-3 py-2 rounded border border-gray-200 w-full outline-none hover:border-ink focus:border-ink transition-colors cursor-text font-sans"
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newText = e.currentTarget.textContent || "";
                          handleUpdateObjective(obj.id, 'assessment', newText);
                        }}
                      >
                        {obj.assessment}
                      </div>
                    ) : (
                      <div 
                        className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded border border-dashed border-gray-300 w-full flex items-center gap-2 cursor-pointer hover:bg-gray-100 hover:text-ink transition-colors font-mono uppercase tracking-wider text-[10px]"
                        onClick={() => handleUpdateObjective(obj.id, 'assessment', 'New Assessment')}
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>missing assessment</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-4 flex items-start justify-between">
                    {obj.activity ? (
                      <div 
                        className="text-xs text-ink bg-background px-3 py-2 rounded border border-gray-200 w-full mr-2 outline-none hover:border-ink focus:border-ink transition-colors cursor-text font-sans"
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newText = e.currentTarget.textContent || "";
                          handleUpdateObjective(obj.id, 'activity', newText);
                        }}
                      >
                        {obj.activity}
                      </div>
                    ) : (
                      <div 
                        className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded border border-dashed border-gray-300 w-full mr-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 hover:text-ink transition-colors font-mono uppercase tracking-wider text-[10px]"
                        onClick={() => handleUpdateObjective(obj.id, 'activity', 'New Activity')}
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>missing activity</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handlePlusRowAction(obj.id)}
                      className="p-1 border border-gray-200 rounded hover:bg-gray-50 text-ink bg-background transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distractor Generator (Right Sidebar) */}
        <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0">
          <div className="bg-background border border-gray-200 rounded-lg shadow-bryl-resting overflow-hidden flex flex-col h-fit transition-colors duration-500">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-1 transition-colors duration-500">
              <h3 className="font-mono uppercase tracking-widest text-ink font-semibold flex items-center gap-1.5 text-xs">
                <Wand2 className="w-3.5 h-3.5 text-ink" />
                distractor gen
              </h3>
              <p className="text-[10px] text-gray-500 font-sans leading-normal">Generate plausible incorrect options for MCQ items.</p>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">quiz question</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-xs text-ink font-sans focus:outline-none focus:border-ink resize-none leading-relaxed transition-colors duration-500"
                  rows={3}
                  placeholder="e.g., Which phase of ADDIE involves creating storyboards?"
                  value={distractorInput}
                  onChange={(e) => { setDistractorInput(e.target.value); setShowDistractors(false); }}
                />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">correct answer</label>
                 <input 
                   type="text"
                   className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs text-ink font-sans focus:outline-none focus:border-ink transition-colors duration-500"
                   placeholder="e.g., Design"
                   value={correctAnswerInput}
                   onChange={(e) => { setCorrectAnswerInput(e.target.value); setShowDistractors(false); }}
                 />
              </div>
              
              <button 
                onClick={handleGenerateDistractors}
                disabled={!distractorInput.trim() || !correctAnswerInput.trim() || isGeneratingDistractors}
                className="w-full py-2 bg-ink text-background text-[10px] font-mono uppercase tracking-widest font-semibold rounded hover:bg-ink/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingDistractors ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SparklesIcon />} 
                {isGeneratingDistractors ? "generating..." : "generate options"}
              </button>

               {showDistractors && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3 animate-in fade-in duration-300">
                  <span className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">suggested options</span>
                  
                  {distractors.map((opt, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded text-xs text-ink font-sans">
                      <div className="w-5 h-5 rounded border border-gray-200 bg-background flex items-center justify-center text-[10px] font-mono font-bold text-ink shrink-0 mt-0.5">
                        {String.fromCharCode(66 + i)}
                      </div>
                      <span>{opt}</span>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(distractors.map((opt, idx) => `${String.fromCharCode(66 + idx)}) ${opt}`).join('\n'));
                      alert('Copied all distractors to clipboard!');
                    }}
                    className="text-[10px] font-mono uppercase tracking-widest text-ink hover:underline self-end mt-1"
                  >
                    copy all
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
