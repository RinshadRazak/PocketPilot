import React from 'react';
import { Wallet, Settings2, X, Check } from 'lucide-react';
import { ViewType } from '../types';
import { NAV_ITEMS } from './Sidebar';

interface MobileHeaderProps {
  onNavigate: (view: ViewType) => void;
  mobileOpen: boolean;
  onToggleMobileNav: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onNavigate,
  mobileOpen,
  onToggleMobileNav,
}) => {
  return (
    <div className="mobile-brand">
      <button
        className="brand"
        onClick={() => onNavigate('overview')}
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

      <button
        className="icon-button"
        onClick={onToggleMobileNav}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        type="button"
      >
        {mobileOpen ? <X size={20} /> : <Settings2 size={20} />}
      </button>
    </div>
  );
};

interface MobileTabBarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  currentView,
  onNavigate,
}) => {
  return (
    <nav className="mobile-tabbar" aria-label="Mobile navigation">
      {NAV_ITEMS.map(({ id, label, icon: IconComponent }) => (
        <button
          key={id}
          className={currentView === id ? 'selected' : ''}
          onClick={() => onNavigate(id)}
          aria-label={label}
          aria-current={currentView === id ? 'page' : undefined}
          type="button"
        >
          <IconComponent size={21} />
          <span>{id === 'data' ? 'Data' : label}</span>
        </button>
      ))}
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="page-footer">
      <span>© {new Date().getFullYear()} PocketPilot</span>
      <span>
        <span className="footer-status" /> Private by design · Stored on this device
      </span>
    </footer>
  );
};

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  return (
    <div className="toast" role="status">
      <Check size={17} />
      {message}
      <button onClick={onDismiss} aria-label="Dismiss notification" type="button">
        <X size={15} />
      </button>
    </div>
  );
};
