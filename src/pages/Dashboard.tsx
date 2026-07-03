import { useState } from 'react';
import { BookOpen, FileText, CheckCircle2, TrendingUp, Plus, LayoutTemplate, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  lastEdited: string;
  status: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const stats = [
    { label: "Modules Mapped", value: "14", trend: "+2 this week", icon: BookOpen },
    { label: "Scripts Polished", value: "32", trend: "+8 this week", icon: FileText },
    { label: "A11y Checks Passed", value: "100%", trend: "Consistent", icon: CheckCircle2 },
  ];

  const [recentProjects, setRecentProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('id_buddy_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "proj-1", title: "Compliance Training 2024", lastEdited: "2 hours ago", status: "In Progress" },
      { id: "proj-2", title: "Sales Enablement V2", lastEdited: "Yesterday", status: "Review" },
      { id: "proj-3", title: "Onboarding Bootcamp", lastEdited: "3 days ago", status: "Planning" },
    ];
  });

  const saveProjects = (projects: Project[]) => {
    localStorage.setItem('id_buddy_projects', JSON.stringify(projects));
  };

  const handleSelectProject = (project: Project) => {
    localStorage.setItem('id_buddy_active_project_id', project.id);
    localStorage.setItem('id_buddy_active_project_title', project.title);
    navigate('/curriculum-mapper');
  };

  const quickTools = [
    { title: "SME Translator", desc: "Simplify complex jargon", to: "/sme-translator" },
    { title: "Curriculum Mapper", desc: "Align objectives & activities", to: "/curriculum-mapper" },
    { title: "Script Lab", desc: "Clean & format transcripts", to: "/script-lab" },
    { title: "A11y Pre-Flight", desc: "Check contrast & readability", to: "/accessibility-qa" }
  ];

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newProj = {
      id: `proj-${Date.now()}`,
      title: newProjectName,
      lastEdited: "Just now",
      status: "Planning"
    };
    const updated = [newProj, ...recentProjects];
    setRecentProjects(updated);
    saveProjects(updated);
    
    localStorage.setItem('id_buddy_active_project_id', newProj.id);
    localStorage.setItem('id_buddy_active_project_title', newProj.title);

    setNewProjectName("");
    setIsNewProjectModalOpen(false);
    navigate('/curriculum-mapper');
  };

  const handleCreateFromTemplate = (templateName: string) => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: `New ${templateName}`,
      lastEdited: "Just now",
      status: "Planning"
    };
    const updated = [newProj, ...recentProjects];
    setRecentProjects(updated);
    saveProjects(updated);
    
    localStorage.setItem('id_buddy_active_project_id', newProj.id);
    localStorage.setItem('id_buddy_active_project_title', newProj.title);

    setIsTemplatesModalOpen(false);
    navigate('/curriculum-mapper');
  };

  return (
    <div className="relative min-h-full bg-background transition-colors duration-500 flex flex-col gap-10 px-8 py-10 max-w-5xl mx-auto w-full">
      {/* Halftone Backdrop Accent */}
      <div 
        className="absolute inset-0 bg-halftone pointer-events-none"
        style={{
          maskImage: 'radial-gradient(circle at top right, rgba(0,0,0,0.85), transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle at top right, rgba(0,0,0,0.85), transparent 60%)'
        }}
      />

      {/* Header & Quick Actions */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest">
            01 — Overview
          </span>
          <h1 className="text-3xl font-display font-bold text-ink lowercase tracking-tight mt-1">
            good morning, jane
          </h1>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mt-1">
            instructional design pulse dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsTemplatesModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded text-[10px] font-mono tracking-widest uppercase hover:bg-gray-50 bg-background transition-colors shadow-bryl-resting"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            templates
          </button>
          <button 
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-ink text-background rounded text-[10px] font-mono tracking-widest uppercase hover:bg-ink/90 transition-colors shadow-bryl-resting"
          >
            <Plus className="w-3.5 h-3.5" />
            new project
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200 rounded-lg overflow-hidden bg-background">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-6 flex items-start justify-between hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold tracking-tight text-ink font-sans">{stat.value}</h3>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className="p-2 border border-gray-200 rounded text-ink bg-gray-50">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1">
        
        {/* Recent Projects */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-widest">
              02 — Recent Projects
            </h2>
            <button className="text-[10px] font-mono uppercase tracking-widest text-ink hover:underline">
              view all
            </button>
          </div>
          <div className="bg-background border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200 shadow-bryl-resting">
            {recentProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => handleSelectProject(project)}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-ink transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-sans font-semibold text-ink group-hover:underline">
                      {project.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{project.lastEdited.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-gray-500 bg-gray-100 border border-gray-200 rounded-full">
                    {project.status.toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tools */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-widest">
            03 — Quick Tools
          </h2>
          <div className="bg-background border border-gray-200 rounded-lg p-2 flex flex-col gap-1 shadow-bryl-resting">
            {quickTools.map((tool, i) => (
              <div 
                key={i} 
                onClick={() => navigate(tool.to)}
                className="p-3 rounded hover:bg-gray-50 transition-colors cursor-pointer flex flex-col gap-1 group"
              >
                <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold group-hover:underline">
                  {tool.title.toLowerCase()}
                </h4>
                <p className="text-[11px] text-gray-500 font-sans">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modals */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
          <div className="bg-background border border-gray-200 rounded-lg shadow-bryl-modal w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 text-ink">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-ink font-semibold">Create New Project</h2>
              <button onClick={() => setIsNewProjectModalOpen(false)} className="text-gray-400 hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">Project Name</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-ink" 
                  placeholder="e.g., Q3 Onboarding" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                />
              </div>
              <button 
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="w-full py-2 bg-ink text-background text-[10px] font-mono uppercase tracking-widest font-semibold rounded hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
          <div className="bg-background border border-gray-200 rounded-lg shadow-bryl-modal w-full max-w-md p-6 animate-in zoom-in-95 duration-200 text-ink">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-ink font-semibold">Quick-Start Templates</h2>
              <button onClick={() => setIsTemplatesModalOpen(false)} className="text-gray-400 hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Compliance Module', 'Software Walkthrough', 'Soft Skills Course', 'Product Knowledge'].map((t, i) => (
                <div 
                  key={i} 
                  onClick={() => handleCreateFromTemplate(t)}
                  className="p-4 border border-gray-200 rounded bg-gray-50 hover:bg-background hover:border-ink cursor-pointer transition-colors"
                >
                  <LayoutTemplate className="w-5 h-5 text-gray-400 mb-2" />
                  <h3 className="font-semibold text-xs text-ink">{t}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
