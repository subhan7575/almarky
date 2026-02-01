
import React from 'react';

const AlmarkyVectorLogo: React.FC<{ className?: string }> = ({ className = "h-11" }) => {
  const uniqueId = React.useId ? React.useId() : Math.random().toString(36).substring(2);
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Almarky Logo Icon">
      <defs>
        <linearGradient id={`ringGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#42a5f5"/>
            <stop offset="20%" stopColor="#26c6da"/>
            <stop offset="40%" stopColor="#66bb6a"/>
            <stop offset="60%" stopColor="#ffee58"/>
            <stop offset="80%" stopColor="#ffa726"/>
            <stop offset="100%" stopColor="#ef5350"/>
        </linearGradient>
        <linearGradient id={`bagBodyGrad-${uniqueId}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#ffb74d"/>
            <stop offset="100%" stopColor="#f57c00"/>
        </linearGradient>
        <linearGradient id={`bagHandleGrad-${uniqueId}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#ef5350"/>
            <stop offset="100%" stopColor="#e53935"/>
        </linearGradient>
        <linearGradient id={`cartBodyGrad-${uniqueId}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#42a5f5"/>
            <stop offset="100%" stopColor="#1976d2"/>
        </linearGradient>
         <linearGradient id={`baseGrad-${uniqueId}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#1e88e5"/>
            <stop offset="100%" stopColor="#0d47a1"/>
        </linearGradient>
         <filter id={`shadow-${uniqueId}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15"/>
         </filter>
      </defs>

      {/* Ring */}
      <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#ringGrad-${uniqueId})`} strokeWidth="8" transform="rotate(-45 50 50)" />
      
      <g transform="translate(0, 2)" filter={`url(#shadow-${uniqueId})`}>
          {/* Shadow Ellipse */}
          <ellipse cx="50" cy="82" rx="38" ry="6" fill="#000" opacity="0.1" />

          {/* Combined Bag & Cart Body */}
          <g transform="translate(14, 15) scale(0.9)">
              
              {/* Bag */}
              <g>
                  <path d="M5 25 L45 25 L38 70 L12 70 Z" fill={`url(#bagBodyGrad-${uniqueId})`}/>
                  <path d="M12 70 L38 70 L35 78 L15 78 Z" fill={`url(#baseGrad-${uniqueId})`} />
                  <path d="M15 25 C 15 15, 35 15, 35 25" stroke={`url(#bagHandleGrad-${uniqueId})`} strokeWidth="4" fill="none" strokeLinecap="round" />
                  <g fill="white" opacity="0.9">
                      <rect x="22" y="38" width="16" height="2.5" rx="1.25" />
                      <rect x="23" y="48" width="14" height="2.5" rx="1.25" />
                      <rect x="24" y="58" width="12" height="2.5" rx="1.25" />
                  </g>
              </g>

              {/* Cart */}
              <g transform="translate(28, 28)">
                  <path d="M0 0 L45 0 L38 30 L7 30 Z" fill={`url(#cartBodyGrad-${uniqueId})`}/>
                  <path d="M7 30 L38 30 L35 38 L10 38 Z" fill={`url(#baseGrad-${uniqueId})`}/>
                  <g opacity="0.5">
                    <path d="M10 5 L12 25" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M22 5 L24 25" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M34 5 L36 25" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  <circle cx="15" cy="45" r="5" fill="#0d47a1" stroke="white" strokeWidth="1" />
                  <circle cx="35" cy="45" r="5" fill="#0d47a1" stroke="white" strokeWidth="1" />
                  <rect x="10" y="-5" width="12" height="6" fill="#fbc02d" rx="1" />
                  <rect x="25" y="-5" width="12" height="6" fill="#f9a825" rx="1" />
              </g>
              
              {/* Star */}
              <path d="M50 20 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 z" fill="#ffc107" />
          </g>
      </g>
    </svg>
  );
};
export default AlmarkyVectorLogo;
