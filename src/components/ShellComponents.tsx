import React from 'react';
import { X, Check } from 'lucide-react';
import { ViewType } from '../types';
import { NAV_ITEMS } from './Sidebar';

export interface MobileHeaderProps {
  onNavigate?: (view: ViewType) => void;
  mobileOpen?: boolean;
  onToggleMobileNav?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = () => null;

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
