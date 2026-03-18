import type { LucideIcon } from 'lucide-react';

export interface Faculty {
  id: number;
  name: string;
  description: string;
  fullDescription: string;
  programs: string[];
  students: number;
  icon: LucideIcon;
  color: string;
  type: string;
  years: number;
}

export interface HomeEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  description: string;
  icon: LucideIcon;
  attendees: number;
  images?: string[];
}
