import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Map as MapIcon, Type, Accessibility } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sme-translator', label: 'SME Brain Dump', icon: BrainCircuit },
  { to: '/curriculum-mapper', label: 'Curriculum Mapper', icon: MapIcon },
  { to: '/script-lab', label: 'Script Lab', icon: Type },
  { to: '/accessibility-qa', label: 'A11y Pre-Flight', icon: Accessibility },
];

export default function Layout() {
  return (
    <div className="flex h-screen w-full bg-surface">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3 shadow-sm">
            <span className="text-white font-bold tracking-tighter">ID</span>
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-800">ID Buddy</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Workspaces</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-slate-600 hover:bg-surface-container-highest hover:text-slate-900"
                  )
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-sm font-medium text-slate-600">
              JS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">Jane Smith</span>
              <span className="text-xs text-muted-foreground">Lead ID</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-surface relative">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
