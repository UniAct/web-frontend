import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "../ui/modal";
import {
  Search,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Building,
  BookOpen,
  FlaskConical,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Room {
  id: string;
  code: string;
  name: string;
  maxStudents: number;
  type: "lecture" | "lab" | "seminar" | "tutorial";
  building: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  hasLecture: boolean;
  hasLab: boolean;
  credits: number;
}

interface TimeSlot {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  componentType: "lecture" | "lab";
  roomId: string;
  roomCode: string;
  day: string;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  instructor: string;
  enrolledStudents: number;
  createdAt: string;
}

interface RoomsTimetablingPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

// Course color palette - accessible and eye-friendly
const COURSE_COLORS = [
  {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    accent: "bg-blue-600",
  },
  {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
    accent: "bg-emerald-600",
  },
  {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-200",
    accent: "bg-purple-600",
  },
  {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
    accent: "bg-orange-600",
  },
  {
    bg: "bg-teal-100",
    text: "text-teal-800",
    border: "border-teal-200",
    accent: "bg-teal-600",
  },
  {
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    border: "border-indigo-200",
    accent: "bg-indigo-600",
  },
  {
    bg: "bg-rose-100",
    text: "text-rose-800",
    border: "border-rose-200",
    accent: "bg-rose-600",
  },
  {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
    accent: "bg-amber-600",
  },
  {
    bg: "bg-cyan-100",
    text: "text-cyan-800",
    border: "border-cyan-200",
    accent: "bg-cyan-600",
  },
  {
    bg: "bg-lime-100",
    text: "text-lime-800",
    border: "border-lime-200",
    accent: "bg-lime-600",
  },
];

// Mock data
const mockRooms: Room[] = [
  {
    id: "1",
    code: "A101",
    name: "Lecture Hall A101",
    maxStudents: 150,
    type: "lecture",
    building: "Engineering",
  },
  {
    id: "2",
    code: "CS-LAB1",
    name: "CS Lab 1",
    maxStudents: 30,
    type: "lab",
    building: "CS Building",
  },
  {
    id: "3",
    code: "B205",
    name: "Tutorial Room B205",
    maxStudents: 25,
    type: "tutorial",
    building: "Main Building",
  },
  {
    id: "4",
    code: "SEM1",
    name: "Seminar Room 1",
    maxStudents: 40,
    type: "seminar",
    building: "Business Building",
  },
];

const mockCourses: Course[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Computer Science",
    hasLecture: true,
    hasLab: false,
    credits: 3,
  },
  {
    id: "2",
    code: "CS201",
    name: "Data Structures and Algorithms",
    hasLecture: true,
    hasLab: true,
    credits: 4,
  },
  {
    id: "3",
    code: "MATH201",
    name: "Calculus II",
    hasLecture: true,
    hasLab: false,
    credits: 3,
  },
  {
    id: "4",
    code: "PHY101",
    name: "Physics Laboratory",
    hasLecture: false,
    hasLab: true,
    credits: 2,
  },
  {
    id: "5",
    code: "ENG102",
    name: "Technical Writing",
    hasLecture: true,
    hasLab: false,
    credits: 2,
  },
  {
    id: "6",
    code: "CHEM201",
    name: "Organic Chemistry",
    hasLecture: true,
    hasLab: true,
    credits: 4,
  },
];

