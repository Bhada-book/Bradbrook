import React from 'react';
import { FaHome, FaCommentAlt } from 'react-icons/fa';

export default function SimpleBottomNav({ onNavigate, activeTab }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '60px',
      backgroundColor: '#ffffff',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 999,
      boxSizing: 'border-box'
    }}>
      {/* Left Option: Home */}
      <button 
        onClick={() => onNavigate('home')} 
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          color: activeTab === 'home' ? '#bb2d2d' : '#666666',
          fontSize: '12px',
          flex: 1
        }}
      >
        <FaHome size={20} style={{ marginBottom: '4px' }} />
        <span>Home</span>
      </button>

      {/* Right Option: Chat Box */}
      <button 
        onClick={() => onNavigate('chat')} 
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          color: activeTab === 'chat' ? '#c02c2c' : '#666666',
          fontSize: '12px',
          flex: 1
        }}
      >
        <FaCommentAlt size={18} style={{ marginBottom: '4px' }} />
        <span>Chat Box</span>
      </button>
    </div>
  );
}