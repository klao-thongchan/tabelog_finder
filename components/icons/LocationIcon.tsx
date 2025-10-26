
import React from 'react';

const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 21s-7-9.5-7-13.5A7 7 0 0 1 12 2a7 7 0 0 1 7 4.5c0 4-7 13.5-7 13.5z" />
    <circle cx="12" cy="10.5" r="3" />
  </svg>
);

export default LocationIcon;