const mockTimeSlots: TimeSlot[] = [
  {
    id: "1",
    courseId: "1",
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    componentType: "lecture",
    roomId: "1",
    roomCode: "A101",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:30",
    instructor: "Dr. Smith",
    enrolledStudents: 45,
    createdAt: "2023-06-01",
  },
  {
    id: "2",
    courseId: "2",
    courseCode: "CS201",
    courseName: "Data Structures and Algorithms",
    componentType: "lecture",
    roomId: "1",
    roomCode: "A101",
    day: "Tuesday",
    startTime: "11:15",
    endTime: "12:45",
    instructor: "Prof. Johnson",
    enrolledStudents: 38,
    createdAt: "2023-06-01",
  },
  {
    id: "3",
    courseId: "2",
    courseCode: "CS201",
    courseName: "Data Structures and Algorithms",
    componentType: "lab",
    roomId: "2",
    roomCode: "CS-LAB1",
    day: "Wednesday",
    startTime: "14:30",
    endTime: "16:00",
    instructor: "TA Johnson",
    enrolledStudents: 20,
    createdAt: "2023-06-01",
  },
  {
    id: "4",
    courseId: "3",
    courseCode: "MATH201",
    courseName: "Calculus II",
    componentType: "lecture",
    roomId: "3",
    roomCode: "B205",
    day: "Thursday",
    startTime: "08:45",
    endTime: "10:15",
    instructor: "Dr. Williams",
    enrolledStudents: 22,
    createdAt: "2023-06-01",
  },
  {
    id: "5",
    courseId: "4",
    courseCode: "PHY101",
    courseName: "Physics Laboratory",
    componentType: "lab",
    roomId: "2",
    roomCode: "CS-LAB1",
    day: "Friday",
    startTime: "13:20",
    endTime: "15:35",
    instructor: "Dr. Physics",
    enrolledStudents: 15,
    createdAt: "2023-06-01",
  },
];

// Week starts from Saturday
const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

