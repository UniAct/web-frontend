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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SearchableSelect } from "../ui/searchable-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Search,
  Plus,
  Users,
  Mail,
  Phone,
  Edit,
  Trash2,
  UserCheck,
  GraduationCap,
  Building,
  Filter,
  Download,
  Star,
  Calendar,
  Briefcase,
  ChevronDown,
  MoreHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  code: string;
  name: string;
}

// Mock courses data
const mockCourses: Course[] = [
  { id: '1', code: 'CS101', name: 'Introduction to Programming' },
  { id: '2', code: 'CS102', name: 'Programming Laboratory' },
  { id: '3', code: 'CS201', name: 'Data Structures and Algorithms' },
  { id: '4', code: 'CS301', name: 'Database Systems' },
  { id: '5', code: 'CS302', name: 'Software Engineering' },
  { id: '6', code: 'CS401', name: 'Machine Learning' },
  { id: '7', code: 'CS402', name: 'Computer Networks' },
  { id: '8', code: 'MATH101', name: 'Calculus I' },
  { id: '9', code: 'MATH201', name: 'Statistics' },
  { id: '10', code: 'ENG101', name: 'Technical Writing' }
];

interface StaffManagementPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Faculty" | "TA";
  program: string;
  position: string;
  courses: string[];
  status: "Active" | "Inactive" | "On Leave";
  joinDate: string;
  experience: number;
  rating: number;
}

