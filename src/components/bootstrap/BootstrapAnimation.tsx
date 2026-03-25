/**
 * BOOTSTRAP ANIMATION COMPONENT
 *
 * Professional bootstrapping loader for tenant initialization.
 * Features:
 * - Animated UniAct branding with gradient colors
 * - Multi-phase loading sequence (Initialize → Sync → Ready)
 * - Consistent design system with app color tokens
 * - Smooth micro-interactions and transitions
 * - Accessible with semantic structure
 *
 * Architecture:
 * - Phase-based rendering with timed state transitions
 * - CSS animation library for smooth motion graphics
 * - Responsive design with flex layout
 * - Color scheme inherited from CSS custom properties
 */

import { useEffect, useState } from 'react';
import '../../styles/bootstrap-animation.css';

export interface BootstrapAnimationProps {
  /**
   * Optional subtitle or status message
   * Default: "Initializing tenant infrastructure..."
   */
  message?: string;

  /**
   * Duration in ms before transitioning to next phase
   * Controls animation pacing
   */
  phaseDuration?: number;

  /**
   * Called when animation sequence completes
   * Used to trigger app initialization
   */
  onComplete?: () => void;
}

type BootstrapPhase = 'initialize' | 'sync' | 'ready';

/**
 * Animation phases for visual feedback:
 * 1. Initialize - Logo animation, initial data load
 * 2. Sync - Connecting to services, schema validation
 * 3. Ready - Final polish before handoff to app
 */
const PHASES: BootstrapPhase[] = ['initialize', 'sync', 'ready'];

