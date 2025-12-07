import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Progress } from '../ui/progress';
import {
  Database,
  Calendar,
  Building,
  ChevronRight,
  ChevronDown,
  BookOpen,
  ArrowRight,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface LevelYearTablePageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

interface Level {
  id: string;
  name: string;
  totalCourses: number;
  totalCredits: number;
  enrolledStudents: number;
  courses: Course[];
}

interface Program {
  id: string;
  name: string;
  levels: Level[];
  isExpanded?: boolean;
}

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  room: string;
  timeSlots: string[];
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  currentLevel: string;
  gpa: number;
  status: 'passed' | 'failed';
  coursesCompleted: number;
  totalCourses: number;
}

// Mock data
const mockPrograms: Program[] = [
  {
    id: '1',
    name: 'Computer Science',
    isExpanded: false,
    levels: [
      {
        id: '1-1',
        name: 'Level 1',
        totalCourses: 8,
        totalCredits: 32,
        enrolledStudents: 120,
        courses: [
          { id: 'cs101', code: 'CS-101', name: 'Introduction to Programming', credits: 4, instructor: 'Dr. Sarah Wilson', room: 'Lab A1', timeSlots: ['Mon 9:00-10:30', 'Wed 9:00-10:30'] },
          { id: 'math101', code: 'MATH-101', name: 'Calculus I', credits: 4, instructor: 'Prof. Michael Johnson', room: 'Room B2', timeSlots: ['Tue 11:00-12:30', 'Thu 11:00-12:30'] },
        ]
      },
      {
        id: '1-2',
        name: 'Level 2',
        totalCourses: 8,
        totalCredits: 32,
        enrolledStudents: 98,
        courses: [
          { id: 'cs201', code: 'CS-201', name: 'Data Structures', credits: 4, instructor: 'Dr. Ahmed Hassan', room: 'Lab B1', timeSlots: ['Mon 14:00-15:30', 'Wed 14:00-15:30'] },
        ]
      },
      {
        id: '1-3',
        name: 'Level 3',
        totalCourses: 9,
        totalCredits: 36,
        enrolledStudents: 85,
        courses: []
      },
      {
        id: '1-4',
        name: 'Level 4',
        totalCourses: 8,
        totalCredits: 32,
        enrolledStudents: 72,
        courses: []
      }
    ]
  },
  {
    id: '2',
    name: 'Mathematics',
    isExpanded: false,
    levels: [
      {
        id: '2-1',
        name: 'Level 1',
        totalCourses: 7,
        totalCredits: 28,
        enrolledStudents: 75,
        courses: [
          { id: 'math201', code: 'MATH-201', name: 'Statistics', credits: 4, instructor: 'Prof. Elena Rodriguez', room: 'Room C1', timeSlots: ['Tue 9:00-10:30', 'Thu 9:00-10:30'] },
        ]
      },
      {
        id: '2-2',
        name: 'Level 2',
        totalCourses: 8,
        totalCredits: 32,
        enrolledStudents: 62,
        courses: []
      }
    ]
  },
  {
    id: '3',
    name: 'Engineering',
    isExpanded: false,
    levels: [
      {
        id: '3-1',
        name: 'Level 1',
        totalCourses: 9,
        totalCredits: 36,
        enrolledStudents: 145,
        courses: []
      },
      {
        id: '3-2',
        name: 'Level 2',
        totalCourses: 9,
        totalCredits: 36,
        enrolledStudents: 128,
        courses: []
      },
      {
        id: '3-3',
        name: 'Level 3',
        totalCourses: 8,
        totalCredits: 32,
        enrolledStudents: 110,
        courses: []
      }
    ]
  }
];

