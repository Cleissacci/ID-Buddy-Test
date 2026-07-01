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
    <div className="flex flex-col h-full bg-surface">
      <div className="px-8 py-6 border-b border-border bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Curriculum Mapper <span className="text-primary font-medium text-base ml-2">({projectTitle})</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Map learning objectives to assessments and activities.</p>
        </div>
        <button 
          onClick={handleAddObjective}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Objective
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col xl:flex-row gap-8">
        
        {/* Main Matrix */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-accent" />
              Curriculum Matrix
            </h2>
          </div>
          
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-surface-container-low text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <div className="col-span-5 flex items-center gap-2">
                <Target className="w-4 h-4" /> Learning Objective
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Assessment
              </div>
              <div className="col-span-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Enabling Activity
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
              {objectives.map((obj) => (
                <div key={obj.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-surface-container-highest/30 transition-colors group">
                  <div className="col-span-5 flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs font-bold text-slate-400 w-12 shrink-0">{obj.id}</span>
                      <p 
                        className="text-sm font-medium text-slate-900 outline-none hover:bg-surface-container-low p-1 -m-1 rounded transition-colors" 
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
                      className="ml-14 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 self-start cursor-pointer hover:bg-slate-200"
                    >
                      Bloom's: {obj.level}
                    </span>
                  </div>
                  
                  <div className="col-span-3 flex items-start">
                    {obj.assessment ? (
                      <div 
                        className="text-sm text-slate-700 bg-surface px-3 py-2 rounded-md border border-border w-full outline-none hover:border-accent transition-colors cursor-text"
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
                        className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md border border-red-200 border-dashed w-full flex items-center gap-2 cursor-pointer hover:bg-red-100 transition-colors"
                        onClick={() => handleUpdateObjective(obj.id, 'assessment', 'New Assessment')}
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="font-medium">Missing Assessment</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-4 flex items-start justify-between">
                    {obj.activity ? (
                      <div 
                        className="text-sm text-slate-700 bg-surface px-3 py-2 rounded-md border border-border w-full mr-2 outline-none hover:border-accent transition-colors cursor-text"
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
                        className="text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-md border border-orange-200 border-dashed w-full mr-2 flex items-center gap-2 cursor-pointer hover:bg-orange-100 transition-colors"
                        onClick={() => handleUpdateObjective(obj.id, 'activity', 'New Activity')}
                      >
                        <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                        <span className="font-medium">Missing Activity</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handlePlusRowAction(obj.id)}
                      className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-surface transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distractor Generator (Right Sidebar) */}
        <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0">
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-fit">
            <div className="p-4 border-b border-border bg-gradient-to-r from-accent/10 to-transparent">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-accent" />
                Distractor Generator
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Generate plausible incorrect options for MCQ items.</p>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Quiz Question</label>
                <textarea 
                  className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm"
                  rows={3}
                  placeholder="e.g., Which phase of ADDIE involves creating storyboards?"
                  value={distractorInput}
                  onChange={(e) => { setDistractorInput(e.target.value); setShowDistractors(false); }}
                />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Correct Answer</label>
                 <input 
                   type="text"
                   className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                   placeholder="e.g., Design"
                   value={correctAnswerInput}
                   onChange={(e) => { setCorrectAnswerInput(e.target.value); setShowDistractors(false); }}
                 />
              </div>
              
              <button 
                onClick={handleGenerateDistractors}
                disabled={!distractorInput.trim() || !correctAnswerInput.trim() || isGeneratingDistractors}
                className="w-full py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeneratingDistractors ? <Loader2 className="w-4 h-4 animate-spin" /> : <SparklesIcon />} 
                {isGeneratingDistractors ? "Generating..." : "Generate Options"}
              </button>

               {showDistractors && (
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Suggested Distractors</span>
                  
                  {distractors.map((opt, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50/50 border border-red-100 rounded-md text-sm text-slate-700 group cursor-pointer hover:bg-red-50 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-white border border-red-200 flex items-center justify-center text-[10px] font-bold text-red-500 shrink-0 mt-0.5">
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
                    className="text-xs text-accent font-medium hover:underline self-end mt-1"
                  >
                    Copy All
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
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
