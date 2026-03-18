import {
  Briefcase,
  Building2,
  FlaskConical,
  Microscope,
  Palette,
  PartyPopper,
  Rocket,
} from 'lucide-react';
import type { Faculty, HomeEvent } from './types';

export const homeHeroImages: string[] = [
  'https://images.unsplash.com/photo-1632834380561-d1e05839a33a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU5ODc1NjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1722248540590-ba8b7af1d7b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwbGlicmFyeSUyMHN0dWR5aW5nfGVufDF8fHx8MTc1OTk3MDA4M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1738949538943-e54722a44ffc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZ3JhZHVhdGlvbiUyMGNlcmVtb255fGVufDF8fHx8MTc1OTk0Mjc4MXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1713721332588-122f666e2525?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1wdXMlMjBidWlsZGluZyUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NTk5NjY2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
];

export const homeFaculties: Faculty[] = [
  {
    id: 1,
    name: 'Faculty of Engineering',
    description: 'Leading innovation in technology and engineering solutions',
    fullDescription:
      'Our Faculty of Engineering is at the forefront of technological innovation, offering cutting-edge programs that prepare students for the challenges of tomorrow. With state-of-the-art laboratories and world-renowned faculty, we foster an environment of creativity, critical thinking, and practical problem-solving.',
    programs: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'],
    students: 2500,
    icon: FlaskConical,
    color: 'from-blue-500 to-cyan-500',
    type: 'Bachelor & Master',
    years: 4,
  },
  {
    id: 2,
    name: 'Faculty of Medicine',
    description: 'Excellence in medical education and healthcare research',
    fullDescription:
      'The Faculty of Medicine is dedicated to training the next generation of healthcare professionals through rigorous academic programs and hands-on clinical experience. Our commitment to research and patient care ensures that our graduates are well-equipped to make meaningful contributions to the field of medicine.',
    programs: ['Medicine', 'Dentistry', 'Pharmacy', 'Nursing'],
    students: 1800,
    icon: Microscope,
    color: 'from-green-500 to-emerald-500',
    type: 'Bachelor & Doctorate',
    years: 6,
  },
  {
    id: 3,
    name: 'Faculty of Business',
    description: 'Developing future business leaders and entrepreneurs',
    fullDescription:
      "Our Faculty of Business cultivates the entrepreneurial spirit and leadership skills necessary for success in today's dynamic global marketplace. Through innovative curriculum, industry partnerships, and real-world projects, we prepare students to become visionary leaders and change-makers in business.",
    programs: ['Business Administration', 'Economics', 'Finance', 'Marketing', 'Entrepreneurship'],
    students: 2100,
    icon: Briefcase,
    color: 'from-purple-500 to-violet-500',
    type: 'Bachelor & MBA',
    years: 4,
  },
  {
    id: 4,
    name: 'Faculty of Arts',
    description: 'Fostering creativity and critical thinking in humanities',
    fullDescription:
      'The Faculty of Arts celebrates human creativity, cultural diversity, and intellectual exploration. Our programs encourage students to think critically about society, culture, and the human experience while developing their creative expression and analytical skills.',
    programs: ['Literature', 'History', 'Philosophy', 'Fine Arts', 'Languages'],
    students: 1200,
    icon: Palette,
    color: 'from-orange-500 to-amber-500',
    type: 'Bachelor',
    years: 4,
  },
];

export const homeEvents: HomeEvent[] = [
  {
    id: 1,
    title: 'Tech Innovation Summit 2024',
    date: '2024-04-15',
    time: '9:00 AM',
    location: 'Main Auditorium',
    type: 'Conference',
    description: 'Join industry leaders discussing the future of technology and innovation.',
    icon: Rocket,
    attendees: 500,
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop',
    ],
  },
  {
    id: 2,
    title: 'International Research Symposium',
    date: '2024-04-20',
    time: '2:00 PM',
    location: 'Research Center',
    type: 'Academic',
    description: 'Showcase of groundbreaking research from our faculty and students.',
    icon: Microscope,
    attendees: 300,
    images: [
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
    ],
  },
  {
    id: 3,
    title: 'Career Fair 2024',
    date: '2024-04-25',
    time: '10:00 AM',
    location: 'Student Center',
    type: 'Career',
    description: 'Connect with top employers and explore career opportunities.',
    icon: Briefcase,
    attendees: 800,
    images: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&h=600&fit=crop',
    ],
  },
  {
    id: 4,
    title: 'Cultural Heritage Festival',
    date: '2024-05-01',
    time: '6:00 PM',
    location: 'Campus Grounds',
    type: 'Cultural',
    description: 'Celebrating our diverse cultural heritage with performances and exhibitions.',
    icon: PartyPopper,
    attendees: 1200,
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    ],
  },
];
