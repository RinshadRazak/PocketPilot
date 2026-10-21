import React from 'react';
import {
  House,
  ArrowLeftRight,
  Layers,
  Lightbulb,
  Database,
  ShieldCheck,
  Ellipsis,
  LucideIcon,
} from 'lucide-react';
import { ViewType } from '../types';

export interface NavItemConfig {
  id: ViewType;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: 'overview', label: 'Overview', icon: House },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: Layers },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'data', label: 'Data & privacy', icon: Database },
];

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  mobileOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  mobileOpen,
}) => {
  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <button
        className="brand"
        onClick={() => onNavigate('overview')}
        aria-label="PocketPilot overview"
        type="button"
      >
        <span className="brand-mark brand-mark-img">
          <img
            src="/pocketpilot-mark.png"
            alt="PocketPilot"
            className="brand-logo-img"
          />
        </span>
        <span className="brand-word">
          pocketpilot<span className="brand-dot">.</span>
        </span>
      </button>

      <div className="sidebar-label">WORKSPACE</div>

      <nav className="nav-list" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, icon: IconComponent }) => (
          <button
            key={id}
            className={`nav-item ${currentView === id ? 'selected' : ''}`}
            onClick={() => onNavigate(id)}
            aria-current={currentView === id ? 'page' : undefined}
            type="button"
          >
            <IconComponent size={19} strokeWidth={1.9} />
            <span>{label}</span>
            {currentView === id && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="privacy-note">
          <ShieldCheck size={19} />
          <div>
            <strong>Just yours.</strong>
            <span>Stored on this device</span>
          </div>
        </div>

        <div className="sidebar-profile">
          <span className="profile-avatar">P</span>
          <div>
            <strong>Personal space</strong>
            <span>Your money, your view</span>
          </div>
          <Ellipsis size={18} />
        </div>
      </div>
    </aside>
  );
};
