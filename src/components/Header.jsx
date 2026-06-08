
import { Sun, Moon, Rocket, Bell } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-card" style={{ 
      maxWidth: '1392px',
      width: 'calc(100% - 48px)',
      margin: '24px auto 0', 
      padding: '12px 24px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: '24px',
      zIndex: 1000
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '38px', 
          height: '38px', 
          borderRadius: '10px', 
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.25)'
        }}>
          <Rocket size={18} color="white" style={{ transform: 'rotate(45deg)' }} />
        </div>
        <span style={{ 
          fontFamily: 'var(--font-heading)',
          fontSize: '22px', 
          fontWeight: 800,
          letterSpacing: '-0.5px',
          background: 'linear-gradient(to right, var(--text-primary) 60%, var(--accent-cyan) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          SpaceWatch
        </span>
      </div>

      {/* Actions & Profile */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Notifications */}
        <button className="btn-icon" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
          {/* Glowing active notification indicator */}
          <span style={{ 
            position: 'absolute', 
            top: '8px', 
            right: '8px', 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: 'var(--accent-red)',
            boxShadow: '0 0 8px var(--accent-red)'
          }}></span>
        </button>

        {/* Theme Toggle */}
        <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme" style={{ transition: 'transform 0.5s ease' }}>
          {theme === 'dark' ? (
            <Sun size={18} style={{ transform: 'rotate(0deg)' }} />
          ) : (
            <Moon size={18} style={{ transform: 'rotate(0deg)' }} />
          )}
        </button>

        <div style={{ 
          height: '24px', 
          width: '1px', 
          background: 'var(--border-color)', 
          margin: '0 4px' 
        }}></div>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Commander</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Station Lead</div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              fontFamily: 'var(--font-heading)',
              color: 'var(--accent-purple)'
            }}>
              C
            </div>
            {/* Status light */}
            <span style={{ 
              position: 'absolute', 
              bottom: '-2px', 
              right: '-2px', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: 'var(--accent-green)',
              border: '2px solid var(--bg-primary)',
              boxShadow: '0 0 6px var(--accent-green)'
            }}></span>
          </div>
        </div>
      </div>

      {/* Extra style overrides for CSS query breakpoints */}
      <style>{`
        @media (max-width: 600px) {
          header {
            margin: 12px auto 0 !important;
            width: calc(100% - 24px) !important;
            padding: 8px 16px !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
