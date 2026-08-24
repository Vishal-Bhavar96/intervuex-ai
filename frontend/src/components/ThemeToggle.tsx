import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'button' | 'pill' | 'compact';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'button', showLabel = false }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      className="theme-toggle-btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        padding: showLabel ? '0.45rem 0.8rem' : '0.5rem',
        borderRadius: '9999px',
        border: '1px solid var(--primary-border)',
        background: isDark ? 'rgba(30, 41, 59, 0.9)' : '#F1F5F9',
        color: isDark ? '#F59E0B' : '#64748B',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '0.825rem',
        fontWeight: 600,
        boxShadow: isDark 
          ? '0 0 12px rgba(245, 158, 11, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)' 
          : '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.borderColor = isDark ? '#F59E0B' : '#2563EB';
        e.currentTarget.style.color = isDark ? '#FBBF24' : '#2563EB';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = 'var(--primary-border)';
        e.currentTarget.style.color = isDark ? '#F59E0B' : '#64748B';
      }}
    >
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' 
      }}>
        {isDark ? <Sun size={17} strokeWidth={2.3} /> : <Moon size={17} strokeWidth={2.3} />}
      </span>
      {showLabel && (
        <span style={{ color: 'var(--main-heading)', fontSize: '0.8rem' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
