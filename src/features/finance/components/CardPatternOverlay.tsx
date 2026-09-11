import React from 'react'
import type { WalletCardPattern } from '../services/cardCustomizationService'

interface CardPatternOverlayProps {
  pattern?: WalletCardPattern | string
}

export const CardPatternOverlay: React.FC<CardPatternOverlayProps> = ({ pattern }) => {
  if (!pattern || pattern === 'none') return null

  if (pattern === 'waves') {
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25 mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 400 250"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M-50,80 C100,160 200,20 350,90 C450,140 500,40 550,80 L550,300 L-50,300 Z"
          fill="white"
          opacity="0.18"
        />
        <path
          d="M-50,140 C80,60 180,180 320,110 C420,50 480,130 550,100 L550,300 L-50,300 Z"
          fill="white"
          opacity="0.22"
        />
        <path
          d="M-50,40 C90,120 220,10 360,60 C450,100 500,20 550,50"
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.35"
        />
      </svg>
    )
  }

  if (pattern === 'dots') {
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25 mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="card-dot-pattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#card-dot-pattern)" />
      </svg>
    )
  }

  if (pattern === 'mesh') {
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25 mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="card-mesh-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 20 M 0 0 L 20 20" stroke="white" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#card-mesh-pattern)" />
      </svg>
    )
  }

  return null
}
