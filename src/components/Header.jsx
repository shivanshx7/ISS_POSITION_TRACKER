import React from 'react';
import { Sun, Moon, Rocket, Bell } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-card" style={{ 
      margin: '20px', 
      padding: '15px 30px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: '20px',
      zIndex: 1000
    }}>
      <div className="section-title" style={{ margin: 0 }}>
        <div className="icon-circle" style={{ background: 'var(--gradient-primary)' }}>
          <Rocket size={20} color="white" />
        </div>
        <span style={{ fontSize: '24px', letterSpacing: '-1px' }}>SpaceWatch</span>
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button className="btn-icon" title="Notifications">
          <Bell size={20} />
        </button>
        <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div style={{ 
          height: '24px', 
          width: '1px', 
          background: 'var(--border-color)', 
          margin: '0 5px' 
        }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Commander</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Station Lead</div>
          </div>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px', 
            background: 'var(--gradient-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'white'
          }}>C</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
