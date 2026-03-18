import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '../components/ui/modal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  Mail,
  Phone,
  ChevronRight,
  Building2,
  Globe,
  ArrowRight,
  Play,
  CheckCircle,
  FlaskConical,
  Briefcase,
  Palette,
  ChevronLeft,
  X,
  Microscope,
  Rocket,
  Megaphone,
  PartyPopper,
  Search,
  Library,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { AuthService, UniversityService } from '../api';
import { TenantDetectionService } from '../services/TenantDetectionService';
import { homeEvents, homeFaculties, homeHeroImages } from '../features/home';
import type { PublicTenantProfile } from '../api';
import type { UserRole } from '../App';
import type { Faculty, HomeEvent } from '../features/home';

interface HomePageProps {
  onLogin: (email: string, role: UserRole) => void;
}

export function HomePage({ onLogin }: HomePageProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState<'email' | 'password' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HomeEvent | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showProgramsModal, setShowProgramsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [programSearchQuery, setProgramSearchQuery] = useState('');

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [tenantProfile, setTenantProfile] = useState<PublicTenantProfile | null>(null);

  // Counter animation states
  const [studentsCount, setStudentsCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);
  const [programsCount, setProgramsCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Hero carousel state
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // Refs for scroll animations
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

  // Detect if this is super admin context on mount
  useEffect(() => {
    const tenantContext = TenantDetectionService.detectTenant();
    setIsSuperAdmin(tenantContext.isSuperAdmin);

    if (tenantContext.isSuperAdmin || !tenantContext.subdomain) {
      return;
    }

    let isMounted = true;

    UniversityService.getPublicTenantProfile(tenantContext.subdomain)
      .then((profile) => {
        if (isMounted) {
          setTenantProfile(profile);
        }
      })
      .catch((error) => {
        console.warn('[HomePage] Failed to load public tenant profile:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const universityName = tenantProfile?.name ?? 'UniAct';
  const universityContactName = tenantProfile?.name ?? 'our university';
  const heroImages = homeHeroImages;
  const faculties = homeFaculties;
  const events = homeEvents;

  // Animated counter effect with easing for smooth animation
  useEffect(() => {
    if (isStatsInView && !hasAnimated) {
      setHasAnimated(true);

      const animateCounter = (
        target: number,
        setter: React.Dispatch<React.SetStateAction<number>>,
        duration: number = 2000
      ) => {
        const startTime = Date.now();
        const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

        const animate = () => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const easedProgress = easeOutQuart(progress);
          const currentValue = Math.floor(easedProgress * target);

          setter(currentValue);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setter(target);
          }
        };

        requestAnimationFrame(animate);
      };

      // Animate all counters with slightly different durations for a staggered effect
      animateCounter(15000, setStudentsCount, 2000);
      animateCounter(800, setFacultyCount, 2200);
      animateCounter(50, setProgramsCount, 1800);
    }
  }, [isStatsInView, hasAnimated]);

  // Auto-advance hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const nextHeroImage = () => {
    setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevHeroImage = () => {
    setHeroImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // For both SuperAdmin and tenant context, just validate email format
    if (email && email.includes('@')) {
      setCompletedSteps(prev => new Set(prev).add('email'));
      setLoginStep('password');
    } else {
      setLoginError('Please enter a valid email address');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!password) {
      setLoginError('Please enter a password');
      return;
    }

    setIsLoading(true);

    try {
      if (isSuperAdmin) {
        // SuperAdmin login - call API immediately after password
        console.log('[HomePage] SuperAdmin login attempt:', email);
        const response = await AuthService.loginSuperAdmin(email, password);
        console.log('[HomePage] SuperAdmin login successful:', response);

        // Call the onLogin callback with superadmin role
        onLogin(email, 'superadmin' as UserRole);

        // Close modal and reset form
        setShowLoginModal(false);
        setLoginStep('email');
        setEmail('');
        setPassword('');
        setOtp('');
        setCompletedSteps(new Set());
      } else {
        // Tenant user login - still show password validation, then proceed to login
        console.log('[HomePage] Tenant user login attempt:', email);
        const response = await AuthService.loginStaff(email, password);
        console.log('[HomePage] Tenant user login successful:', response);

        // App.tsx resolves the final role from backend token/session roles.
        onLogin(email, 'student');

        // Close modal and reset form
        setShowLoginModal(false);
        setLoginStep('email');
        setEmail('');
        setPassword('');
        setOtp('');
        setCompletedSteps(new Set());
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Login failed. Please check your credentials.';
      setLoginError(errorMsg);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // OTP flow is not needed - login happens on password submit
    // This function is kept for backwards compatibility
  };

  const handleTabNavigation = (step: 'email' | 'password' | 'otp') => {
    if (step === 'email') {
      setLoginStep('email');
    } else if (step === 'password' && completedSteps.has('email')) {
      setLoginStep('password');
    }
  };

  const canNavigateToStep = (step: 'email' | 'password' | 'otp') => {
    if (step === 'email') return true;
    if (step === 'password') return completedSteps.has('email');
    return false;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const nextImage = () => {
    if (selectedEvent && selectedEvent.images) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedEvent.images!.length);
    }
  };

  const prevImage = () => {
    if (selectedEvent && selectedEvent.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedEvent.images!.length - 1 : prev - 1
      );
    }
  };

  // Filter faculties based on search query
  const filteredFaculties = faculties.filter(faculty => {
    const searchLower = programSearchQuery.toLowerCase();
    const facultyNameMatch = faculty.name.toLowerCase().includes(searchLower);
    const programsMatch = faculty.programs.some(program =>
      program.toLowerCase().includes(searchLower)
    );
    return facultyNameMatch || programsMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl text-blue-900">{isSuperAdmin ? 'UniAct' : universityName}</h1>
                <p className="text-xs text-blue-600">
                  {isSuperAdmin ? 'System Administration Portal' : 'University Portal'}
                </p>
              </div>
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('faculties')} className="ui-nav-link group">
                Faculties
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => setShowProgramsModal(true)} className="ui-nav-link group">
                Programs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('events')} className="ui-nav-link group">
                Events
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => setShowAboutModal(true)} className="ui-nav-link group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('contact')} className="ui-nav-link group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </button>
            </div>

            {/* Login Button */}
            <Button
              onClick={() => setShowLoginModal(true)}
              className="bg-blue-600 hover:bg-blue-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Login
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div>
                <Badge className="bg-blue-100 text-blue-800 mb-4">
                  AI-Powered Digital Ecosystem
                </Badge>
                <h1 className="text-4xl lg:text-6xl mb-6 bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Welcome to the Future of University Education
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Experience a revolutionary digital ecosystem powered by AI, connecting students, faculty, and alumni
                  in an integrated platform that transforms the way you learn, collaborate, and grow.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => scrollToSection('faculties')}
                  className="rounded-xl px-6"
                >
                  Explore Programs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-6"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Statistics Counter Section */}
              <div ref={statsRef} className="home-stats-grid">
                {/* Students Counter */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-[32px] text-blue-600 tabular-nums tracking-tight">
                      {studentsCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 tracking-wider mt-1">Students</div>
                  </div>
                </motion.div>

                {/* Faculty Counter */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-[32px] text-purple-600 tabular-nums tracking-tight">
                      {facultyCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 tracking-wider mt-1">Faculty</div>
                  </div>
                </motion.div>

                {/* Programs Counter */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-[32px] text-green-600 tabular-nums tracking-tight">
                      {programsCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 tracking-wider mt-1">Programs</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20"></div>

                {/* Dynamic Photo Carousel */}
                <div className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 group">
                  {/* Image Container */}
                  <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
                    {heroImages.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: index === heroImageIndex ? 1 : 0,
                          scale: index === heroImageIndex ? 1 : 1.1
                        }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                        className="absolute inset-0"
                      >
                        <img
                          src={image}
                          alt={`University Campus ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      </motion.div>
                    ))}

                    {/* Navigation Controls */}
                    <button
                      onClick={prevHeroImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 sm:p-3 rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10 touch-manipulation"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                    </button>
                    <button
                      onClick={nextHeroImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 sm:p-3 rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10 touch-manipulation"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                    </button>

                    {/* Indicator Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {heroImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setHeroImageIndex(index)}
                          className={`transition-all duration-300 ${index === heroImageIndex
                            ? 'bg-white w-8 h-2'
                            : 'bg-white/60 hover:bg-white/80 w-2 h-2'
                            } rounded-full`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Badge Overlay */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm border-0 shadow-lg">
                        Campus Life
                      </Badge>
                    </div>
                  </div>

                  {/* Bottom Info Bar */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm">Explore Our Campus</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Faculties Section */}
      <section id="faculties" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl mb-4 text-gray-900">Our Faculties</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover world-class education across diverse fields of study, led by renowned faculty and cutting-edge research.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredFaculties.map((faculty, index) => {
              const Icon = faculty.icon;
              return (
                <motion.div
                  key={faculty.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
                    onClick={() => setSelectedFaculty(faculty)}
                  >
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${faculty.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg mb-2 group-hover:text-blue-600 transition-colors">{faculty.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{faculty.description}</p>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>{faculty.students.toLocaleString()} students</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {faculty.programs.slice(0, 3).map((program, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {program}
                            </Badge>
                          ))}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full group-hover:text-blue-600 transition-all hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFaculty(faculty);
                          }}
                        >
                          Learn More
                          <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl mb-4 text-gray-900">Upcoming Events</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join us for exciting events that bring together our university community and beyond.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event, index) => {
              const Icon = event.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
                    onClick={() => {
                      setSelectedEvent(event);
                      setCurrentImageIndex(0);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {event.type}
                          </Badge>
                          <h3 className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>

                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{event.attendees} attendees</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            setCurrentImageIndex(0);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg">{isSuperAdmin ? 'UniAct' : universityName}</h3>
                  <p className="text-xs text-gray-400">Digital University Ecosystem</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Empowering education through innovative technology and AI-driven solutions.
              </p>
            </div>

            <div>
              <h4 className="mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <button onClick={() => scrollToSection('about')} className="block hover:text-white transition-colors">About Us</button>
                <a href="#" className="block hover:text-white transition-colors">Admissions</a>
                <a href="#" className="block hover:text-white transition-colors">Research</a>
                <a href="#" className="block hover:text-white transition-colors">Campus Life</a>
              </div>
            </div>

            <div>
              <h4 className="mb-4">Support</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-white transition-colors">Terms of Service</a>
                <button onClick={() => scrollToSection('contact')} className="block hover:text-white transition-colors">Contact Us</button>
              </div>
            </div>

            <div>
              <h4 className="mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@anu.edu.eg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+20 3 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>www.anu.edu.eg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 {isSuperAdmin ? 'UniAct' : universityName}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <Modal open={showLoginModal} onOpenChange={setShowLoginModal}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle>
              {isSuperAdmin ? 'SuperAdmin Sign In' : 'UniAct Sign In'}
            </ModalTitle>
            <ModalDescription>
              {isSuperAdmin ? 'Manage all system tenants and settings' : 'Sign in to access your UniAct dashboard'}
            </ModalDescription>
          </ModalHeader>

          <div className="w-full">
            <div className="grid w-full grid-cols-2 bg-muted rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => handleTabNavigation('email')}
                className={`text-center py-2 px-3 rounded-md text-sm transition-all ${loginStep === 'email'
                  ? 'bg-background shadow-sm'
                  : canNavigateToStep('email')
                    ? 'text-muted-foreground hover:bg-background/50 cursor-pointer'
                    : 'text-muted-foreground cursor-not-allowed'
                  }`}
                disabled={!canNavigateToStep('email')}
              >
                <Mail className="w-3 h-3 mx-auto mb-1" />
                Email
              </button>
              <button
                type="button"
                onClick={() => handleTabNavigation('password')}
                className={`text-center py-2 px-3 rounded-md text-sm transition-all ${loginStep === 'password'
                  ? 'bg-background shadow-sm'
                  : canNavigateToStep('password')
                    ? 'text-muted-foreground hover:bg-background/50 cursor-pointer'
                    : 'text-muted-foreground cursor-not-allowed'
                  }`}
                disabled={!canNavigateToStep('password')}
              >
                <span className="inline-block">Password</span>
              </button>
            </div>

            {loginError && (
              <Alert className="border-red-200 bg-red-50 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}

            {loginStep === 'email' && (
              <div className="space-y-4">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder={isSuperAdmin ? "superadmin@gmail.com" : "your.email@example.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {isSuperAdmin ? 'Use your SuperAdmin email' : 'Enter your institutional email'}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!email || isLoading}
                  >
                    Continue
                  </Button>
                </form>
              </div>
            )}

            {loginStep === 'password' && (
              <div className="space-y-4">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!password || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </ModalContent>
      </Modal>

      {/* Faculty Details Dialog */}
      <Dialog open={!!selectedFaculty} onOpenChange={() => setSelectedFaculty(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedFaculty && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${selectedFaculty.color} rounded-2xl flex items-center justify-center`}>
                    <selectedFaculty.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedFaculty.name}</DialogTitle>
                    <Badge className="mt-1">{selectedFaculty.type}</Badge>
                  </div>
                </div>
                <DialogDescription className="text-base leading-relaxed">
                  {selectedFaculty.fullDescription}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Students</p>
                          <p className="text-lg">{selectedFaculty.students.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="text-lg">{selectedFaculty.years} Years</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="mb-3 text-gray-900">Available Programs</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFaculty.programs.map((program, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {program}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedFaculty(null)}>
                  Close
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Apply Now
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-3xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <selectedEvent.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
                    <Badge className="mt-1">{selectedEvent.type}</Badge>
                  </div>
                </div>
              </DialogHeader>

              {selectedEvent.images && selectedEvent.images.length > 0 && (
                <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden group">
                  <img
                    src={selectedEvent.images[currentImageIndex]}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />

                  {selectedEvent.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedEvent.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                              ? 'bg-white w-6'
                              : 'bg-white/60 hover:bg-white/80'
                              }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <DialogDescription className="text-base leading-relaxed">
                {selectedEvent.description}
              </DialogDescription>

              <div className="grid grid-cols-2 gap-4 py-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p>{selectedEvent.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p>{selectedEvent.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p>{selectedEvent.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Attendees</p>
                        <p>{selectedEvent.attendees} registered</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Register for Event
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Programs Modal */}
      <Dialog open={showProgramsModal} onOpenChange={setShowProgramsModal}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Library className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Academic Programs</DialogTitle>
                <DialogDescription>
                  Explore all programs across our faculties
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search programs..."
              value={programSearchQuery}
              onChange={(e) => setProgramSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Programs by Faculty */}
          <div className="space-y-6">
            {filteredFaculties.length > 0 ? (
              filteredFaculties.map((faculty) => {
                const Icon = faculty.icon;
                return (
                  <div key={faculty.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${faculty.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{faculty.name}</h3>
                        <p className="text-sm text-gray-500">{faculty.programs.length} programs</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-13">
                      {faculty.programs.map((program, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              <p className="text-sm">{program}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No programs found matching your search</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => {
              setShowProgramsModal(false);
              setProgramSearchQuery('');
            }}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowLoginModal(true)}>
              Apply Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* About Modal */}
      <Dialog open={showAboutModal} onOpenChange={setShowAboutModal}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  About {isSuperAdmin ? 'UniAct' : universityName}
                </DialogTitle>
                <DialogDescription>
                  Our mission, vision, and policies
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Mission Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                {universityContactName} is committed to providing world-class education that empowers students
                to become innovative leaders and responsible global citizens. Through cutting-edge research,
                collaborative learning, and community engagement, we strive to advance knowledge and create positive
                societal impact.
              </p>
            </div>

            {/* Vision Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be a leading institution of higher education recognized globally for academic excellence,
                groundbreaking research, and transformative innovation. We envision a future where our graduates
                shape industries, drive technological advancement, and contribute to solving the world's most
                pressing challenges.
              </p>
            </div>

            {/* Values Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Core Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Excellence</h4>
                        <p className="text-sm text-gray-600">Striving for the highest standards in education and research</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Innovation</h4>
                        <p className="text-sm text-gray-600">Fostering creativity and pioneering new solutions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Integrity</h4>
                        <p className="text-sm text-gray-600">Upholding ethical standards and academic honesty</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Diversity</h4>
                        <p className="text-sm text-gray-600">Celebrating diverse perspectives and inclusive excellence</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Policies Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">University Policies</h3>
              <div className="space-y-3">
                <Card className="border-l-4 border-l-blue-600">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Academic Integrity Policy</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      All students and faculty are expected to maintain the highest standards of academic honesty.
                      Plagiarism, cheating, and other forms of academic dishonesty are strictly prohibited and
                      subject to disciplinary action.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-600">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Privacy & Data Protection</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      We are committed to protecting your personal information. Student and faculty data is handled
                      in accordance with applicable data protection regulations and is used solely for educational
                      and administrative purposes.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-600">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Equal Opportunity Policy</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {universityContactName} is committed to providing equal opportunities to all individuals
                      regardless of race, color, religion, gender, age, national origin, disability, or any other
                      protected characteristic.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">info@anu.edu.eg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">+20 3 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">Alexandria, Egypt</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAboutModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
