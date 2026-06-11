/**
 * UniActBrandingPage - marketing/landing page for uniact.website
 *
 * LOCAL DEV ACCESS:
 *   http://localhost:5173  -> this page
 *
 * SUPERADMIN DEV ACCESS:
 *   http://public.uniact.local:5173  -> SuperAdmin panel
 *   (add "127.0.0.1  public.uniact.local" to C:\Windows\System32\drivers\etc\hosts)
 *
 * PRODUCTION:
 *   https://uniact.website        -> this page
 *   https://public.uniact.website -> SuperAdmin panel
 *   https://anu.uniact.website    -> ANU tenant
 */
import { AnimatePresence, motion, useInView, useScroll } from 'framer-motion';
import {
  BookOpen, Building2, Calendar, CheckCircle, CheckSquare,
  GraduationCap, LogIn, Mail, Megaphone, Palette, Paintbrush,
  Rocket, Shield, Sparkles, Users, Wifi, Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';

const navLinks = [
  { label: 'Features', id: 'features' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'About', id: 'about' },
  { label: 'Team', id: 'team' },
  { label: 'Contact', id: 'contact' },
];

const features = [
  { title: 'Smart Attendance (Online + Offline)', description: 'QR-based and offline-capable attendance for classrooms.', icon: CheckSquare },
  { title: 'Academic Registration & Enrollment', description: 'Conflict-free enrollment with real-time seat tracking via WebSockets.', icon: BookOpen },
  { title: 'Timetable & Room Scheduling', description: 'Drag-and-drop timetabling with room conflict detection.', icon: Calendar },
  { title: 'Grades & GPA Transcripts', description: 'Assessment grading, GPA calculation, and official transcript generation.', icon: GraduationCap },
  { title: 'Faculty & Programs Management', description: 'Multi-faculty structure, programs, levels, and regulation management.', icon: Building2 },
  { title: 'Student Management', description: 'Bulk import, profile management, and academic history tracking.', icon: Users },
  { title: 'RBAC Permissions', description: 'Granular role-based access control customizable per university.', icon: Shield },
  { title: 'Announcements & Events', description: 'University-wide announcements and event management with audience targeting.', icon: Megaphone },
  { title: 'University Branding', description: 'Custom colors, logos, campus images - each tenant has its own identity.', icon: Palette },
];

const team = [
  { name: 'Arsany Osama', program: 'Cyber Security', initials: 'AO' },
  { name: 'Mark Magdy', program: 'Cyber Security', initials: 'MM' },
  { name: 'Youssef Walid', program: 'Cyber Security', initials: 'YW' },
  { name: 'Ahmed Elseht', program: 'Cyber Security', initials: 'AE' },
  { name: 'Mostafa Elsayed', program: 'Intelligent Systems', initials: 'ME' },
  { name: 'Marwan Khalid', program: 'Intelligent Systems', initials: 'MK' },
  { name: 'Mohamed Ashraf', program: 'Intelligent Systems', initials: 'MA' },
];

const CONTACT_EMAIL = 'uniact.notification@gmail.com';

void Button;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function AnimatedCounter({ target, suffix = '', label, decimals = 0 }: {
  target: number; suffix?: string; label: string; decimals?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1600;
    const start = Date.now();
    const id = window.setInterval(() => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t >= 1) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-black text-slate-900">
        {value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
        {suffix}
      </div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}

function PhoneAttendanceMockup() {
  const states = [
    { title: 'Offline', detail: '3 sessions queued', color: '#ef4444', dot: 'bg-red-500' },
    { title: 'Reconnecting...', detail: 'Uploading 1 of 3', color: '#f59e0b', dot: 'bg-amber-400' },
    { title: 'Syncing...', detail: 'Uploading 2 of 3', color: '#3b82f6', dot: 'bg-blue-500' },
    { title: 'All synced', detail: '3 sessions uploaded', color: '#059669', dot: 'bg-emerald-500' },
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIdx((prev) => (prev + 1) % states.length), 1800);
    return () => window.clearInterval(id);
  }, [states.length]);

  const cur = states[idx];

  return (
    <div className="space-y-3 px-4">
      <div className="rounded-xl bg-white/10 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={cur.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: cur.color }} />
              <span className="text-sm font-bold text-white">{cur.title}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{cur.detail}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-emerald-400"
            animate={{ width: idx === 3 ? '100%' : idx === 2 ? '66%' : idx === 1 ? '33%' : '0%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </div>
      </div>
      {['CS301 Lecture', 'Security Lab', 'AI Seminar'].map((item, i) => (
        <div key={item} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5">
          <span className="text-xs text-slate-300">{item}</span>
          <span className="text-xs font-semibold" style={{ color: i === 0 ? '#34d399' : '#94a3b8' }}>
            {i === 0 ? 'Ready' : 'Queued'}
          </span>
        </div>
      ))}
    </div>
  );
}

export function UniActBrandingPage() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => scrollY.on('change', (v) => setIsScrolled(v > 50)), [scrollY]);

  return (
    <div className="uniact-branding min-h-screen bg-white text-slate-900">
      <style>
        {`
          .uniact-branding { min-height: 100vh; background: #fff; color: #0f172a; }
          .uniact-branding * { box-sizing: border-box; }
          .uniact-branding .bg-white { background-color: #fff; }
          .uniact-branding .bg-white\\/90 { background-color: rgba(255, 255, 255, 0.9); }
          .uniact-branding .bg-slate-50 { background-color: #f8fafc; }
          .uniact-branding .bg-slate-900 { background-color: #0f172a; }
          .uniact-branding .bg-blue-50 { background-color: #eff6ff; }
          .uniact-branding .bg-blue-600 { background-color: #2563eb; }
          .uniact-branding .bg-emerald-400 { background-color: #34d399; }
          .uniact-branding .bg-emerald-500\\/15 { background-color: rgba(16, 185, 129, 0.15); }
          .uniact-branding .bg-indigo-500\\/10 { background-color: rgba(99, 102, 241, 0.1); }
          .uniact-branding .bg-white\\/5 { background-color: rgba(255, 255, 255, 0.05); }
          .uniact-branding .bg-white\\/10 { background-color: rgba(255, 255, 255, 0.1); }
          .uniact-branding .text-transparent { color: transparent; }
          .uniact-branding .text-white { color: #fff; }
          .uniact-branding .text-white\\/80 { color: rgba(255, 255, 255, 0.8); }
          .uniact-branding .text-slate-900 { color: #0f172a; }
          .uniact-branding .text-slate-600 { color: #475569; }
          .uniact-branding .text-slate-500 { color: #64748b; }
          .uniact-branding .text-slate-400 { color: #94a3b8; }
          .uniact-branding .text-slate-300 { color: #cbd5e1; }
          .uniact-branding .text-blue-600 { color: #2563eb; }
          .uniact-branding .text-blue-400 { color: #60a5fa; }
          .uniact-branding .text-indigo-300 { color: #a5b4fc; }
          .uniact-branding .text-indigo-700 { color: #4338ca; }
          .uniact-branding .text-emerald-600 { color: #059669; }
          .uniact-branding .text-emerald-500 { color: #10b981; }
          .uniact-branding .text-emerald-400 { color: #34d399; }
          .uniact-branding .text-emerald-700 { color: #047857; }
          .uniact-branding .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
          .uniact-branding .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
          .uniact-branding .from-blue-400 { --tw-gradient-from: #60a5fa; --tw-gradient-to: rgba(96, 165, 250, 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
          .uniact-branding .from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-to: rgba(59, 130, 246, 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
          .uniact-branding .to-violet-400 { --tw-gradient-to: #a78bfa; }
          .uniact-branding .to-indigo-500 { --tw-gradient-to: #6366f1; }
          .uniact-branding .bg-clip-text { -webkit-background-clip: text; background-clip: text; }
          .uniact-branding .border { border-width: 1px; border-style: solid; }
          .uniact-branding .border-2 { border-width: 2px; border-style: solid; }
          .uniact-branding .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
          .uniact-branding .border-y { border-top-width: 1px; border-bottom-width: 1px; border-top-style: solid; border-bottom-style: solid; }
          .uniact-branding .border-transparent { border-color: transparent; }
          .uniact-branding .border-slate-100 { border-color: #f1f5f9; }
          .uniact-branding .border-slate-200 { border-color: #e2e8f0; }
          .uniact-branding .border-blue-100 { border-color: #dbeafe; }
          .uniact-branding .border-indigo-200 { border-color: #c7d2fe; }
          .uniact-branding .border-emerald-200 { border-color: #a7f3d0; }
          .uniact-branding .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1); }
          .uniact-branding .border-white\\/15 { border-color: rgba(255, 255, 255, 0.15); }
          .uniact-branding .border-white\\/20 { border-color: rgba(255, 255, 255, 0.2); }
          .uniact-branding .border-indigo-500\\/30 { border-color: rgba(99, 102, 241, 0.3); }
          .uniact-branding .rounded-md { border-radius: 0.375rem; }
          .uniact-branding .rounded-lg { border-radius: 0.5rem; }
          .uniact-branding .rounded-xl { border-radius: 0.75rem; }
          .uniact-branding .rounded-2xl { border-radius: 1rem; }
          .uniact-branding .rounded-3xl { border-radius: 1.5rem; }
          .uniact-branding .rounded-full { border-radius: 9999px; }
          .uniact-branding .shadow-sm { box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06); }
          .uniact-branding .shadow-md { box-shadow: 0 4px 10px rgba(15, 23, 42, 0.1); }
          .uniact-branding .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25); }
          .uniact-branding .backdrop-blur-lg { backdrop-filter: blur(16px); }
          .uniact-branding .mx-auto { margin-left: auto; margin-right: auto; }
          .uniact-branding .max-w-xl { max-width: 36rem; }
          .uniact-branding .max-w-2xl { max-width: 42rem; }
          .uniact-branding .max-w-3xl { max-width: 48rem; }
          .uniact-branding .max-w-4xl { max-width: 56rem; }
          .uniact-branding .max-w-7xl { max-width: 80rem; }
          .uniact-branding .min-h-screen { min-height: 100vh; }
          .uniact-branding .min-h-\\[calc\\(100vh-12rem\\)\\] { min-height: calc(100vh - 12rem); }
          .uniact-branding .fixed { position: fixed; }
          .uniact-branding .relative { position: relative; }
          .uniact-branding .absolute { position: absolute; }
          .uniact-branding .inset-0 { inset: 0; }
          .uniact-branding .inset-x-0 { left: 0; right: 0; }
          .uniact-branding .top-0 { top: 0; }
          .uniact-branding .top-7 { top: 1.75rem; }
          .uniact-branding .left-\\[calc\\(16\\.66\\%\\+2rem\\)\\] { left: calc(16.66% + 2rem); }
          .uniact-branding .right-\\[calc\\(16\\.66\\%\\+2rem\\)\\] { right: calc(16.66% + 2rem); }
          .uniact-branding .z-10 { z-index: 10; }
          .uniact-branding .z-50 { z-index: 50; }
          .uniact-branding .pointer-events-none { pointer-events: none; }
          .uniact-branding .overflow-hidden { overflow: hidden; }
          .uniact-branding .block { display: block; }
          .uniact-branding .inline-flex { display: inline-flex; }
          .uniact-branding .flex { display: flex; }
          .uniact-branding .grid { display: grid; }
          .uniact-branding .hidden { display: none; }
          .uniact-branding .flex-col { flex-direction: column; }
          .uniact-branding .flex-wrap { flex-wrap: wrap; }
          .uniact-branding .items-center { align-items: center; }
          .uniact-branding .items-start { align-items: flex-start; }
          .uniact-branding .justify-center { justify-content: center; }
          .uniact-branding .justify-between { justify-content: space-between; }
          .uniact-branding .shrink-0 { flex-shrink: 0; }
          .uniact-branding .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .uniact-branding .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .uniact-branding .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .uniact-branding .grid-cols-7 { grid-template-columns: repeat(7, minmax(0, 1fr)); }
          .uniact-branding .gap-1\\.5 { gap: 0.375rem; }
          .uniact-branding .gap-2 { gap: 0.5rem; }
          .uniact-branding .gap-2\\.5 { gap: 0.625rem; }
          .uniact-branding .gap-3 { gap: 0.75rem; }
          .uniact-branding .gap-4 { gap: 1rem; }
          .uniact-branding .gap-5 { gap: 1.25rem; }
          .uniact-branding .gap-6 { gap: 1.5rem; }
          .uniact-branding .gap-8 { gap: 2rem; }
          .uniact-branding .gap-14 { gap: 3.5rem; }
          .uniact-branding .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
          .uniact-branding .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
          .uniact-branding .-space-x-1\\.5 > :not([hidden]) ~ :not([hidden]) { margin-left: -0.375rem; }
          .uniact-branding .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          .uniact-branding .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
          .uniact-branding .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .uniact-branding .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
          .uniact-branding .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .uniact-branding .px-7 { padding-left: 1.75rem; padding-right: 1.75rem; }
          .uniact-branding .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
          .uniact-branding .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
          .uniact-branding .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .uniact-branding .py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
          .uniact-branding .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
          .uniact-branding .py-3\\.5 { padding-top: 0.875rem; padding-bottom: 0.875rem; }
          .uniact-branding .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
          .uniact-branding .py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
          .uniact-branding .py-14 { padding-top: 3.5rem; padding-bottom: 3.5rem; }
          .uniact-branding .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
          .uniact-branding .pt-28 { padding-top: 7rem; }
          .uniact-branding .pb-3 { padding-bottom: 0.75rem; }
          .uniact-branding .pb-4 { padding-bottom: 1rem; }
          .uniact-branding .pb-20 { padding-bottom: 5rem; }
          .uniact-branding .p-3 { padding: 0.75rem; }
          .uniact-branding .p-3\\.5 { padding: 0.875rem; }
          .uniact-branding .p-4 { padding: 1rem; }
          .uniact-branding .p-5 { padding: 1.25rem; }
          .uniact-branding .p-6 { padding: 1.5rem; }
          .uniact-branding .p-10 { padding: 2.5rem; }
          .uniact-branding .mt-0\\.5 { margin-top: 0.125rem; }
          .uniact-branding .mt-1 { margin-top: 0.25rem; }
          .uniact-branding .mt-1\\.5 { margin-top: 0.375rem; }
          .uniact-branding .mt-2 { margin-top: 0.5rem; }
          .uniact-branding .mt-3 { margin-top: 0.75rem; }
          .uniact-branding .mt-4 { margin-top: 1rem; }
          .uniact-branding .mt-5 { margin-top: 1.25rem; }
          .uniact-branding .mt-6 { margin-top: 1.5rem; }
          .uniact-branding .mt-7 { margin-top: 1.75rem; }
          .uniact-branding .mt-8 { margin-top: 2rem; }
          .uniact-branding .mt-14 { margin-top: 3.5rem; }
          .uniact-branding .mb-1 { margin-bottom: 0.25rem; }
          .uniact-branding .mb-3 { margin-bottom: 0.75rem; }
          .uniact-branding .mb-4 { margin-bottom: 1rem; }
          .uniact-branding .mb-5 { margin-bottom: 1.25rem; }
          .uniact-branding .text-center { text-align: center; }
          .uniact-branding .text-\\[9px\\] { font-size: 9px; line-height: 1.15; }
          .uniact-branding .text-\\[10px\\] { font-size: 10px; line-height: 1.15; }
          .uniact-branding .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .uniact-branding .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .uniact-branding .text-base { font-size: 1rem; line-height: 1.5rem; }
          .uniact-branding .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .uniact-branding .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .uniact-branding .text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .uniact-branding .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
          .uniact-branding .text-5xl { font-size: 3rem; line-height: 1; }
          .uniact-branding .font-semibold { font-weight: 600; }
          .uniact-branding .font-bold { font-weight: 700; }
          .uniact-branding .font-black { font-weight: 900; }
          .uniact-branding .uppercase { text-transform: uppercase; }
          .uniact-branding .tracking-widest { letter-spacing: 0.1em; }
          .uniact-branding .leading-\\[1\\.05\\] { line-height: 1.05; }
          .uniact-branding .leading-tight { line-height: 1.25; }
          .uniact-branding .leading-relaxed { line-height: 1.625; }
          .uniact-branding .h-0\\.5 { height: 0.125rem; }
          .uniact-branding .h-1\\.5 { height: 0.375rem; }
          .uniact-branding .h-2\\.5 { height: 0.625rem; }
          .uniact-branding .h-3\\.5 { height: 0.875rem; }
          .uniact-branding .h-5 { height: 1.25rem; }
          .uniact-branding .h-6 { height: 1.5rem; }
          .uniact-branding .h-7 { height: 1.75rem; }
          .uniact-branding .h-8 { height: 2rem; }
          .uniact-branding .h-9 { height: 2.25rem; }
          .uniact-branding .h-11 { height: 2.75rem; }
          .uniact-branding .h-14 { height: 3.5rem; }
          .uniact-branding .h-16 { height: 4rem; }
          .uniact-branding .h-full { height: 100%; }
          .uniact-branding .w-1\\.5 { width: 0.375rem; }
          .uniact-branding .w-2\\.5 { width: 0.625rem; }
          .uniact-branding .w-3\\.5 { width: 0.875rem; }
          .uniact-branding .w-4 { width: 1rem; }
          .uniact-branding .w-5 { width: 1.25rem; }
          .uniact-branding .w-6 { width: 1.5rem; }
          .uniact-branding .w-7 { width: 1.75rem; }
          .uniact-branding .w-8 { width: 2rem; }
          .uniact-branding .w-9 { width: 2.25rem; }
          .uniact-branding .w-11 { width: 2.75rem; }
          .uniact-branding .w-14 { width: 3.5rem; }
          .uniact-branding .w-16 { width: 4rem; }
          .uniact-branding .w-full { width: 100%; }
          @media (min-width: 640px) {
            .uniact-branding .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }
          @media (min-width: 768px) {
            .uniact-branding .md\\:block { display: block; }
            .uniact-branding .md\\:flex { display: flex; }
            .uniact-branding .md\\:flex-row { flex-direction: row; }
            .uniact-branding .md\\:items-center { align-items: center; }
            .uniact-branding .md\\:justify-between { justify-content: space-between; }
            .uniact-branding .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .uniact-branding .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .uniact-branding .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .uniact-branding .md\\:text-5xl { font-size: 3rem; line-height: 1; }
            .uniact-branding .md\\:text-6xl { font-size: 3.75rem; line-height: 1; }
          }
          @media (min-width: 1024px) {
            .uniact-branding .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .uniact-branding .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .uniact-branding .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .uniact-branding .lg\\:grid-cols-\\[1\\.1fr_0\\.9fr\\] { grid-template-columns: 1.1fr 0.9fr; }
            .uniact-branding .lg\\:text-7xl { font-size: 4.5rem; line-height: 1; }
          }
        `}
      </style>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-lg' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button onClick={() => scrollToSection('hero')} className="flex items-center gap-3">
            <img src="/favicon.png" className="h-8 w-8 rounded-lg" alt="UniAct" />
            <span className={`text-lg font-bold ${isScrolled ? 'text-slate-900' : 'text-white'}`}>UniAct</span>
          </button>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-sm transition-colors ${
                  isScrolled ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollToSection('contact')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Get a Demo
          </button>
        </div>
      </motion.nav>

      <section id="hero" className="relative min-h-screen overflow-hidden bg-slate-900">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 65%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-28">
          <div className="grid min-h-[calc(100vh-12rem)] items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                  Graduation Project - ANU 2025-2026
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="mt-6 text-5xl font-black leading-[1.05] text-white md:text-6xl lg:text-7xl">
                The University Management Platform
                <span className="block bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Built for the Future
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
                UniAct gives every university a fully branded, multi-tenant academic system - enrollment, attendance, scheduling, and more - all under your own domain.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => scrollToSection('contact')}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500"
                >
                  Request a Demo
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/15"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  See Features
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-5">
                {[
                  { icon: Shield, label: 'Multi-tenant isolated' },
                  { icon: Wifi, label: 'Offline-capable' },
                  { icon: Zap, label: 'Real-time WebSockets' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}>
                <div
                  className="rounded-2xl border border-white/10 p-5 shadow-2xl"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">UniAct Dashboard</div>
                        <div className="text-xs text-slate-500">Institution command center</div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      ['2,847', 'Students'],
                      ['143', 'Staff'],
                      ['18', 'Programs'],
                    ].map(([val, lbl], i) => (
                      <motion.div
                        key={lbl}
                        animate={{ scale: [1, 1.015, 1] }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
                        className="rounded-xl p-3"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <div className="text-base font-black text-white">{val}</div>
                        <div className="mt-0.5 text-[10px] text-slate-500">{lbl}</div>
                        <div className="mt-1.5 text-[10px] font-bold text-emerald-400">+12%</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Live Attendance</span>
                      <motion.span
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                        className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400"
                      >
                        LIVE
                      </motion.span>
                    </div>
                    <div className="flex -space-x-1.5">
                      {['AO', 'MM', 'YW', 'AE', 'ME', 'MK'].map((init, i) => (
                        <div
                          key={init}
                          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 text-[9px] font-bold text-white"
                          style={{ background: i % 2 === 0 ? '#3b82f6' : '#6366f1' }}
                        >
                          {init}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-7 gap-1.5">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                      <div
                        key={`${d}-${i}`}
                        className="rounded-lg py-2 text-center text-[9px] font-bold"
                        style={{
                          background: i === 1 || i === 3 ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'rgba(255,255,255,0.04)',
                          color: i === 1 || i === 3 ? '#fff' : '#475569',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 md:grid-cols-4">
          <AnimatedCounter target={14000} suffix="+" label="Students" />
          <AnimatedCounter target={340} suffix="+" label="Staff Members" />
          <AnimatedCounter target={9} label="Core Modules" />
          <AnimatedCounter target={99.9} suffix="%" label="Uptime" decimals={1} />
        </div>
      </section>

      <motion.section
        id="features"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="bg-white px-5 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div variants={fadeUp}>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Platform Capabilities</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900 md:text-5xl">Everything a modern university needs</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-500">
              UniAct unifies academic operations, staff workflows, and student services in a single tenant-isolated platform.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="how-it-works"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="bg-slate-50 px-5 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div variants={fadeUp} className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Launch Path</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900 md:text-5xl">From contract to campus launch</h2>
          </motion.div>

          <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="absolute left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] top-7 hidden h-0.5 bg-gradient-to-r from-blue-200 via-indigo-300 to-violet-200 md:block" />

            {[
              { title: 'Sign a Contract', text: 'Contact the UniAct team and onboard your university.', icon: LogIn, num: '01' },
              { title: 'Customize Your Portal', text: 'Set your brand colors, logo, campus images, and subdomain.', icon: Paintbrush, num: '02' },
              { title: 'Go Live', text: 'Your portal is live at', icon: Rocket, num: '03', hasCode: true },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.title} variants={fadeUp} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-md">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>

                  <span className="mb-1 text-xs font-black uppercase tracking-widest text-slate-300">{step.num}</span>
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {step.text}{' '}
                    {step.hasCode && (
                      <code className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-600">
                        anu.uniact.website
                      </code>
                    )}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="bg-white px-5 py-20"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <motion.div variants={fadeUp}>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Offline Attendance</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              Attendance works even without internet
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-500">
              Staff take attendance from the mobile Flutter app, queue sessions locally, and sync everything back to UniAct when connectivity returns.
            </p>
            <div className="mt-7 space-y-4">
              {[
                'QR code scanning - no paper required',
                'Sessions queue locally when offline',
                'Auto-sync when connection restores',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex justify-center">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="relative overflow-hidden rounded-3xl shadow-2xl"
              style={{
                width: 260,
                height: 400,
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-slate-500">9:41</span>
                <div className="flex gap-1">
                  <div className="h-1.5 w-4 rounded-full bg-white/20" />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="px-4 pb-3 text-sm font-semibold text-white">Attendance - CS301</div>
              <PhoneAttendanceMockup />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="about"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="bg-slate-50 px-5 py-20"
      >
        <div className="mx-auto max-w-3xl">
          <motion.div
            variants={fadeUp}
            className="rounded-3xl p-px"
            style={{ background: 'linear-gradient(135deg, #bfdbfe, #c7d2fe, #ddd6fe)' }}
          >
            <div className="rounded-3xl bg-white p-10 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">About UniAct</h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                UniAct is a graduation project for the academic year 2025-2026 at{' '}
                <span className="font-semibold text-blue-600">Alexandria National University (ANU)</span>.
              </p>
              <p className="mt-3 leading-relaxed text-slate-600">
                Built by a cross-disciplinary team of 7 members from Cyber Security and Intelligent Systems programs.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
                  Cyber Security - 4 members
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
                  Intelligent Systems - 3 members
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="team"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="bg-white px-5 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div variants={fadeUp} className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Project Team</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900 md:text-5xl">Built by ANU students</h2>
          </motion.div>

          <motion.div variants={stagger} className="mt-14 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {team.map((member) => {
              const isCyber = member.program === 'Cyber Security';
              return (
                <motion.div
                  key={member.name}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
                >
                  <div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-black text-white"
                    style={{
                      background: isCyber
                        ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                        : 'linear-gradient(135deg, #059669, #0d9488)',
                      boxShadow: isCyber
                        ? '0 4px 14px rgba(79,70,229,0.25)'
                        : '0 4px 14px rgba(5,150,105,0.25)',
                    }}
                  >
                    {member.initials}
                  </div>
                  <h3 className="font-bold text-slate-900">{member.name}</h3>
                  <p className="mt-1 text-xs font-semibold" style={{ color: isCyber ? '#4f46e5' : '#059669' }}>
                    {member.program}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="contact"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="bg-slate-900 px-5 py-20"
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-xs font-semibold text-slate-300"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Start onboarding
          </motion.span>
          <motion.h2 variants={fadeUp} className="mt-6 text-4xl font-black text-white md:text-5xl">
            Bring UniAct to Your University
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-xl text-slate-400">
            We'd love to hear from you. Reach out to start the onboarding process.
          </motion.p>
          <motion.a
            variants={fadeUp}
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-8 inline-flex items-center gap-2.5 rounded-xl border border-white/15 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <Mail className="h-5 w-5 text-blue-400" />
            {CONTACT_EMAIL}
          </motion.a>
          <motion.div variants={fadeUp} className="mt-6">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-500"
            >
              Send an Email
            </a>
          </motion.div>
        </div>
      </motion.section>

      <footer className="bg-slate-900 px-5 py-10 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="UniAct" className="h-9 w-9 rounded-xl" />
            <div>
              <p className="font-bold text-white">UniAct</p>
              <p className="text-sm text-slate-500">Academic excellence, digitized.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            {navLinks.map((link) => (
              <button key={link.id} onClick={() => scrollToSection(link.id)} className="transition-colors hover:text-white">
                {link.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-600">(c) 2025-2026 UniAct - Alexandria National University</p>
        </div>
      </footer>
    </div>
  );
}
