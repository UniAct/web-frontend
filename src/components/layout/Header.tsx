import { useState } from 'react';
import { Bell, Search, MessageSquare, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import type { User as AppUser } from '../../App';
import { motion } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  user: AppUser;
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
}

export function Header({ user, notifications, onNotificationRead }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = notifications.filter(n => !n.read).length;

  const studentHeaderDetails = {
    studentName: user.name || 'N/A',
    studentId: user.studentId || user.id || 'N/A',
    program: user.programName || (user.programId ? `Program #${user.programId}` : 'N/A'),
    level: user.programLevelId ?? 'N/A',
    semester: user.currentSemesterId ?? 'N/A',
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 right-0 left-0 lg:left-20 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Student Program Details or Search for other roles */}
        {user.role === 'student' ? (
          <div className="flex-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-700">
                  <span className="text-gray-500">Name:</span> <span className="font-medium">{studentHeaderDetails.studentName}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-700">
                  <span className="text-gray-500">ID:</span> <span className="font-medium">{studentHeaderDetails.studentId}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-700">
                  <span className="text-gray-500">Program:</span> <span className="font-medium">{studentHeaderDetails.program}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-700">
                  <span className="text-gray-500">Level:</span> <span className="font-medium">{studentHeaderDetails.level}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-700">
                  <span className="text-gray-500">Semester:</span> <span className="font-medium">{studentHeaderDetails.semester}</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search courses, teams, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-gradient-to-r from-gray-50 to-white border-gray-200/50 rounded-xl shadow-sm focus:shadow-md focus:border-blue-300 transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 ml-6">
          {/* Messages - Only show for non-student roles */}
          {user.role !== 'student' && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="relative w-10 h-10 rounded-xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md transition-all duration-200"
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </Button>
            </motion.div>
          )}

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative w-10 h-10 rounded-xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md transition-all duration-200"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <span className="text-white text-xs font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl rounded-2xl" align="end">
              <div className="p-6 border-b border-gray-200/50">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border-b border-gray-200/50 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 ${!notification.read ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50' : ''
                        }`}
                      onClick={() => onNotificationRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-12 px-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl rounded-2xl">
              <DropdownMenuItem className="p-4">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{user.name}</span>
                  <span className="text-sm text-gray-500">{user.email}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200/50" />
              <DropdownMenuItem className="p-3">
                <Settings className="w-4 h-4 mr-3 text-gray-600" />
                <span className="text-gray-700">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3">
                <span className="text-gray-700">Help & Support</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}