export function StaffManagementPage({
  selectedUniversity,
}: StaffManagementPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [programFilter, setProgramFilter] =
    useState<string>("all");
  const [statusFilter, setStatusFilter] =
    useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  // Form state for adding new staff
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Faculty" as "Faculty" | "TA",
    program: "",
    position: "",
    courses: [] as string[],
    status: "Active" as "Active" | "Inactive" | "On Leave",
  });

  // Form state for editing staff
  const [editStaff, setEditStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Faculty" as "Faculty" | "TA",
    program: "",
    position: "",
    courses: [] as string[],
    status: "Active" as "Active" | "Inactive" | "On Leave",
  });

  // Enhanced mock staff data - initialize staffList
  const initialStaff: StaffMember[] = [
    {
      id: "1",
      name: "Dr. Sarah Wilson",
      email: "sarah.wilson@anu.edu.eg",
      phone: "+20 3 123 4567",
      role: "Faculty",
      program: "Computer Science",
      position: "Professor",
      courses: ["CS-101", "CS-301", "CS-401"],
      status: "Active",
      joinDate: "2020-09-01",
      experience: 8,
      rating: 4.8,
    },
    {
      id: "2",
      name: "Ahmed Hassan",
      email: "ahmed.hassan@anu.edu.eg",
      phone: "+20 3 123 4568",
      role: "TA",
      program: "Computer Science",
      position: "Teaching Assistant",
      courses: ["CS-101", "CS-201"],
      status: "Active",
      joinDate: "2023-02-15",
      experience: 2,
      rating: 4.5,
    },
    {
      id: "3",
      name: "Prof. Michael Johnson",
      email: "michael.johnson@anu.edu.eg",
      phone: "+20 3 123 4569",
      role: "Faculty",
      program: "Mathematics",
      position: "Department Head",
      courses: ["MATH-101", "MATH-201", "MATH-301"],
      status: "Active",
      joinDate: "2018-08-20",
      experience: 12,
      rating: 4.9,
    },
    {
      id: "4",
      name: "Dr. Fatima Al-Rashid",
      email: "fatima.rashid@anu.edu.eg",
      phone: "+20 3 123 4570",
      role: "Faculty",
      program: "Physics",
      position: "Associate Professor",
      courses: ["PHYS-101", "PHYS-201"],
      status: "On Leave",
      joinDate: "2019-03-10",
      experience: 7,
      rating: 4.7,
    },
    {
      id: "5",
      name: "Omar Mahmoud",
      email: "omar.mahmoud@anu.edu.eg",
      phone: "+20 3 123 4571",
      role: "TA",
      program: "Mathematics",
      position: "Teaching Assistant",
      courses: ["MATH-101"],
      status: "Active",
      joinDate: "2023-09-01",
      experience: 1,
      rating: 4.3,
    },
    {
      id: "6",
      name: "Dr. Elena Vasquez",
      email: "elena.vasquez@anu.edu.eg",
      phone: "+20 3 123 4572",
      role: "Faculty",
      program: "Chemistry",
      position: "Professor",
      courses: ["CHEM-101", "CHEM-301", "CHEM-401"],
      status: "Active",
      joinDate: "2017-01-15",
      experience: 15,
      rating: 4.9,
    },
  ];

  // Initialize staff list on component mount
  useState(() => {
    if (staffList.length === 0) {
      setStaffList(initialStaff);
    }
  });

  const programs = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Engineering",
  ];

  // Use staffList instead of staff for filtering
  const staff = staffList;

  // Filter staff based on search and filters
  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch =
        searchQuery === "" ||
        member.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        member.email
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        member.program
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        member.position
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" || member.role === roleFilter;
      const matchesProgram =
        programFilter === "all" ||
        member.program === programFilter;
      const matchesStatus =
        statusFilter === "all" ||
        member.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesProgram &&
        matchesStatus
      );
    });
  }, [
    staff,
    searchQuery,
    roleFilter,
    programFilter,
    statusFilter,
  ]);

  // Calculate enhanced statistics
  const stats = useMemo(() => {
    const totalStaff = staff.length;
    const activeFaculty = staff.filter(
      (s) => s.role === "Faculty" && s.status === "Active",
    ).length;
    const activeTAs = staff.filter(
      (s) => s.role === "TA" && s.status === "Active",
    ).length;
    const programsCount = programs.length;

    return {
      totalStaff,
      activeFaculty,
      activeTAs,
      programsCount,
    };
  }, [staff, programs]);

  // Calculate program distribution
  const programStats = useMemo(() => {
    return programs.map((program) => {
      const programStaff = staff.filter(
        (s) => s.program === program,
      );
      const professors = programStaff.filter(
        (s) => s.role === "Faculty",
      ).length;
      const tas = programStaff.filter(
        (s) => s.role === "TA",
      ).length;
      const total = professors + tas;

      return {
        name: program,
        professors,
        tas,
        total,
      };
    });
  }, [staff, programs]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "On Leave":
        return "secondary";
      case "Inactive":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === "Faculty" ? "default" : "secondary";
  };

  const handleAddStaff = () => {
    setIsAddDialogOpen(true);
  };

  const handleSaveStaff = () => {
    if (
      !newStaff.name ||
      !newStaff.email ||
      !newStaff.program ||
      !newStaff.position
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const staffMember: StaffMember = {
      id: `staff_${Date.now()}`,
      name: newStaff.name,
      email: newStaff.email,
      phone: newStaff.phone || "+20 3 123 0000",
      role: newStaff.role,
      program: newStaff.program,
      position: newStaff.position,
      courses: newStaff.courses,
      status: newStaff.status,
      joinDate: new Date().toISOString().split("T")[0],
      experience: 0,
      rating: 4.0,
    };

    setStaffList((prev) => [...prev, staffMember]);
    setNewStaff({
      name: "",
      email: "",
      phone: "",
      role: "Faculty",
      program: "",
      position: "",
      courses: [],
      status: "Active",
    });
    setIsAddDialogOpen(false);
    toast.success(
      `${staffMember.name} has been added successfully`,
    );
  };

  const handleCancelAdd = () => {
    setNewStaff({
      name: "",
      email: "",
      phone: "",
      role: "Faculty",
      program: "",
      position: "",
      courses: [],
      status: "Active",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditStaff = (id: string) => {
    const staffMember = staffList.find(s => s.id === id);
    if (staffMember) {
      setEditingStaff(staffMember);
      setEditStaff({
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        role: staffMember.role,
        program: staffMember.program,
        position: staffMember.position,
        courses: staffMember.courses,
        status: staffMember.status,
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEditStaff = () => {
    if (
      !editStaff.name ||
      !editStaff.email ||
      !editStaff.program ||
      !editStaff.position
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingStaff) {
      const updatedStaff: StaffMember = {
        ...editingStaff,
        name: editStaff.name,
        email: editStaff.email,
        phone: editStaff.phone || "+20 3 123 0000",
        role: editStaff.role,
        program: editStaff.program,
        position: editStaff.position,
        courses: editStaff.courses,
        status: editStaff.status,
      };

      setStaffList((prev) =>
        prev.map((staff) =>
          staff.id === editingStaff.id ? updatedStaff : staff
        )
      );

      setEditStaff({
        name: "",
        email: "",
        phone: "",
        role: "Faculty",
        program: "",
        position: "",
        courses: [],
        status: "Active",
      });
      setEditingStaff(null);
      setIsEditDialogOpen(false);
      toast.success(`${updatedStaff.name} has been updated successfully`);
    }
  };

  const handleCancelEdit = () => {
    setEditStaff({
      name: "",
      email: "",
      phone: "",
      role: "Faculty",
      program: "",
      position: "",
      courses: [],
      status: "Active",
    });
    setEditingStaff(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    toast.success("Staff member has been removed successfully");
  };

  const handleExport = () => {
    toast.success(
      "Export functionality would download the staff list",
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setProgramFilter("all");
    setStatusFilter("all");
    toast.success("All filters cleared");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">
            Staff Management
          </h2>
          <p className="text-slate-600 mt-2">
            Manage faculty members and teaching assistants
            across all programs
            {selectedUniversity && (
              <span className="text-blue-600 font-medium"> • Filtered by selected university</span>
            )}
          </p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              onClick={handleAddStaff}
              className="gap-2 bg-[rgba(6,6,6,1)]"
            >
              <Plus className="w-4 h-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new faculty
                member or teaching assistant.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newStaff.name}
                    onChange={(e) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="john.smith@university.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newStaff.phone}
                    onChange={(e) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+20 3 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newStaff.role}
                    onValueChange={(value: "Faculty" | "TA") =>
                      setNewStaff((prev) => ({
                        ...prev,
                        role: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Faculty">
                        Faculty
                      </SelectItem>
                      <SelectItem value="TA">
                        Teaching Assistant
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program">Program *</Label>
                  <Select
                    value={newStaff.program}
                    onValueChange={(value) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        program: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem
                          key={program}
                          value={program}
                        >
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={newStaff.position}
                    onChange={(e) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    placeholder="Professor, Associate Professor, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courses">
                    Teaching Courses
                  </Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {mockCourses.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={newStaff.courses.includes(course.code)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setNewStaff(prev => ({
                              ...prev,
                              courses: isChecked
                                ? [...prev.courses, course.code]
                                : prev.courses.filter(c => c !== course.code)
                            }));
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="flex-1">{course.code} - {course.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Selected: {newStaff.courses.length} courses
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newStaff.status}
                    onValueChange={(
                      value: "Active" | "Inactive" | "On Leave",
                    ) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        status: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">
                        Active
                      </SelectItem>
                      <SelectItem value="On Leave">
                        On Leave
                      </SelectItem>
                      <SelectItem value="Inactive">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelAdd}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveStaff}
                className="bg-[rgba(0,0,0,1)]"
              >
                Add Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Staff Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update the details below to modify the staff member information.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editStaff.name}
                    onChange={(e) =>
                      setEditStaff((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editStaff.email}
                    onChange={(e) =>
                      setEditStaff((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="john.smith@university.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={editStaff.phone}
                    onChange={(e) =>
                      setEditStaff((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+20 3 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select
                    value={editStaff.role}
                    onValueChange={(value: "Faculty" | "TA") =>
                      setEditStaff((prev) => ({
                        ...prev,
                        role: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Faculty">
                        Faculty
                      </SelectItem>
                      <SelectItem value="TA">
                        Teaching Assistant
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-program">Program *</Label>
                  <Select
                    value={editStaff.program}
                    onValueChange={(value) =>
                      setEditStaff((prev) => ({
                        ...prev,
                        program: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem
                          key={program}
                          value={program}
                        >
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Position *</Label>
                  <Input
                    id="edit-position"
                    value={editStaff.position}
                    onChange={(e) =>
                      setEditStaff((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    placeholder="Professor, Associate Professor, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-courses">
                    Teaching Courses
                  </Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {mockCourses.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={editStaff.courses.includes(course.code)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setEditStaff(prev => ({
                              ...prev,
                              courses: isChecked
                                ? [...prev.courses, course.code]
                                : prev.courses.filter(c => c !== course.code)
                            }));
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="flex-1">{course.code} - {course.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Selected: {editStaff.courses.length} courses
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editStaff.status}
                    onValueChange={(
                      value: "Active" | "Inactive" | "On Leave",
                    ) =>
                      setEditStaff((prev) => ({
                        ...prev,
                        status: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">
                        Active
                      </SelectItem>
                      <SelectItem value="On Leave">
                        On Leave
                      </SelectItem>
                      <SelectItem value="Inactive">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEditStaff}
                className="bg-[rgba(0,0,0,1)]"
              >
                Update Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-900">
                  {stats.totalStaff}
                </p>
                <p className="text-sm text-blue-700">
                  Total Staff
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-xl shadow-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-900">
                  {stats.activeFaculty}
                </p>
                <p className="text-sm text-green-700">
                  Active Faculty
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-xl shadow-sm">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-900">
                  {stats.activeTAs}
                </p>
                <p className="text-sm text-purple-700">
                  Teaching Assistants
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 rounded-xl shadow-sm">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-900">
                  {stats.programsCount}
                </p>
                <p className="text-sm text-orange-700">
                  Programs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Search staff by name, email, program, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 text-base"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <div className="flex flex-wrap gap-3">
                <Select
                  value={roleFilter}
                  onValueChange={setRoleFilter}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Roles
                    </SelectItem>
                    <SelectItem value="Faculty">
                      Faculty
                    </SelectItem>
                    <SelectItem value="TA">
                      Teaching Assistant
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={programFilter}
                  onValueChange={setProgramFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Programs
                    </SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Status
                    </SelectItem>
                    <SelectItem value="Active">
                      Active
                    </SelectItem>
                    <SelectItem value="On Leave">
                      On Leave
                    </SelectItem>
                    <SelectItem value="Inactive">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Clear Filters
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleExport}
                className="gap-2 sm:ml-auto"
              >
                <Download className="w-4 h-4" />
                Export List
              </Button>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                Showing {filteredStaff.length} of {staff.length}{" "}
                staff members
              </span>
              {(searchQuery ||
                roleFilter !== "all" ||
                programFilter !== "all" ||
                statusFilter !== "all") && (
                  <span className="text-blue-600">
                    Filters applied
                  </span>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Staff Directory */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            Staff Directory
          </CardTitle>
          <CardDescription>
            Comprehensive view of all faculty and teaching
            assistant information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStaff.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No staff members found
                </h3>
                <p className="text-slate-600 mb-4">
                  {searchQuery ||
                    roleFilter !== "all" ||
                    programFilter !== "all" ||
                    statusFilter !== "all"
                    ? "Try adjusting your search criteria or filters."
                    : "No staff members have been added yet."}
                </p>
                {searchQuery ||
                  roleFilter !== "all" ||
                  programFilter !== "all" ||
                  statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={handleAddStaff}>
                    Add First Staff Member
                  </Button>
                )}
              </div>
            ) : (
              filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="flex items-start gap-5">
                    <Avatar className="w-14 h-14 ring-2 ring-slate-100">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-lg">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-1">
                            {member.name}
                          </h4>
                          <p className="text-slate-600">
                            {member.position} • {member.program}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getRoleBadgeVariant(
                              member.role,
                            )}
                            className="text-xs"
                          >
                            {member.role}
                          </Badge>
                          <Badge
                            variant={getStatusBadgeVariant(
                              member.status,
                            )}
                            className="text-xs"
                          >
                            {member.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Contact & Details Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="break-all">
                              {member.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{member.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>
                              Joined:{" "}
                              {new Date(
                                member.joinDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>
                              Rating: {member.rating}/5.0
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Courses */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          Teaching Courses:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {member.courses.length > 0 ? (
                            member.courses.map(
                              (course, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs bg-slate-50"
                                >
                                  {course}
                                </Badge>
                              ),
                            )
                          ) : (
                            <span className="text-sm text-slate-500">
                              No courses assigned
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                          Member since{" "}
                          {new Date(
                            member.joinDate,
                          ).getFullYear()}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                            onClick={() =>
                              handleEditStaff(member.id)
                            }
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
                            onClick={() =>
                              handleDeleteStaff(member.id)
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Programs Overview */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            Programs Overview
          </CardTitle>
          <CardDescription>
            Staff distribution across academic programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programStats.map((program, index) => (
              <Card
                key={program.name}
                className="border-slate-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 text-base leading-tight">
                      {program.name}
                    </h4>
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Building className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-600">
                          Professors:
                        </span>
                      </div>
                      <span className="font-semibold text-green-700">
                        {program.professors}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-slate-600">
                          Teaching Assistants:
                        </span>
                      </div>
                      <span className="font-semibold text-purple-700">
                        {program.tas}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          Total Staff:
                        </span>
                        <span className="font-bold text-slate-900">
                          {program.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