export function BootstrapAnimation({
  message = 'Initializing tenant infrastructure...',
  phaseDuration = 1800,
  onComplete,
}: BootstrapAnimationProps) {
  const [phase, setPhase] = useState<BootstrapPhase>('initialize');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const progressPercent = Math.min(100, ((phaseIndex + 1) / PHASES.length) * 100);

  // Phase transition logic
  useEffect(() => {
    if (phaseIndex >= PHASES.length) {
      // All phases complete, notify parent
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setPhase(PHASES[phaseIndex + 1]);
      setPhaseIndex((prev) => prev + 1);
    }, phaseDuration);

    return () => clearTimeout(timer);
  }, [phaseIndex, phaseDuration, onComplete]);

  return (
    <div className="bootstrap-container">
      {/* Background gradient with animated overlay */}
      <div className="bootstrap-background">
        <div className="bootstrap-gradient-accent" />
      </div>

      {/* Central content area */}
      <div className="bootstrap-content">
        {/* Logo and branding */}
        <div className="bootstrap-logo-wrapper">
          <div className={`bootstrap-logo bootstrap-logo-${phase}`}>
            {/* Multi-tenant university system: Central UniAct with orbiting isolated universities */}
            <svg
              className="bootstrap-logo-svg"
              viewBox="0 0 280 280"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="bootstrap-uniact-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="45%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>

                <linearGradient id="bootstrap-uniact-shimmer" x1="-120" y1="0" x2="-20" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="45%" stopColor="rgba(255,255,255,0.04)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.95)" />
                  <stop offset="55%" stopColor="rgba(255,255,255,0.04)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  <animateTransform
                    attributeName="gradientTransform"
                    type="translate"
                    from="0 0"
                    to="260 0"
                    dur="2.8s"
                    repeatCount="indefinite"
                  />
                </linearGradient>
              </defs>

              {/* Central UniAct core platform hub */}
              <g className="bootstrap-core-center">
                {/* Outer hub rings */}
                <circle cx="140" cy="140" r="22" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.78" />
                <circle cx="140" cy="140" r="28" fill="none" stroke="currentColor" strokeWidth="1" className="bootstrap-core-ping" opacity="0.45" />

                {/* Main hub */}
                <circle cx="140" cy="140" r="17" fill="currentColor" className="bootstrap-core-dot" opacity="0.92" />

                {/* Center accent */}
                <circle cx="140" cy="140" r="6" fill="white" opacity="0.9" />

                {/* Pulsing halo around center */}
                <circle cx="140" cy="140" r="22" fill="none" stroke="currentColor" strokeWidth="1" className="bootstrap-core-halo" />

                {/* Directional nodes toward universities */}
                <g className="bootstrap-core-connectors" opacity="0.9">
                  <line x1="140" y1="116" x2="140" y2="112" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="140" cy="109" r="1.8" fill="currentColor" />
                  <line x1="164" y1="140" x2="168" y2="140" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="171" cy="140" r="1.8" fill="currentColor" />
                  <line x1="140" y1="164" x2="140" y2="168" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="140" cy="171" r="1.8" fill="currentColor" />
                  <line x1="116" y1="140" x2="112" y2="140" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="109" cy="140" r="1.8" fill="currentColor" />
                </g>
              </g>

              {/* Four isolated universities orbiting around UniAct center */}
              {/* University 1 - Top */}
              <g className="bootstrap-university university-1">
                <g transform="translate(140, 50)">
                  <path d="M -18 -12 L 0 -24 L 18 -12 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="-16" y="-12" width="32" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" className="bootstrap-university-building" rx="2" />
                  <line x1="-8" y1="-10" x2="-8" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="0" y1="-10" x2="0" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="8" y1="-10" x2="8" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="0" y1="-24" x2="0" y2="-28" stroke="currentColor" strokeWidth="1" />
                  <path d="M -3 -28 L 0 -31 L 3 -28 Z" fill="currentColor" opacity="0.8" />
                  <rect x="-12" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-4" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="4" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-12" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-4" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="4" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                </g>
              </g>

              {/* University 2 - Right */}
              <g className="bootstrap-university university-2">
                <g transform="translate(230, 140)">
                  <path d="M -18 -12 L 0 -24 L 18 -12 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="-16" y="-12" width="32" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" className="bootstrap-university-building" rx="2" />
                  <line x1="-8" y1="-10" x2="-8" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="0" y1="-10" x2="0" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="8" y1="-10" x2="8" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="0" y1="-24" x2="0" y2="-28" stroke="currentColor" strokeWidth="1" />
                  <path d="M -3 -28 L 0 -31 L 3 -28 Z" fill="currentColor" opacity="0.8" />
                  <rect x="-12" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-4" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="4" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-12" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-4" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="4" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                </g>
              </g>

              {/* University 3 - Bottom */}
              <g className="bootstrap-university university-3">
                <g transform="translate(140, 230)">
                  <path d="M -18 -12 L 0 -24 L 18 -12 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="-16" y="-12" width="32" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" className="bootstrap-university-building" rx="2" />
                  <line x1="-8" y1="-10" x2="-8" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="0" y1="-10" x2="0" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="8" y1="-10" x2="8" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="0" y1="-24" x2="0" y2="-28" stroke="currentColor" strokeWidth="1" />
                  <path d="M -3 -28 L 0 -31 L 3 -28 Z" fill="currentColor" opacity="0.8" />
                  <rect x="-12" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-4" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="4" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-12" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-4" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="4" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                </g>
              </g>

              {/* University 4 - Left */}
              <g className="bootstrap-university university-4">
                <g transform="translate(50, 140)">
                  <path d="M -18 -12 L 0 -24 L 18 -12 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="-16" y="-12" width="32" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" className="bootstrap-university-building" rx="2" />
                  <line x1="-8" y1="-10" x2="-8" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="0" y1="-10" x2="0" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="8" y1="-10" x2="8" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="0" y1="-24" x2="0" y2="-28" stroke="currentColor" strokeWidth="1" />
                  <path d="M -3 -28 L 0 -31 L 3 -28 Z" fill="currentColor" opacity="0.8" />
                  <rect x="-12" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-4" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="4" y="-6" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-12" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="-4" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                  <rect x="4" y="0" width="3" height="3" fill="currentColor" className="bootstrap-window" />
                </g>
              </g>

              {/* Connecting lines from center to universities */}
              <g className="bootstrap-connection-lines" opacity="0.35">
                <line className="bootstrap-connection-line" x1="140" y1="140" x2="140" y2="60" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4,4" />
                <line className="bootstrap-connection-line" x1="140" y1="140" x2="220" y2="140" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4,4" />
                <line className="bootstrap-connection-line" x1="140" y1="140" x2="140" y2="220" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4,4" />
                <line className="bootstrap-connection-line" x1="140" y1="140" x2="60" y2="140" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4,4" />
              </g>

              {/* Isolation rings showing data boundaries */}
              <g className="bootstrap-isolation-rings" opacity="0.15">
                <circle cx="140" cy="140" r="60" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3,3" />
                <circle cx="140" cy="140" r="85" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4,4" />
              </g>

              {/* UniAct brand rendered inside the animation core */}
              <g className="bootstrap-center-word-wrapper" aria-hidden="true">
                <g className="bootstrap-center-word" transform="translate(140, 116)">
                  <rect x="-80" y="-26" width="160" height="42" rx="20" className="bootstrap-uniact-badge" />
                  <g className="bootstrap-uniact-wordmark-base">
                    <text x="-58" y="8" className="bootstrap-uniact-letter" style={{ '--letter-index': 0 } as any}>U</text>
                    <text x="-35" y="8" className="bootstrap-uniact-letter" style={{ '--letter-index': 1 } as any}>n</text>
                    <text x="-17" y="8" className="bootstrap-uniact-letter" style={{ '--letter-index': 2 } as any}>i</text>
                    <text x="-2" y="8" className="bootstrap-uniact-letter" style={{ '--letter-index': 3 } as any}>A</text>
                    <text x="22" y="8" className="bootstrap-uniact-letter" style={{ '--letter-index': 4 } as any}>c</text>
                    <text x="43" y="8" className="bootstrap-uniact-letter" style={{ '--letter-index': 5 } as any}>t</text>
                  </g>
                  <g className="bootstrap-uniact-wordmark-shimmer">
                    <text x="-58" y="8" className="bootstrap-uniact-letter-shimmer">U</text>
                    <text x="-35" y="8" className="bootstrap-uniact-letter-shimmer">n</text>
                    <text x="-17" y="8" className="bootstrap-uniact-letter-shimmer">i</text>
                    <text x="-2" y="8" className="bootstrap-uniact-letter-shimmer">A</text>
                    <text x="22" y="8" className="bootstrap-uniact-letter-shimmer">c</text>
                    <text x="43" y="8" className="bootstrap-uniact-letter-shimmer">t</text>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>

        {/* Loading phases indicator */}
        <div className="bootstrap-phases">
          {PHASES.map((p) => (
            <div
              key={p}
              className={`bootstrap-phase-dot ${p === phase ? 'active' : ''} ${PHASES.indexOf(p) < phaseIndex ? 'completed' : ''}`}
              aria-current={p === phase}
            />
          ))}
        </div>

        {/* Status message with progressive text animation */}
        <div className="bootstrap-status">
          <p className="bootstrap-message">{message}</p>
          <div className="bootstrap-progress">
            <div
              className="bootstrap-progress-segments"
              role="progressbar"
              aria-valuenow={Math.round(progressPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ '--progress-width': `${progressPercent}%` } as any}
            />
          </div>
        </div>

        {/* Phase label */}
        <div className="bootstrap-phase-label">
          <span className="phase-text">
            {phase === 'initialize' && 'Initializing...'}
            {phase === 'sync' && 'Synchronizing...'}
            {phase === 'ready' && 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default BootstrapAnimation;
