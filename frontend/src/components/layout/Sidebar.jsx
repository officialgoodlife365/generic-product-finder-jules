import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Users,
  Activity,
  Lightbulb
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Opportunities', href: '/opportunities', icon: Target },
  { name: 'Warm Leads', href: '/leads', icon: Users },
  { name: 'System Runs', href: '/runs', icon: Activity },
];

const Sidebar = () => {
  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-slate-900 text-white flex flex-col z-20">
      <div className="flex items-center space-x-2 h-16 px-6 border-b border-slate-800 shrink-0">
        <Lightbulb className="h-6 w-6 text-indigo-400" />
        <span className="text-xl font-bold tracking-tight">GP Finder</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <span>v1.0.0</span>
          <span>Status: <span className="text-green-400 font-medium">Online</span></span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
