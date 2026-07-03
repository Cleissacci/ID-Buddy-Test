import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Map as MapIcon, Type, Accessibility, Sun, Moon, Laptop } from 'lucide-react';
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
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('id_buddy_theme') as 'light' | 'dark' | 'system') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (t: 'light' | 'dark' | 'system') => {
      root.classList.remove('light', 'dark');
      if (t === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(systemDark ? 'dark' : 'light');
      } else {
        root.classList.add(t);
      }
    };
    applyTheme(theme);
    localStorage.setItem('id_buddy_theme', theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <div className="flex h-screen w-full bg-background text-ink font-sans transition-colors duration-500">
      {/* Sidebar Navigation - 14rem width (w-56) */}
      <aside className="w-56 flex-shrink-0 bg-background border-r border-gray-200 flex flex-col transition-colors duration-500">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-ink border border-gray-200 rounded flex items-center justify-center mr-3">
            <span className="text-background font-bold tracking-tighter text-sm font-mono">ID</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight lowercase">id buddy</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest mb-4 px-2">
            01 — Workspaces
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded text-xs font-mono tracking-wider uppercase transition-colors duration-200",
                    isActive 
                      ? "text-ink bg-gray-50" 
                      : "text-gray-400 hover:text-ink hover:bg-gray-50/50"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="w-3 text-center text-xs font-bold">
                      {isActive ? "→" : " "}
                    </span>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Theme & User Profile panel */}
        <div className="p-4 border-t border-gray-200 flex flex-col gap-3">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded text-[10px] font-mono tracking-widest uppercase hover:bg-gray-50 transition-colors w-full"
            title="Toggle theme (Light / Dark / System)"
          >
            <span className="text-gray-400">theme: {theme}</span>
            {theme === 'light' && <Sun className="w-3 h-3 text-ink" />}
            {theme === 'dark' && <Moon className="w-3 h-3 text-ink" />}
            {theme === 'system' && <Laptop className="w-3 h-3 text-ink" />}
          </button>

          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-ink text-background border border-gray-200 flex items-center justify-center text-xs font-mono font-bold uppercase">
              JS
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">Jane Smith</span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">Lead ID</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative transition-colors duration-500">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
