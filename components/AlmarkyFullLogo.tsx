
import React from 'react';

const AlmarkyFullLogo: React.FC<{ className?: string }> = ({ className = "h-12" }) => {
  const uniqueId = React.useId ? React.useId() : Math.random().toString(36).substring(2);
  return (
    <svg 
      viewBox="0 0 540 100" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      aria-label="Almarky Logo"
    >
      <defs>
        <linearGradient id={`bagGrad-${uniqueId}`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#f9a825"/><stop offset="100%" stopColor="#f57c00"/>
        </linearGradient>
        <linearGradient id={`bagBaseGrad-${uniqueId}`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#1e88e5"/><stop offset="100%" stopColor="#0d47a1"/>
        </linearGradient>
        <linearGradient id={`textGrad-${uniqueId}`} x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#0d47a1"/><stop offset="40%" stopColor="#1565c0"/><stop offset="70%" stopColor="#e53935"/><stop offset="100%" stopColor="#d84315"/>
        </linearGradient>
        <linearGradient id={`swooshGrad-${uniqueId}`} x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#f57c00"/><stop offset="100%" stopColor="#1e88e5"/>
        </linearGradient>
        <linearGradient id={`cartGrad-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#42a5f5"/><stop offset="100%" stopColor="#1565c0"/>
        </linearGradient>
      </defs>
      
      <g filter="url(#drop-shadow)">
        <path d="M20 85 H 520" stroke="#000" strokeOpacity="0.1" strokeWidth="1" transform="translate(0, 5)" />
        <ellipse cx="270" cy="93" rx="260" ry="8" fill="#000" opacity="0.05" />
      </g>
      
      <g transform="translate(0, 15) scale(0.9)">
        <path d="M10 20 H70 L65 70 H15 Z" fill={`url(#bagGrad-${uniqueId})`} />
        <path d="M15 70 H65 V 80 H15 Z" fill={`url(#bagBaseGrad-${uniqueId})`} />
        <path d="M25 20 V10 C25 0 55 0 55 10 V20" stroke="#f57c00" strokeWidth="5" fill="none" strokeLinecap="round" />
        <g fill="white" opacity="0.8">
          <rect x="25" y="35" width="30" height="3" rx="1.5" /><rect x="28" y="45" width="24" height="3" rx="1.5" />
          <path d="M22 28 l5 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <circle cx="30" cy="60" r="3" /><circle cx="50" cy="60" r="3" />
        </g>
        <path d="M50 0 L60 0 L60 20 L55 15 Z" fill="#4caf50" />
        <path d="M70 10 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 z" fill="#ffc107" />
        <path d="M75 20 l1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1 z" fill="#42a5f5" />
      </g>
      
      <text x="85" y="65" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="60" fontWeight="900" fontStyle="italic" fill={`url(#textGrad-${uniqueId})`} letterSpacing="-3">Almarky</text>
      
      <path d="M200 30 Q 310 5 420 35" stroke={`url(#swooshGrad-${uniqueId})`} strokeWidth="6" fill="none" strokeLinecap="round" />
      
      <g transform="translate(435, 45) scale(0.9)">
        <path d="M0 0 H35 L30 25 H5 Z" fill={`url(#cartGrad-${uniqueId})`} />
        <rect x="7" y="5" width="2" height="15" fill="rgba(255,255,255,0.2)" /><rect x="17" y="5" width="2" height="15" fill="rgba(255,255,255,0.2)" /><rect x="27" y="5" width="2" height="15" fill="rgba(255,255,255,0.2)" />
        <path d="M-10 10 H0" stroke="#1565c0" strokeWidth="4" strokeLinecap="round" />
        <circle cx="10" cy="35" r="5" fill="#0d47a1" /><circle cx="30" cy="35" r="5" fill="#0d47a1" />
        <rect x="5" y="-5" width="12" height="5" fill="#f9a825" rx="1" /><rect x="20" y="-5" width="12" height="5" fill="#f9a825" rx="1" />
      </g>
      
      <g transform="translate(390, 60)" stroke="#e53935" strokeWidth="4" strokeLinecap="round">
        <path d="M0 0 H 20" /><path d="M0 8 H 15" />
      </g>
      
      <text x="215" y="90" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="14" fontWeight="600" fill="#475569" letterSpacing="-0.5">Shop Smart, Live Better</text>
    </svg>
  );
};

export default AlmarkyFullLogo;
