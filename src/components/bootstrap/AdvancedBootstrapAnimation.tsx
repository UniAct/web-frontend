/**
 * ADVANCED BOOTSTRAP ANIMATION COMPONENT
 *
 * Enhanced variant supporting theme customization and advanced features.
 * Provides flexibility for different branding scenarios and role-based styling.
 *
 * Features:
 * - Custom color schemes and branding
 * - Progress tracking with custom steps
 * - Step-specific messages and animations
 * - Configurable timing and easing
 * - Support for custom icons/logos
 *
 * Best for:
 * - Multi-tenant with different brand colors
 * - Advanced progress reporting (5+ steps)
 * - Custom animation sequences
 * - Integration with real progress updates
 */

import { useState, useEffect, ReactNode } from 'react';
import '../../styles/bootstrap-animation.css';

export interface BootstrapStep {
  /**
   * Unique identifier for the step
   */
  id: string;

  /**
   * Display label for the step
   * e.g., "Initializing", "Syncing", "Ready"
   */
  label: string;

  /**
   * Progress message shown during this step
   * e.g., "Loading database schema..."
   */
  message: string;

  /**
   * Duration in ms for this specific step
   * If not provided, uses default stepDuration
   */
  duration?: number;
}

export interface AdvancedBootstrapAnimationProps {
  /**
   * Brand name/logo text to display
   * Default: "UniAct"
   */
  brandName?: string;

  /**
   * Custom SVG or icon element for logo
   * If provided, replaces default logo
   */
  logoElement?: ReactNode;

  /**
   * Bootstrap steps for progress tracking
   * Supports 3+ steps
   */
  steps?: BootstrapStep[];

  /**
   * Default duration per step in ms
   * Can be overridden per-step
   */
  stepDuration?: number;

  /**
   * Primary brand color (hex or CSS color)
   * Default: "#3b82f6" (blue)
   */
  primaryColor?: string;

  /**
   * Secondary accent color
   * Default: "#2563eb" (darker blue)
   */
  accentColor?: string;

  /**
   * Optional subtitle text
   */
  subtitle?: string;

  /**
   * Show detailed step indicators
   * Default: true
   */
  showSteps?: boolean;

  /**
   * Show animated progress bar
   * Default: true
   */
  showProgress?: boolean;

  /**
   * Called when animation sequence completes
   */
  onComplete?: () => void;

  /**
   * Called when each step changes
   * Useful for logging or external state management
   */
  onStepChange?: (stepId: string, stepIndex: number) => void;

  /**
   * Optional callback for real-time progress updates
   * Useful when you have actual backend progress data
   * Progress: 0-100
   */
  onProgressChange?: (progress: number) => void;
}

const DEFAULT_STEPS: BootstrapStep[] = [
  {
    id: 'initialize',
    label: 'Initializing',
    message: 'Loading tenant infrastructure...',
  },
  {
    id: 'sync',
    label: 'Synchronizing',
    message: 'Syncing database schema...',
  },
  {
    id: 'ready',
    label: 'Ready',
    message: 'Connecting to services...',
  },
];

export function AdvancedBootstrapAnimation({
  brandName = 'UniAct',
  logoElement,
  steps = DEFAULT_STEPS,
  stepDuration = 1800,
  primaryColor = '#3b82f6',
  accentColor = '#2563eb',
  subtitle,
  showSteps = true,
  showProgress = true,
  onComplete,
  onStepChange,
  onProgressChange,
}: AdvancedBootstrapAnimationProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStep = steps[stepIndex];
  const isComplete = stepIndex >= steps.length;

  // Step transition logic
  useEffect(() => {
    if (isComplete) {
      onComplete?.();
      return;
    }

    const currentStepDuration = currentStep?.duration || stepDuration;
    const timer = setTimeout(() => {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);

      if (nextIndex < steps.length) {
        onStepChange?.(steps[nextIndex].id, nextIndex);
      }
    }, currentStepDuration);

    return () => clearTimeout(timer);
  }, [stepIndex, steps, stepDuration, isComplete, onComplete, onStepChange]);

  // Progress bar animation
  useEffect(() => {
    const targetProgress = isComplete ? 100 : ((stepIndex + 1) / steps.length) * 100;
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 5, targetProgress);
        onProgressChange?.(newProgress);
        return newProgress;
      });
    }, 50);

    return () => clearInterval(progressTimer);
  }, [stepIndex, steps.length, isComplete, onProgressChange]);

  // CSS variables for dynamic colors
  const containerStyle = {
    '--bootstrap-primary': primaryColor,
    '--bootstrap-accent': accentColor,
  } as React.CSSProperties;

  return (
    <div className="bootstrap-container" style={containerStyle}>
      {/* Background gradient with animated overlay */}
      <div className="bootstrap-background">
        <div className="bootstrap-gradient-accent" />
      </div>

      {/* Central content area */}
      <div className="bootstrap-content">
        {/* Logo section */}
        <div className="bootstrap-logo-wrapper">
          <div className="bootstrap-logo bootstrap-logo-initialize">
            {logoElement ? (
              <div className="bootstrap-custom-logo">{logoElement}</div>
            ) : (
              <svg
                className="bootstrap-logo-svg"
                viewBox="0 0 120 120"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="55"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="bootstrap-ring-outer"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="bootstrap-ring-inner"
                />
                <circle cx="60" cy="60" r="8" fill="currentColor" className="bootstrap-dot-center" />
                <g className="bootstrap-rotator">
                  <circle cx="60" cy="25" r="4" fill="currentColor" />
                  <circle cx="95" cy="60" r="4" fill="currentColor" />
                  <circle cx="60" cy="95" r="4" fill="currentColor" />
                </g>
              </svg>
            )}
          </div>

          {/* Brand name */}
          <div className="bootstrap-brand">
            <h1 className="bootstrap-brand-text">{brandName}</h1>
            {subtitle && <p className="bootstrap-subtitle">{subtitle}</p>}
          </div>
        </div>

        {/* Steps indicator */}
        {showSteps && steps.length > 0 && (
          <div className="bootstrap-phases">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`bootstrap-phase-dot ${idx === stepIndex ? 'active' : ''} ${idx < stepIndex ? 'completed' : ''}`}
                aria-current={idx === stepIndex}
                title={step.label}
              />
            ))}
          </div>
        )}

        {/* Status message */}
        <div className="bootstrap-status">
          <p className="bootstrap-message">{currentStep?.message}</p>

          {/* Progress bar */}
          {showProgress && (
            <div className="bootstrap-progress">
              <div
                className="bootstrap-progress-bar"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          )}
        </div>

        {/* Phase label */}
        {currentStep && (
          <div className="bootstrap-phase-label">
            <span className="phase-text">{currentStep.label}...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdvancedBootstrapAnimation;
