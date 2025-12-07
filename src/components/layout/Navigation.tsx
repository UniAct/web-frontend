import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Settings,
  LogOut,
  Bot,
  UserCheck,
  Network,
  Shield,
  BarChart3,
  FileUp,
  UserCog,
  Menu,
  X
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import type { User } from '../../App';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationProps {
  user: AppUser;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Navigation({ user, currentPage, onNavigate, onLogout }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed on desktop
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    if (user.role === 'student') {
      return [
        ...baseItems,
        { id: 'academic-registration', label: 'Academic Registration', icon: FileUp },
        { id: 'timetable', label: 'Timetable', icon: Calendar },
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
        { id: 'teams', label: 'Project Teams', icon: Users },
        { id: 'groups', label: 'Groups & Rooms', icon: Network },
        { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
        { id: 'alumni-hub', label: 'Alumni Hub', icon: GraduationCap },
        { id: 'career-board', label: 'Career Board', icon: Briefcase },
      ];
    }

    if (user.role === 'faculty') {
      return [
        ...baseItems,
        { id: 'courses', label: 'My Courses', icon: BookOpen },
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
        { id: 'teams', label: 'Manage Teams', icon: Users },
        { id: 'groups', label: 'Groups & Rooms', icon: Network },
        { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ];
    }

    if (user.role === 'admin') {
      return [
        ...baseItems,
        { id: 'user-management', label: 'User Management', icon: UserCog },
        { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
        { id: 'data-import', label: 'Data Import', icon: FileUp },
        { id: 'settings', label: 'System Settings', icon: Shield },
      ];
    }

    if (user.role === 'alumni') {
      return [
        ...baseItems,
        { id: 'alumni-hub', label: 'Alumni Hub', icon: GraduationCap },
        { id: 'career-board', label: 'Career Board', icon: Briefcase },
        { id: 'mentorship', label: 'Mentorship', icon: Users },
        { id: 'events', label: 'Events', icon: Calendar },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 border-blue-200/50';
      case 'faculty': return 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border-green-200/50';
      case 'admin': return 'bg-gradient-to-r from-purple-500/10 to-violet-500/10 text-purple-700 border-purple-200/50';
      case 'alumni': return 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-700 border-orange-200/50';
      default: return 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border-gray-200/50';
    }
  };

  const handleNavigation = (pageId: string) => {
    onNavigate(pageId);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Mobile Navigation
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  UniAct
                </h1>
                <p className="text-xs text-gray-500">Digital Ecosystem</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative w-10 h-10 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </motion.div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute left-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 pt-24">
                  {/* User Profile */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 shadow-sm mb-6"
                  >
                    <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                      <Badge className={`text-xs border ${getRoleBadgeColor(user.role)} mt-1`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      {user.department && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{user.department}</p>
                      )}
                    </div>
                  </motion.div>

                  {/* Navigation Items */}
                  <nav className="space-y-2">
                    {navigationItems.map((item, index) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${currentPage === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                          : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                          }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </motion.button>
                    ))}
                  </nav>

                  {/* Footer Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 space-y-2"
                  >
                    <button
                      onClick={() => handleNavigation('profile')}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100/80 text-gray-700 hover:text-gray-900 transition-all duration-200"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop Navigation
  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={`fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-out ${isCollapsed && !isHovered ? 'w-20' : 'w-72'
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50 overflow-hidden"
        style={{
          boxShadow: isHovered ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 cursor-pointer flex-shrink-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <GraduationCap className="w-7 h-7 text-white" />
            </motion.div>
            <AnimatePresence>
              {(!isCollapsed || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    UniAct
                  </h1>
                  <p className="text-sm text-gray-500">Digital Ecosystem</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4">
          <div className={`flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 ${isCollapsed && !isHovered ? 'justify-center' : ''
            }`}>
            <Avatar className="w-10 h-10 ring-2 ring-white shadow-lg flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium text-sm">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {(!isCollapsed || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex-1 min-w-0 overflow-hidden whitespace-nowrap"
                >
                  <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs border ${getRoleBadgeColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                  {user.department && (
                    <p className="text-xs text-gray-500 mt-1">{user.department}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 pb-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative ${currentPage === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                  : 'hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md'
                  } ${isCollapsed && !isHovered ? 'justify-center' : ''}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {(!isCollapsed || isHovered) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="font-medium overflow-hidden whitespace-nowrap text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state when not hovered */}
                {isCollapsed && !isHovered && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50 space-y-1">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleNavigation('profile')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 text-gray-700 hover:text-gray-900 transition-all duration-300 hover:shadow-md group relative ${isCollapsed && !isHovered ? 'justify-center' : ''
              }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {(!isCollapsed || isHovered) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="font-medium overflow-hidden whitespace-nowrap text-sm"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            {isCollapsed && !isHovered && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Settings
                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onLogout}
            className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-25 text-red-600 hover:text-red-700 transition-all duration-300 hover:shadow-md group relative ${isCollapsed && !isHovered ? 'justify-center' : ''
              }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {(!isCollapsed || isHovered) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="font-medium overflow-hidden whitespace-nowrap text-sm"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            {isCollapsed && !isHovered && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Sign Out
                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