// Mock student data for promotion
const mockStudentsForPromotion: Record<string, { passed: Student[], failed: Student[] }> = {
  '1-1': {
    passed: [
      { id: 's1', name: 'Ahmed Mohamed', studentId: 'CS2024001', currentLevel: 'Level 1', gpa: 3.5, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
      { id: 's2', name: 'Sara Ali', studentId: 'CS2024002', currentLevel: 'Level 1', gpa: 3.8, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
      { id: 's3', name: 'Omar Hassan', studentId: 'CS2024003', currentLevel: 'Level 1', gpa: 3.2, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
      { id: 's4', name: 'Fatima Ibrahim', studentId: 'CS2024004', currentLevel: 'Level 1', gpa: 3.9, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
      { id: 's5', name: 'Youssef Ahmed', studentId: 'CS2024005', currentLevel: 'Level 1', gpa: 3.3, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
    ],
    failed: [
      { id: 'f1', name: 'Khaled Mahmoud', studentId: 'CS2024006', currentLevel: 'Level 1', gpa: 1.8, status: 'failed', coursesCompleted: 5, totalCourses: 8 },
      { id: 'f2', name: 'Nour Samir', studentId: 'CS2024007', currentLevel: 'Level 1', gpa: 1.5, status: 'failed', coursesCompleted: 4, totalCourses: 8 },
    ]
  },
  '1-2': {
    passed: [
      { id: 's6', name: 'Mariam Fathy', studentId: 'CS2023010', currentLevel: 'Level 2', gpa: 3.6, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
      { id: 's7', name: 'Karim Adel', studentId: 'CS2023011', currentLevel: 'Level 2', gpa: 3.4, status: 'passed', coursesCompleted: 8, totalCourses: 8 },
    ],
    failed: [
      { id: 'f3', name: 'Salma Youssef', studentId: 'CS2023012', currentLevel: 'Level 2', gpa: 1.9, status: 'failed', coursesCompleted: 6, totalCourses: 8 },
    ]
  },
  '2-1': {
    passed: [
      { id: 's8', name: 'Hassan Tarek', studentId: 'MATH2024020', currentLevel: 'Level 1', gpa: 3.7, status: 'passed', coursesCompleted: 7, totalCourses: 7 },
      { id: 's9', name: 'Layla Mustafa', studentId: 'MATH2024021', currentLevel: 'Level 1', gpa: 3.5, status: 'passed', coursesCompleted: 7, totalCourses: 7 },
    ],
    failed: []
  }
};

export function LevelYearTablePage({ selectedUniversity }: LevelYearTablePageProps) {
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [selectedTab, setSelectedTab] = useState('programs');

  // Move Levels state
  const [selectedProgramForMove, setSelectedProgramForMove] = useState<string | null>(null);
  const [selectedLevelForMove, setSelectedLevelForMove] = useState<string | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promotionProgress, setPromotionProgress] = useState(0);
  const [isPromoting, setIsPromoting] = useState(false);

  const toggleProgramExpansion = (programId: string) => {
    setPrograms(prev =>
      prev.map(program =>
        program.id === programId
          ? { ...program, isExpanded: !program.isExpanded }
          : program
      )
    );
  };

  const handlePromoteStudents = async (levelId: string) => {
    const studentsData = mockStudentsForPromotion[levelId];
    if (!studentsData || studentsData.passed.length === 0) {
      toast.error('No eligible students to promote');
      return;
    }

    setIsPromoting(true);
    setPromotionProgress(0);

    // Simulate promotion process
    const totalSteps = 100;
    for (let i = 0; i <= totalSteps; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setPromotionProgress(i);
    }

    setIsPromoting(false);
    setShowPromotionDialog(false);
    toast.success(`Successfully promoted ${studentsData.passed.length} students to the next level!`);
  };

  const openPromotionDialog = (programId: string, levelId: string) => {
    setSelectedProgramForMove(programId);
    setSelectedLevelForMove(levelId);
    setShowPromotionDialog(true);
    setPromotionProgress(0);
  };

  const getNextLevelName = (currentLevelName: string): string => {
    const levelNumber = parseInt(currentLevelName.match(/\d+/)?.[0] || '0');
    return `Level ${levelNumber + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Level & Year Tables</h2>
        <p className="text-slate-600 mt-1">
          Manage academic structure and student promotions
          {selectedUniversity && (
            <span className="text-blue-600 font-medium"> • Filtered by selected university</span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="programs">Academic Programs & Levels</TabsTrigger>
          <TabsTrigger value="move-levels">Move Levels</TabsTrigger>
        </TabsList>

        {/* Tab 1: Academic Programs & Levels */}
        <TabsContent value="programs" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Academic Programs & Levels
              </CardTitle>
              <CardDescription>
                Expandable view of programs with their respective academic levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {programs.map((program) => (
                  <div key={program.id} className="border border-slate-200 rounded-lg">
                    {/* Program Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between"
                      onClick={() => toggleProgramExpansion(program.id)}
                    >
                      <div className="flex items-center gap-3">
                        {program.isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{program.name}</h3>
                          <p className="text-sm text-slate-600">
                            {program.levels.length} levels • {
                              program.levels.reduce((acc, level) => acc + level.enrolledStudents, 0)
                            } total students
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {program.levels.length} Levels
                      </Badge>
                    </div>

                    {/* Expanded Levels */}
                    {program.isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-25">
                        {program.levels.map((level) => (
                          <div key={level.id} className="p-4 ml-8 border-l-2 border-slate-200 last:border-b-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <Calendar className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-slate-900">{level.name}</h4>
                                  <p className="text-sm text-slate-600">Academic level structure</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-sm">
                                <span className="text-slate-600">Total Courses:</span>
                                <p className="font-medium text-slate-900">{level.totalCourses}</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-slate-600">Total Credits:</span>
                                <p className="font-medium text-slate-900">{level.totalCredits}</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-slate-600">Enrolled Students:</span>
                                <p className="font-medium text-slate-900">{level.enrolledStudents}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Move Levels */}
        <TabsContent value="move-levels" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Move Students to Next Level
              </CardTitle>
              <CardDescription>
                Promote eligible students who have passed their current level to the next academic level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programs.map((program) => (
                  <div key={program.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{program.name}</h3>
                        <p className="text-sm text-slate-600">{program.levels.length} academic levels</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {program.levels.map((level, index) => {
                        const studentsData = mockStudentsForPromotion[level.id];
                        const hasNextLevel = index < program.levels.length - 1;
                        const nextLevel = hasNextLevel ? program.levels[index + 1] : null;
                        const passedCount = studentsData?.passed.length || 0;
                        const failedCount = studentsData?.failed.length || 0;
                        const totalCount = passedCount + failedCount;

                        return (
                          <div key={level.id} className="bg-slate-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <Calendar className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-slate-900">{level.name}</h4>
                                  <p className="text-xs text-slate-500">
                                    {totalCount > 0 ? `${totalCount} students total` : 'No students to evaluate'}
                                  </p>
                                </div>
                              </div>
                              {hasNextLevel && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <span>Move to</span>
                                  <ArrowRight className="w-4 h-4" />
                                  <span className="font-medium">{nextLevel?.name}</span>
                                </div>
                              )}
                            </div>

                            {totalCount > 0 ? (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  {/* Eligible Students */}
                                  <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-slate-900">Eligible for Promotion</span>
                                      </div>
                                      <Badge className="bg-green-100 text-green-700 border-green-200">
                                        {passedCount}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                      Students who passed all required courses
                                    </p>
                                  </div>

                                  {/* Not Eligible Students */}
                                  <div className="bg-white rounded-lg p-3 border-l-4 border-red-500">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <span className="text-sm font-medium text-slate-900">Not Eligible</span>
                                      </div>
                                      <Badge className="bg-red-100 text-red-700 border-red-200">
                                        {failedCount}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                      Students who need to retake courses
                                    </p>
                                  </div>
                                </div>

                                {hasNextLevel && passedCount > 0 && (
                                  <Button
                                    onClick={() => openPromotionDialog(program.id, level.id)}
                                    className="w-full gap-2"
                                    variant="default"
                                  >
                                    <TrendingUp className="w-4 h-4" />
                                    Promote {passedCount} Student{passedCount !== 1 ? 's' : ''} to {nextLevel?.name}
                                  </Button>
                                )}

                                {!hasNextLevel && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 rounded-lg p-3">
                                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                                    <span>This is the final level. Students will graduate upon completion.</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-center py-4 text-sm text-slate-500">
                                No students available for evaluation in this level
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Promotion Dialog */}
      <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Confirm Student Promotion</DialogTitle>
            <DialogDescription>
              Review and confirm the promotion of eligible students to the next level
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {selectedLevelForMove && mockStudentsForPromotion[selectedLevelForMove] && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 mb-1">Promotion Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Current Level:</span>
                          <p className="font-medium text-slate-900">
                            {programs.find(p => p.id === selectedProgramForMove)?.levels.find(l => l.id === selectedLevelForMove)?.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">Promoting To:</span>
                          <p className="font-medium text-slate-900">
                            {getNextLevelName(programs.find(p => p.id === selectedProgramForMove)?.levels.find(l => l.id === selectedLevelForMove)?.name || '')}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">Eligible Students:</span>
                          <p className="font-medium text-green-700">
                            {mockStudentsForPromotion[selectedLevelForMove].passed.length}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">Not Eligible:</span>
                          <p className="font-medium text-red-700">
                            {mockStudentsForPromotion[selectedLevelForMove].failed.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Eligible Students List */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-slate-900">Students to be Promoted</h4>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {mockStudentsForPromotion[selectedLevelForMove].passed.map((student) => (
                      <div key={student.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-700">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{student.name}</p>
                              <p className="text-xs text-slate-600">{student.studentId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              GPA: {student.gpa.toFixed(2)}
                            </Badge>
                            <p className="text-xs text-slate-600 mt-1">
                              {student.coursesCompleted}/{student.totalCourses} courses
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Failed Students List */}
                {mockStudentsForPromotion[selectedLevelForMove].failed.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium text-slate-900">Students Remaining in Current Level</h4>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {mockStudentsForPromotion[selectedLevelForMove].failed.map((student) => (
                        <div key={student.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-red-700">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{student.name}</p>
                                <p className="text-xs text-slate-600">{student.studentId}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-red-100 text-red-700 border-red-200">
                                GPA: {student.gpa.toFixed(2)}
                              </Badge>
                              <p className="text-xs text-slate-600 mt-1">
                                {student.coursesCompleted}/{student.totalCourses} courses
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Bar (shown during promotion) */}
                {isPromoting && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 animate-pulse" />
                      <span className="font-medium text-slate-900">Processing Promotion...</span>
                    </div>
                    <Progress value={promotionProgress} className="h-2" />
                    <p className="text-xs text-slate-600 mt-2 text-center">{promotionProgress}% Complete</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPromotionDialog(false)}
              disabled={isPromoting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedLevelForMove && handlePromoteStudents(selectedLevelForMove)}
              disabled={isPromoting}
              className="gap-2"
            >
              {isPromoting ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm Promotion
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