// Time helpers
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours =
    hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export function RoomsTimetablingPage({
  selectedUniversity,
}: RoomsTimetablingPageProps) {
  const [rooms] = useState<Room[]>(mockRooms);
  const [courses] = useState<Course[]>(mockCourses);
  const [timeSlots, setTimeSlots] =
    useState<TimeSlot[]>(mockTimeSlots);
  const [selectedRoom, setSelectedRoom] = useState<string>(
    mockRooms[0]?.id || "",
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] =
    useState<TimeSlot | null>(null);

  const [formData, setFormData] = useState({
    courseId: "",
    componentType: "lecture" as "lecture" | "lab",
    roomId: "",
    day: "Saturday",
    startTime: "09:00",
    endTime: "10:30",
    instructor: "",
  });

  // Course color mapping
  const courseColorMap = useMemo(() => {
    const map = new Map<string, (typeof COURSE_COLORS)[0]>();
    courses.forEach((course, index) => {
      map.set(
        course.id,
        COURSE_COLORS[index % COURSE_COLORS.length],
      );
    });
    return map;
  }, [courses]);

  const currentRoom = rooms.find((r) => r.id === selectedRoom);
  const roomTimeSlots = timeSlots.filter(
    (slot) => slot.roomId === selectedRoom,
  );

  // Dynamic time range calculation based on actual schedule
  const calculateTimeRange = () => {
    if (roomTimeSlots.length === 0) {
      // Default range when no slots exist
      return { startHour: 8, endHour: 18 };
    }

    const allTimes = roomTimeSlots.flatMap((slot) => [
      timeToMinutes(slot.startTime) / 60,
      timeToMinutes(slot.endTime) / 60,
    ]);

    const earliestHour = Math.floor(Math.min(...allTimes));
    const latestHour = Math.ceil(Math.max(...allTimes));

    // Add 1 hour buffer on each side, but keep within reasonable bounds
    const startHour = Math.max(6, earliestHour - 1);
    const endHour = Math.min(22, latestHour + 1);

    return { startHour, endHour };
  };

  const { startHour: START_HOUR, endHour: END_HOUR } =
    calculateTimeRange();
  const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;
  const PIXELS_PER_MINUTE = 2; // 2 pixels per minute for better precision
  const TOTAL_HEIGHT = TOTAL_MINUTES * PIXELS_PER_MINUTE;
  const TIME_COLUMN_WIDTH = 110; // Slightly wider for better readability

  // Check for conflicts
  const hasTimeConflict = (
    day: string,
    startTime: string,
    endTime: string,
    excludeSlotId?: string,
  ) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    return timeSlots.some((slot) => {
      if (excludeSlotId && slot.id === excludeSlotId)
        return false;
      if (slot.roomId !== formData.roomId || slot.day !== day)
        return false;

      const slotStartMinutes = timeToMinutes(slot.startTime);
      const slotEndMinutes = timeToMinutes(slot.endTime);

      return (
        startMinutes < slotEndMinutes &&
        endMinutes > slotStartMinutes
      );
    });
  };

  // Check if course components are complete
  const getCourseCompletionStatus = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return { complete: true, missing: [] };

    const courseSlots = timeSlots.filter(
      (slot) => slot.courseId === courseId,
    );
    const hasLectureScheduled = courseSlots.some(
      (slot) => slot.componentType === "lecture",
    );
    const hasLabScheduled = courseSlots.some(
      (slot) => slot.componentType === "lab",
    );

    const missing = [];
    if (course.hasLecture && !hasLectureScheduled)
      missing.push("lecture");
    if (course.hasLab && !hasLabScheduled) missing.push("lab");

    return { complete: missing.length === 0, missing };
  };

  const handleAddTimeSlot = () => {
    if (
      !formData.courseId ||
      !formData.roomId ||
      !formData.instructor
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate time
    if (
      timeToMinutes(formData.startTime) >=
      timeToMinutes(formData.endTime)
    ) {
      toast.error("End time must be after start time");
      return;
    }

    // Check for conflicts
    if (
      hasTimeConflict(
        formData.day,
        formData.startTime,
        formData.endTime,
      )
    ) {
      toast.error("Time slot conflicts with existing schedule");
      return;
    }

    const course = courses.find(
      (c) => c.id === formData.courseId,
    );
    const room = rooms.find((r) => r.id === formData.roomId);

    if (!course || !room) {
      toast.error("Invalid course or room selection");
      return;
    }

    // Validate component type
    if (
      formData.componentType === "lecture" &&
      !course.hasLecture
    ) {
      toast.error(
        "This course does not have a lecture component",
      );
      return;
    }
    if (formData.componentType === "lab" && !course.hasLab) {
      toast.error("This course does not have a lab component");
      return;
    }

    const newTimeSlot: TimeSlot = {
      id: Date.now().toString(),
      courseId: formData.courseId,
      courseCode: course.code,
      courseName: course.name,
      componentType: formData.componentType,
      roomId: formData.roomId,
      roomCode: room.code,
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      instructor: formData.instructor,
      enrolledStudents: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTimeSlots([...timeSlots, newTimeSlot]);
    setShowAddModal(false);
    resetForm();

    // Check if course is now complete
    const completionStatus = getCourseCompletionStatus(
      formData.courseId,
    );
    if (completionStatus.complete) {
      toast.success(
        "Time slot added successfully! Course is now fully scheduled.",
      );
    } else {
      toast.success(
        `Time slot added successfully! Missing: ${completionStatus.missing.join(", ")}`,
      );
    }
  };

  const handleEditTimeSlot = () => {
    if (
      !editingSlot ||
      !formData.courseId ||
      !formData.roomId ||
      !formData.instructor
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      timeToMinutes(formData.startTime) >=
      timeToMinutes(formData.endTime)
    ) {
      toast.error("End time must be after start time");
      return;
    }

    if (
      hasTimeConflict(
        formData.day,
        formData.startTime,
        formData.endTime,
        editingSlot.id,
      )
    ) {
      toast.error("Time slot conflicts with existing schedule");
      return;
    }

    const course = courses.find(
      (c) => c.id === formData.courseId,
    );
    const room = rooms.find((r) => r.id === formData.roomId);

    if (!course || !room) return;

    setTimeSlots(
      timeSlots.map((slot) =>
        slot.id === editingSlot.id
          ? {
            ...slot,
            courseId: formData.courseId,
            courseCode: course.code,
            courseName: course.name,
            componentType: formData.componentType,
            roomId: formData.roomId,
            roomCode: room.code,
            day: formData.day,
            startTime: formData.startTime,
            endTime: formData.endTime,
            instructor: formData.instructor,
          }
          : slot,
      ),
    );

    setEditingSlot(null);
    resetForm();
    toast.success("Time slot updated successfully");
  };

  const handleDeleteTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
    toast.success("Time slot deleted successfully");
  };

  const openEditModal = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      courseId: slot.courseId,
      componentType: slot.componentType,
      roomId: slot.roomId,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      instructor: slot.instructor,
    });
  };

  const resetForm = () => {
    setFormData({
      courseId: "",
      componentType: "lecture",
      roomId: selectedRoom,
      day: "Saturday",
      startTime: "09:00",
      endTime: "10:30",
      instructor: "",
    });
  };

  // Calculate precise position and dimensions for course cards
  const calculateSlotDimensions = (
    startTime: string,
    endTime: string,
  ) => {
    const startMinutes =
      timeToMinutes(startTime) - START_HOUR * 60;
    const endMinutes = timeToMinutes(endTime) - START_HOUR * 60;
    const duration = endMinutes - startMinutes;

    return {
      top: startMinutes * PIXELS_PER_MINUTE,
      height: Math.max(duration * PIXELS_PER_MINUTE, 24), // Minimum 24px height
      duration: duration,
    };
  };

  const getComponentIcon = (type: "lecture" | "lab") => {
    return type === "lecture" ? (
      <BookOpen className="w-3 h-3 flex-shrink-0" />
    ) : (
      <FlaskConical className="w-3 h-3 flex-shrink-0" />
    );
  };

  // Generate time markers for precise visualization
  const timeMarkers = useMemo(() => {
    const markers = [];
    for (
      let minutes = 0;
      minutes <= TOTAL_MINUTES;
      minutes += 30
    ) {
      // Every 30 minutes
      const hour = START_HOUR + Math.floor(minutes / 60);
      const minute = minutes % 60;
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      markers.push({
        minutes,
        timeString,
        isHour: minute === 0,
        position: minutes * PIXELS_PER_MINUTE,
      });
    }
    return markers;
  }, [START_HOUR, TOTAL_MINUTES, PIXELS_PER_MINUTE]);

  if (!selectedUniversity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No University Selected
          </h3>
          <p className="text-slate-600 text-center">
            Please select a university to manage its timetables.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Timetabling & Schedule Management
          </h2>
          <p className="text-slate-600 mt-1">
            Create and manage course schedules with flexible
            timing
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Class
        </Button>
      </div>

      {/* Room Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-600" />
              <span className="font-medium">Room:</span>
            </div>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[300px]"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.code} - {room.name} (Max:{" "}
                  {room.maxStudents})
                </option>
              ))}
            </select>
            {currentRoom && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {currentRoom.building}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {currentRoom.maxStudents} capacity
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Course Color Legend
          </CardTitle>
          <CardDescription>
            Each course has a unique color across all components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {courses.map((course) => {
              const colors = courseColorMap.get(course.id);
              const status = getCourseCompletionStatus(
                course.id,
              );
              return (
                <div
                  key={course.id}
                  className={`p-3 rounded-lg border ${colors?.bg} ${colors?.border}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="outline"
                      className="text-xs"
                    >
                      {course.code}
                    </Badge>
                    {status.complete ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <p
                    className={`text-sm font-medium mb-2 ${colors?.text} truncate`}
                    title={course.name}
                  >
                    {course.name}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {course.hasLecture && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${timeSlots.some(
                          (s) =>
                            s.courseId === course.id &&
                            s.componentType === "lecture",
                        )
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-50 text-gray-500"
                          }`}
                      >
                        Lecture{" "}
                        {timeSlots.some(
                          (s) =>
                            s.courseId === course.id &&
                            s.componentType === "lecture",
                        )
                          ? "✓"
                          : "○"}
                      </Badge>
                    )}
                    {course.hasLab && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${timeSlots.some(
                          (s) =>
                            s.courseId === course.id &&
                            s.componentType === "lab",
                        )
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-50 text-gray-500"
                          }`}
                      >
                        Lab{" "}
                        {timeSlots.some(
                          (s) =>
                            s.courseId === course.id &&
                            s.componentType === "lab",
                        )
                          ? "✓"
                          : "○"}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fluid Dynamic Timetable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Fluid Weekly Timetable - {currentRoom?.name}
          </CardTitle>
          <CardDescription>
            Auto-adjusting schedule from{" "}
            {formatTime12Hour(`${START_HOUR}:00`)} to{" "}
            {formatTime12Hour(`${END_HOUR}:00`)} | Capacity:{" "}
            {currentRoom?.maxStudents} students | Dynamic time
            range based on scheduled courses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {/* Responsive container with horizontal scroll */}
            <div className="overflow-x-auto">
              <div className="min-w-[900px] w-full">
                {/* Header Row - Days */}
                <div className="sticky top-0 z-20 bg-white border-b-2 border-slate-200 shadow-sm">
                  <div className="flex">
                    {/* Time column header */}
                    <div
                      className="flex-shrink-0 p-4 font-semibold text-slate-700 border-r-2 border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 text-center"
                      style={{ width: TIME_COLUMN_WIDTH }}
                    >
                      <div className="text-sm">Time Range</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {formatTime12Hour(`${START_HOUR}:00`)} -{" "}
                        {formatTime12Hour(`${END_HOUR}:00`)}
                      </div>
                    </div>

                    {/* Day headers */}
                    <div className="flex-1 grid grid-cols-7">
                      {DAYS.map((day) => (
                        <div
                          key={day}
                          className="p-4 font-semibold text-slate-900 text-center border-r last:border-r-0 bg-gradient-to-b from-slate-50 to-slate-100"
                        >
                          <div className="text-sm">{day}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {
                              roomTimeSlots.filter(
                                (slot) => slot.day === day,
                              ).length
                            }{" "}
                            classes
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Timetable Body */}
                <div className="flex relative">
                  {/* Empty state overlay for no courses */}
                  {roomTimeSlots.length === 0 && (
                    <div className="absolute inset-0 z-30 bg-white/95 flex items-center justify-center">
                      <div className="text-center p-8">
                        <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                          No Classes Scheduled
                        </h3>
                        <p className="text-slate-600 mb-4">
                          Add your first class to see the
                          dynamic timetable in action. The time
                          range will automatically adjust based
                          on your scheduled courses.
                        </p>
                        <p className="text-sm text-slate-500">
                          Currently showing default hours:{" "}
                          {formatTime12Hour("8:00")} -{" "}
                          {formatTime12Hour("18:00")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Time Column - Fluid Markers with proper spacing */}
                  <div
                    className="flex-shrink-0 bg-gradient-to-b from-slate-50 to-slate-100 border-r-2 border-slate-200 relative"
                    style={{
                      width: TIME_COLUMN_WIDTH,
                      height: TOTAL_HEIGHT + 75, // Dynamic height based on header
                      minHeight: TOTAL_HEIGHT + 75,
                      paddingTop: "0px", // Remove padding, use position offset instead
                    }}
                  >
                    {timeMarkers.map((marker) => (
                      <div
                        key={marker.timeString}
                        className="absolute left-0 right-0 flex items-center justify-center"
                        style={{
                          top: marker.position + 75, // Dynamic offset to clear the header
                          height: "24px",
                          transform: "translateY(-12px)", // Center the text properly
                        }}
                      >
                        <div className="text-center leading-tight px-2">
                          <div
                            className={`${marker.isHour
                                ? "text-sm font-semibold text-slate-700"
                                : "text-xs text-slate-500"
                              } whitespace-nowrap`}
                          >
                            {formatTime12Hour(
                              marker.timeString,
                            )}
                          </div>
                        </div>

                        {/* Time reference line */}
                        <div
                          className={`absolute right-0 ${marker.isHour
                              ? "bg-slate-400"
                              : "bg-slate-300"
                            }`}
                          style={{
                            width: marker.isHour
                              ? "12px"
                              : "8px",
                            height: "2px",
                            top: "11px",
                          }}
                        />
                      </div>
                    ))}

                    {/* Vertical time reference line */}
                    <div
                      className="absolute right-0 top-0 bg-slate-300"
                      style={{
                        width: "2px",
                        height: "100%",
                      }}
                    />
                  </div>

                  {/* Days Grid Container - Fluid Layout */}
                  <div
                    className="flex-1 relative bg-white"
                    style={{ paddingTop: "80px" }}
                  >
                    <div
                      className="grid grid-cols-7 h-full"
                      style={{
                        height: TOTAL_HEIGHT,
                        minHeight: TOTAL_HEIGHT,
                      }}
                    >
                      {DAYS.map((day, dayIndex) => (
                        <div
                          key={day}
                          className="relative border-r border-slate-200 last:border-r-0"
                        >
                          {/* Grid lines for time references - perfectly aligned */}
                          {timeMarkers.map((marker) => (
                            <div
                              key={marker.timeString}
                              className={`absolute w-full ${marker.isHour
                                  ? "border-slate-300 border-t-2"
                                  : "border-slate-150 border-t"
                                } pointer-events-none`}
                              style={{
                                top: marker.position,
                                left: 0,
                                right: 0,
                              }}
                            />
                          ))}

                          {/* Course Cards - Dynamically Sized */}
                          {roomTimeSlots
                            .filter((slot) => slot.day === day)
                            .map((slot) => {
                              const dimensions =
                                calculateSlotDimensions(
                                  slot.startTime,
                                  slot.endTime,
                                );
                              const colors = courseColorMap.get(
                                slot.courseId,
                              );

                              return (
                                <div
                                  key={slot.id}
                                  className={`absolute left-2 right-2 rounded-lg border-2 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer z-10 ${colors?.bg} ${colors?.border} group overflow-hidden`}
                                  style={{
                                    top: dimensions.top + 1, // Small offset to prevent overlap with grid lines
                                    height: Math.max(
                                      dimensions.height - 2,
                                      22,
                                    ), // Ensure minimum height with spacing
                                  }}
                                  onClick={() =>
                                    openEditModal(slot)
                                  }
                                >
                                  {/* Card Content - Responsive Layout */}
                                  <div className="h-full p-2 flex flex-col justify-between relative">
                                    {/* Header Section */}
                                    <div className="flex items-start justify-between gap-1 mb-1">
                                      <div className="flex items-center gap-1 min-w-0 flex-1">
                                        {getComponentIcon(
                                          slot.componentType,
                                        )}
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-white/90 flex-shrink-0"
                                        >
                                          {slot.courseCode}
                                        </Badge>
                                      </div>

                                      {/* Action buttons - shown on hover */}
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(slot);
                                          }}
                                          className="h-5 w-5 p-0 hover:bg-white/90 bg-white/70"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTimeSlot(
                                              slot.id,
                                            );
                                          }}
                                          className="h-5 w-5 p-0 hover:bg-white/90 bg-white/70 text-red-600"
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Content Section - Adapts to available space */}
                                    <div
                                      className={`flex-1 flex flex-col justify-center ${colors?.text} text-center`}
                                    >
                                      {/* Course name - show if enough space */}
                                      {dimensions.duration >=
                                        45 && (
                                          <p
                                            className="text-xs font-medium mb-1 line-clamp-2 leading-tight"
                                            title={
                                              slot.courseName
                                            }
                                          >
                                            {slot.courseName}
                                          </p>
                                        )}

                                      {/* Time display - always visible */}
                                      <div className="text-xs font-semibold mb-1">
                                        {formatTime12Hour(
                                          slot.startTime,
                                        )}{" "}
                                        -{" "}
                                        {formatTime12Hour(
                                          slot.endTime,
                                        )}
                                      </div>

                                      {/* Additional details for larger cards */}
                                      {dimensions.duration >=
                                        60 && (
                                          <div className="text-xs space-y-1">
                                            <div className="flex items-center justify-center gap-1">
                                              <Users className="w-3 h-3" />
                                              <span>
                                                {
                                                  slot.enrolledStudents
                                                }
                                              </span>
                                            </div>
                                            <p
                                              className="truncate text-xs"
                                              title={
                                                slot.instructor
                                              }
                                            >
                                              {slot.instructor}
                                            </p>
                                          </div>
                                        )}

                                      {/* Component type indicator for smaller cards */}
                                      {dimensions.duration <
                                        45 && (
                                          <div className="text-xs font-medium capitalize">
                                            {slot.componentType}
                                          </div>
                                        )}
                                    </div>

                                    {/* Duration indicator */}
                                    <div
                                      className={`absolute bottom-1 right-1 text-xs ${colors?.text} opacity-60`}
                                    >
                                      {Math.round(
                                        dimensions.duration,
                                      )}
                                      min
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Schedule Modal */}
      <Modal
        open={showAddModal || !!editingSlot}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingSlot(null);
            resetForm();
          }
        }}
      >
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>
              {editingSlot
                ? "Edit Schedule"
                : "Schedule New Class"}
            </ModalTitle>
            <ModalDescription>
              {editingSlot
                ? "Update class schedule information"
                : "Add a new class to the timetable with flexible timing"}
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courseId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Component Type *
                </label>
                <select
                  value={formData.componentType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      componentType: e.target.value as
                        | "lecture"
                        | "lab",
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.courseId}
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                </select>
                {formData.courseId && (
                  <p className="text-xs text-slate-500 mt-1">
                    {(() => {
                      const course = courses.find(
                        (c) => c.id === formData.courseId,
                      );
                      if (!course) return "";
                      const available = [];
                      if (course.hasLecture)
                        available.push("lecture");
                      if (course.hasLab) available.push("lab");
                      return `Available: ${available.join(", ")}`;
                    })()}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Room *
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roomId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.code} - {room.name} (Max:{" "}
                      {room.maxStudents})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Day *
                </label>
                <select
                  value={formData.day}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      day: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Time *
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startTime: e.target.value,
                    })
                  }
                  min={`${START_HOUR.toString().padStart(2, "0")}:00`}
                  max={`${END_HOUR.toString().padStart(2, "0")}:00`}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Displays as:{" "}
                  {formatTime12Hour(formData.startTime)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Time *
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endTime: e.target.value,
                    })
                  }
                  min={formData.startTime}
                  max={`${END_HOUR.toString().padStart(2, "0")}:00`}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Displays as:{" "}
                  {formatTime12Hour(formData.endTime)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Instructor *
              </label>
              <Input
                value={formData.instructor}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instructor: e.target.value,
                  })
                }
                placeholder="e.g., Dr. Smith or TA Johnson"
              />
            </div>

            {/* Enhanced Validation Messages */}
            {formData.roomId &&
              formData.day &&
              formData.startTime &&
              formData.endTime && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Schedule Preview:
                  </p>
                  <div className="space-y-2">
                    {timeToMinutes(formData.startTime) >=
                      timeToMinutes(formData.endTime) ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">
                          End time must be after start time
                        </span>
                      </div>
                    ) : hasTimeConflict(
                      formData.day,
                      formData.startTime,
                      formData.endTime,
                      editingSlot?.id,
                    ) ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">
                          Time conflict detected!
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">
                          No conflicts found - schedule will
                          auto-adjust time range
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 pt-2">
                      <div>
                        <span className="font-medium">
                          Duration:
                        </span>{" "}
                        {Math.round(
                          ((timeToMinutes(formData.endTime) -
                            timeToMinutes(formData.startTime)) /
                            60) *
                          100,
                        ) / 100}{" "}
                        hours (
                        {timeToMinutes(formData.endTime) -
                          timeToMinutes(
                            formData.startTime,
                          )}{" "}
                        minutes)
                      </div>
                      <div>
                        <span className="font-medium">
                          Visual Height:
                        </span>{" "}
                        {Math.max(
                          (timeToMinutes(formData.endTime) -
                            timeToMinutes(formData.startTime)) *
                          PIXELS_PER_MINUTE,
                          24,
                        )}
                        px
                      </div>
                    </div>

                    {/* Show current time range */}
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-xs text-slate-500">
                        Current timetable shows:{" "}
                        {formatTime12Hour(`${START_HOUR}:00`)} -{" "}
                        {formatTime12Hour(`${END_HOUR}:00`)}
                        {roomTimeSlots.length === 0 &&
                          " (Default range - will adjust when courses are added)"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingSlot(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={
                  editingSlot
                    ? handleEditTimeSlot
                    : handleAddTimeSlot
                }
                disabled={
                  !formData.courseId ||
                  !formData.roomId ||
                  !formData.instructor ||
                  timeToMinutes(formData.startTime) >=
                  timeToMinutes(formData.endTime) ||
                  hasTimeConflict(
                    formData.day,
                    formData.startTime,
                    formData.endTime,
                    editingSlot?.id,
                  )
                }
              >
                {editingSlot ? "Update" : "Schedule"} Class
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
