import { useState } from 'react';
import type { FormEvent } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { AuthService } from '../api';
import type { LoginResponse } from '../api';
import type { UserRole } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface SuperAdminLoginPageProps {
  onLogin: (email: string, role: UserRole, session?: LoginResponse) => void;
}

/**
 * Signature graphic: the open book (left half of the UniAct mark) feeding a
 * single radial neural network whose center sits directly beneath the logo —
 * so the wordmark visually reads as the source of the graph, not a sticker
 * on top of it. Each spoke carries one slow "comet" of light; a faint static
 * line keeps the structure legible even when nothing is travelling along it.
 * Coordinates are authored on a 0–1000 / 0–700 canvas and the svg uses
 * `xMidYMid slice`, so the composition holds at any viewport width.
 */
const HUB = { x: 500, y: 150 };
const NODES = [
  { x: 500, y: 40 },   // straight up — visually anchors to the logo
  { x: 250, y: 90 },
  { x: 760, y: 95 },
  { x: 120, y: 230 },
  { x: 880, y: 250 },
  { x: 90, y: 410 },
  { x: 900, y: 430 },
  { x: 230, y: 560 },
  { x: 720, y: 590 },
  { x: 500, y: 640 },
];

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function SuperAdminLoginPage({ onLogin }: SuperAdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error('Enter your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await AuthService.loginSuperAdmin(email, password);
      onLogin(email, 'superadmin', session);
    } catch (error: any) {
      toast.error(error?.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="uniact-login relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        .uniact-login {
          background: #060b1c;
          font-family: 'Inter', sans-serif;
        }
        .uniact-login .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }

        /* slow-drifting mesh of light, full bleed */
        .uniact-mesh {
          position: absolute;
          inset: -10%;
          background:
            radial-gradient(36% 30% at 14% 18%, rgba(45,212,191,0.14), transparent 65%),
            radial-gradient(40% 34% at 88% 10%, rgba(168,85,247,0.14), transparent 65%),
            radial-gradient(55% 45% at 50% 100%, rgba(37,99,235,0.20), transparent 60%);
          animation: uniact-mesh-drift 26s ease-in-out infinite alternate;
        }
        @keyframes uniact-mesh-drift {
          0%   { transform: translate3d(0,0,0) scale(1); }
          100% { transform: translate3d(-1.5%, 1.5%, 0) scale(1.04); }
        }

        .uniact-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        /* the signature graphic now spans the full viewport, behind the card */
        .uniact-graph {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.6;
        }
        .uniact-line-static {
          stroke: rgba(148, 178, 255, 0.16);
          stroke-width: 1;
          fill: none;
        }
        .uniact-line-comet {
          stroke: url(#uniact-line-grad);
          stroke-width: 1.4;
          fill: none;
          stroke-linecap: round;
          animation-name: uniact-comet;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes uniact-comet {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -1000; }
        }
        .uniact-node {
          fill: #5eead4;
          filter: drop-shadow(0 0 6px rgba(94,234,212,0.8));
          animation: uniact-pulse ease-in-out infinite;
        }
        @keyframes uniact-pulse {
          0%, 100% { opacity: 0.5;  transform: scale(0.9); }
          50%      { opacity: 0.95; transform: scale(1.15); }
        }
        .uniact-hub {
          animation: uniact-hub-breathe 5s ease-in-out infinite;
          transform-origin: 500px 150px;
        }
        @keyframes uniact-hub-breathe {
          0%, 100% { opacity: 0.6; transform: scale(0.96); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }
        .uniact-page {
          stroke: rgba(148, 197, 255, 0.22);
          stroke-width: 1.4;
          fill: none;
          stroke-linecap: round;
        }

        /* ambient floating particles, slow and sparse */
        .uniact-particle {
          position: absolute;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(94,234,212,0.85), transparent 70%);
          animation: uniact-float ease-in-out infinite;
        }
        @keyframes uniact-float {
          0%, 100% { transform: translateY(0); opacity: 0.18; }
          50%      { transform: translateY(-14px); opacity: 0.5; }
        }

        /* entrance choreography */
        .uniact-rise {
          opacity: 0;
          animation: uniact-rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes uniact-rise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .uniact-halo {
          position: absolute;
          inset: -14px;
          border-radius: 9999px;
          background: conic-gradient(from 0deg, #2dd4bf, #2563eb, #a855f7, #2dd4bf);
          filter: blur(14px);
          opacity: 0.5;
          animation: uniact-spin 14s linear infinite;
        }
        @keyframes uniact-spin {
          to { transform: rotate(360deg); }
        }

        .uniact-input:focus-within {
          box-shadow: 0 0 0 3px rgba(45,212,191,0.25);
        }

        .uniact-btn {
          position: relative;
          overflow: hidden;
          background: linear-gradient(120deg, #2dd4bf, #2563eb 55%, #7c3aed);
          background-size: 220% 220%;
          transition: background-position 0.6s ease, transform 0.15s ease;
        }
        .uniact-btn:hover {
          background-position: 100% 0%;
          transform: translateY(-1px);
        }
        .uniact-btn:active { transform: translateY(0); }
        .uniact-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -60%;
          width: 35%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg);
          animation: uniact-shine 5.5s ease-in-out infinite;
        }
        @keyframes uniact-shine {
          0%   { left: -60%; }
          30%  { left: 130%; }
          100% { left: 130%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .uniact-mesh, .uniact-line-comet, .uniact-node, .uniact-hub,
          .uniact-particle, .uniact-rise, .uniact-halo, .uniact-btn::after {
            animation: none !important;
          }
          .uniact-rise { opacity: 1; transform: none; }
        }
      `}</style>

      {/* ambient layers */}
      <div className="uniact-mesh" />
      <div className="uniact-grid" />

      {/* signature: one network, rooted under the logo, reaching the full canvas */}
      <svg
        className="uniact-graph"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="uniact-line-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <radialGradient id="uniact-hub-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* open book, quiet, lower-left */}
        <path className="uniact-page" d="M70 470 C 140 440, 200 440, 250 465 L 250 580 C 200 555, 140 555, 70 585 Z" />
        <path className="uniact-page" d="M250 465 C 300 440, 360 440, 430 470 L 430 585 C 360 555, 300 555, 250 580 Z" />

        {/* static structure, always faintly visible */}
        {NODES.map((n, i) => (
          <line key={`s${i}`} className="uniact-line-static" x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y} />
        ))}

        {/* travelling comets, one per spoke, paced by distance so speed feels consistent */}
        {NODES.map((n, i) => {
          const len = Math.round(dist(HUB, n));
          const duration = Math.max(5, Math.round(len / 35));
          return (
            <line
              key={`c${i}`}
              className="uniact-line-comet"
              x1={HUB.x}
              y1={HUB.y}
              x2={n.x}
              y2={n.y}
              style={{
                strokeDasharray: `10 ${len}`,
                animationDuration: `${duration}s`,
                animationDelay: `${i * 0.9}s`,
                opacity: 0.6,
              }}
            />
          );
        })}

        {/* AI core, sitting just beneath the logo */}
        <circle className="uniact-hub" cx={HUB.x} cy={HUB.y} r="30" fill="url(#uniact-hub-grad)" />
        <circle cx={HUB.x} cy={HUB.y} r="5" fill="#ffffff" />

        {NODES.map((n, i) => (
          <circle
            key={`n${i}`}
            className="uniact-node"
            cx={n.x}
            cy={n.y}
            r={i % 3 === 0 ? 5.5 : 4}
            style={{ animationDuration: `${4.5 + (i % 4)}s`, animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </svg>

      {/* a few sparse floating particles for depth, kept out of the card's path */}
      <span className="uniact-particle" style={{ width: 5, height: 5, top: '20%', left: '10%', animationDuration: '9s' }} />
      <span className="uniact-particle" style={{ width: 4, height: 4, top: '72%', left: '16%', animationDuration: '11s', animationDelay: '1.5s' }} />
      <span className="uniact-particle" style={{ width: 4, height: 4, top: '40%', left: '85%', animationDuration: '10s', animationDelay: '0.6s' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* logo block — the literal root of the network above */}
        <div className="uniact-rise mb-9 flex flex-col items-center text-center" style={{ animationDelay: '0.05s' }}>
          <div className="relative mb-5 h-16 w-16">
            <div className="uniact-halo" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,55,0.4)]">
              <img src="/favicon.png" alt="UniAct" className="h-11 w-11 rounded-xl object-contain" />
            </div>
          </div>
          <p className="font-display text-xl font-semibold tracking-tight text-white">UniAct</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white">Unified University Action Ecosystem</p>
        </div>

        {/* card — solid, opaque, colors set explicitly so they can't inherit a dark theme */}
        <div
          className="uniact-rise overflow-hidden rounded-2xl border"
          style={{
            animationDelay: '0.18s',
            backgroundColor: '#ffffff',
            borderColor: 'rgba(15, 23, 42, 0.08)',
            boxShadow: '0 30px 70px -20px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ padding: '28px 28px 8px' }}>
            <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em', color: '#0f172a' }}>
              Welcome back
            </h2>
            <p style={{ marginTop: '4px', fontSize: '0.875rem', color: '#64748b' }}>Sign in to continue.</p>
          </div>

          <div style={{ padding: '16px 28px 28px' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="uniact-rise uniact-input rounded-md transition-shadow" style={{ animationDelay: '0.26s' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@domain.com"
                  autoComplete="email"
                  className="h-12"
                  style={{ color: '#0f172a' }}
                />
              </div>
              <div className="uniact-rise uniact-input rounded-md transition-shadow" style={{ animationDelay: '0.32s' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-12"
                  style={{ color: '#0f172a' }}
                />
              </div>
              <Button
                type="submit"
                className="uniact-rise uniact-btn h-12 w-full border-0 text-base font-semibold text-white shadow-lg shadow-blue-900/20"
                style={{ animationDelay: '0.38s' }}
                disabled={isSubmitting}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </span>
              </Button>
            </form>
          </div>
        </div>

        <p className="uniact-rise mt-6 text-center text-xs text-white" style={{ animationDelay: '0.44s' }}>
          Need help signing in? Contact your administrator.
        </p>
      </div>
    </main>
  );
}
