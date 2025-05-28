import * as React from "react";

// Modern chat bubble in a teal circle, SVG
export const CampusResolveLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <span className={"inline-flex items-center justify-center rounded-full bg-teal-400 shadow-lg " + className} style={{ aspectRatio: 1 }}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#06b6d4"/>
      <rect x="8" y="10" width="16" height="10" rx="5" fill="#fff"/>
      <path d="M12 20c0 1.104.896 2 2 2h4c1.104 0 2-.896 2-2" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="13.5" cy="15" r="1" fill="#06b6d4"/>
      <circle cx="16" cy="15" r="1" fill="#06b6d4"/>
      <circle cx="18.5" cy="15" r="1" fill="#06b6d4"/>
    </svg>
  </span>
);

export default CampusResolveLogo;
