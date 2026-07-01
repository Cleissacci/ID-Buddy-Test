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
    <div className="max-w-6xl mx-auto px-8 py-8 h-full flex flex-col gap-8 relative">
      {/* Header & Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Good morning, Jane</h1>
          <p className="text-muted-foreground mt-1">Here's your instructional design pulse for the day.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsTemplatesModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-md text-sm font-medium text-slate-700 hover:bg-surface-container-low transition-colors shadow-sm"
          >
            <LayoutTemplate className="w-4 h-4" />
            Templates
          </button>
          <button 
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                  <span className="text-xs font-medium text-accent flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg text-primary">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Recent Projects */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Recent Projects</h2>
            <button className="text-sm font-medium text-primary hover:underline">View all</button>
          </div>
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border">
            {recentProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => handleSelectProject(project)}
                className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 group-hover:text-primary transition-colors">{project.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      {project.lastEdited}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 text-xs font-medium bg-surface-container-highest text-slate-700 rounded-full">
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tools */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Quick Tools</h2>
          <div className="bg-white border border-border rounded-xl shadow-sm p-2 flex flex-col gap-2">
            {quickTools.map((tool, i) => (
              <div 
                key={i} 
                onClick={() => navigate(tool.to)}
                className="p-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer flex flex-col gap-1 group"
              >
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">{tool.title}</h4>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modals */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Create New Project</h2>
              <button onClick={() => setIsNewProjectModalOpen(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                <input 
                  type="text" 
                  className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                  placeholder="e.g., Q3 Onboarding" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                />
              </div>
              <button 
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="w-full py-2 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Quick-Start Templates</h2>
              <button onClick={() => setIsTemplatesModalOpen(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Compliance Module', 'Software Walkthrough', 'Soft Skills Course', 'Product Knowledge'].map((t, i) => (
                <div 
                  key={i} 
                  onClick={() => handleCreateFromTemplate(t)}
                  className="p-4 border border-border rounded-lg hover:border-primary hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <LayoutTemplate className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold text-sm text-slate-900">{t}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
