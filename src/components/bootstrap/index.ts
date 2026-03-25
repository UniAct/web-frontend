/**
 * Bootstrap Animation Component Library
 *
 * Professional loading animation for UniAct multi-tenant application.
 * Includes smooth transitions and phase-based feedback.
 *
 * Usage:
 * ```tsx
 * import { BootstrapAnimation } from '@/components/bootstrap';
 *
 * export function App() {
 *   return (
 *     <BootstrapAnimation
 *       message="Initializing tenant infrastructure..."
 *       phaseDuration={1800}
 *       onComplete={() => console.log('Bootstrap complete')}
 *     />
 *   );
 * }
 * ```
 */

export * from './BootstrapAnimation';
