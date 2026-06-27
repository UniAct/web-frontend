import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Eye,
  GraduationCap,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { EnrollmentService } from '../../api';
import type {
  AdminEnrollmentListQuery,
  AdminEnrollmentListResponse,
  AdminEnrollmentOptionsResponse,
  AdminEnrollmentRecord,
  AdminEnrollmentSlotOption,
  AdminEnrollmentStatus,
  AdminEnrollmentStudentTrackResponse,
} from '../../api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface EnrollmentPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

const STATUS_OPTIONS: AdminEnrollmentStatus[] = ['Enrolled', 'InProgress', 'Completed', 'Withdrawn', 'Failed'];

function statusBadgeClass(status: AdminEnrollmentStatus) {
  switch (status) {
    case 'Enrolled':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'InProgress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Completed':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Withdrawn':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Failed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function formatSlot(slot: AdminEnrollmentSlotOption | AdminEnrollmentRecord) {
  const schedule = slot.schedule;
  const course = slot.course;
  if (!schedule || !course) return 'Unassigned schedule';
  return `${course.code} - ${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function EnrollmentPage({ selectedUniversity }: EnrollmentPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminEnrollmentStatus | 'all'>('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [data, setData] = useState<AdminEnrollmentListResponse | null>(null);
  const [options, setOptions] = useState<AdminEnrollmentOptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [studentTrack, setStudentTrack] = useState<AdminEnrollmentStudentTrackResponse | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<AdminEnrollmentRecord | null>(null);
  const [selectedAddSlot, setSelectedAddSlot] = useState('');
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const query = useMemo<AdminEnrollmentListQuery>(() => ({
    search: searchQuery.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    semesterId: semesterFilter === 'all' ? undefined : Number(semesterFilter),
    courseId: courseFilter === 'all' ? undefined : Number(courseFilter),
  }), [courseFilter, searchQuery, semesterFilter, statusFilter]);

  const loadEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await EnrollmentService.getAdminEnrollments(query);
      setData(result);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load enrollments'));
    } finally {
      setLoading(false);
    }
  }, [query]);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const result = await EnrollmentService.getAdminEnrollmentOptions({
        semesterId: semesterFilter === 'all' ? undefined : Number(semesterFilter),
        studentId: selectedStudentToAdd ? Number(selectedStudentToAdd) : undefined,
      });
      setOptions(result);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load enrollment options'));
    } finally {
      setOptionsLoading(false);
    }
  }, [selectedStudentToAdd, semesterFilter]);

  const loadStudentTrack = useCallback(async (studentId: number) => {
    setTrackLoading(true);
    try {
      const result = await EnrollmentService.getAdminStudentTrack(studentId, {
        semesterId: semesterFilter === 'all' ? undefined : Number(semesterFilter),
      });
      setStudentTrack(result);
      setSelectedAddSlot('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load student enrollment track'));
    } finally {
      setTrackLoading(false);
    }
  }, [semesterFilter]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments, refreshNonce, selectedUniversity]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions, selectedUniversity]);

  useEffect(() => {
    if (!detailsOpen || !selectedEnrollment) return;
    loadStudentTrack(selectedEnrollment.studentId);
  }, [detailsOpen, loadStudentTrack, selectedEnrollment, refreshNonce]);

  const visibleEnrollments = data?.enrollments ?? [];
  const selectedStudentAvailableSlots = options?.availableSlots ?? [];
  const trackEnrollments = studentTrack?.enrollments ?? [];
  const trackAvailableSlots = studentTrack?.availableSlots ?? [];

  const summaryCards = [
    { label: 'Total records', value: data?.summary.total ?? 0, icon: BookOpen },
    { label: 'Active seats', value: data?.summary.activeSeats ?? 0, icon: UserRound },
    { label: 'Completed', value: data?.summary.byStatus.Completed ?? 0, icon: GraduationCap },
    { label: 'Withdrawn / Failed', value: (data?.summary.byStatus.Withdrawn ?? 0) + (data?.summary.byStatus.Failed ?? 0), icon: AlertCircle },
  ];

  const openDetails = (enrollment: AdminEnrollmentRecord) => {
    setSelectedEnrollment(enrollment);
    setStudentTrack(null);
    setDetailsOpen(true);
    loadStudentTrack(enrollment.studentId);
  };

  const refreshAll = () => setRefreshNonce((value) => value + 1);

  const handleCreateEnrollment = async (studentId: number, slotContextId: number, source: 'modal' | 'toolbar') => {
    const key = `create-${studentId}-${slotContextId}`;
    setBusyAction(key);
    try {
      await EnrollmentService.createAdminEnrollment({ studentId, slotContextId, status: 'Enrolled' });
      toast.success('Enrollment added successfully');
      setSelectedAddSlot('');
      if (source === 'toolbar') setSelectedStudentToAdd('');
      refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add enrollment'));
    } finally {
      setBusyAction(null);
    }
  };

  const handleUpdateEnrollment = async (id: number, payload: { status?: AdminEnrollmentStatus; slotContextId?: number }) => {
    const key = `update-${id}`;
    setBusyAction(key);
    try {
      await EnrollmentService.updateAdminEnrollment(id, payload);
      toast.success('Enrollment updated successfully');
      refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update enrollment'));
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteEnrollment = async (enrollment: AdminEnrollmentRecord) => {
    const confirmed = window.confirm(`Delete ${enrollment.course?.code ?? 'this enrollment'} for ${enrollment.studentName}?`);
    if (!confirmed) return;

    const key = `delete-${enrollment.id}`;
    setBusyAction(key);
    try {
      await EnrollmentService.deleteAdminEnrollment(enrollment.id);
      toast.success('Enrollment deleted successfully');
      refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete enrollment'));
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Enrollment Management</h2>
          <p className="mt-1 text-sm text-slate-600">Read, modify, move, add, and delete every student course registration from live backend data.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={refreshAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {summaryCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">{item.value}</p>
                </div>
                <Icon className="h-5 w-5 text-slate-400" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search student, ID, email, course code, or course name"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AdminEnrollmentStatus | 'all')}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All semesters</SelectItem>
                {(options?.semesters ?? []).map((semester) => (
                  <SelectItem key={semester.id} value={String(semester.id)}>{semester.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger><SelectValue placeholder="Course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {(options?.courses ?? []).map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>{course.code} - {course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 lg:grid-cols-[260px_1fr_auto]">
            <div className="space-y-2">
              <Label>Add enrollment for student</Label>
              <Select value={selectedStudentToAdd} onValueChange={(value) => { setSelectedStudentToAdd(value); setSelectedAddSlot(''); }}>
                <SelectTrigger><SelectValue placeholder={optionsLoading ? 'Loading students...' : 'Select student'} /></SelectTrigger>
                <SelectContent>
                  {(options?.students ?? []).map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.universityStudentId} - {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Available schedule slot</Label>
              <Select value={selectedAddSlot} onValueChange={setSelectedAddSlot} disabled={!selectedStudentToAdd}>
                <SelectTrigger><SelectValue placeholder={selectedStudentToAdd ? 'Select slot to enroll' : 'Select student first'} /></SelectTrigger>
                <SelectContent>
                  {selectedStudentAvailableSlots.map((slot) => (
                    <SelectItem key={slot.slotContextId} value={String(slot.slotContextId)}>
                      {formatSlot(slot)} - {slot.schedule.remainingSeats} seats
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full gap-2"
                disabled={!selectedStudentToAdd || !selectedAddSlot || busyAction?.startsWith('create')}
                onClick={() => handleCreateEnrollment(Number(selectedStudentToAdd), Number(selectedAddSlot), 'toolbar')}
              >
                {busyAction?.startsWith('create') ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Live Enrollment Records</CardTitle>
          <div className="text-xs text-slate-500">Refresh manually when needed</div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading enrollments
            </div>
          ) : visibleEnrollments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No enrollment records match the current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-sm">
                <thead className="border-y bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {visibleEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{enrollment.studentName}</p>
                        <p className="text-xs text-slate-500">{enrollment.universityStudentId} - {enrollment.programName} L{enrollment.academicLevel}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{enrollment.course?.code ?? 'Unassigned'}</p>
                        <p className="text-xs text-slate-500">{enrollment.course?.name ?? 'No course attached'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-900">{enrollment.schedule ? `${enrollment.schedule.dayOfWeek} ${enrollment.schedule.startTime}-${enrollment.schedule.endTime}` : 'No schedule'}</p>
                        <p className="text-xs text-slate-500">{enrollment.classroom?.label ?? 'No room'} - {enrollment.semesterLabel}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={statusBadgeClass(enrollment.status)}>{enrollment.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {enrollment.schedule ? `${enrollment.schedule.enrolledSeats}/${enrollment.schedule.allowedCapacity}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => openDetails(enrollment)}>
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            disabled={busyAction === `delete-${enrollment.id}`}
                            onClick={() => handleDeleteEnrollment(enrollment)}
                          >
                            {busyAction === `delete-${enrollment.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="flex h-[min(92vh,860px)] max-w-[min(1180px,calc(100vw-1rem))] flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-[min(1180px,calc(100vw-2rem))]">
          <DialogHeader className="shrink-0 border-b border-slate-200 px-4 py-4 pr-12 sm:px-6">
            <DialogTitle className="text-base sm:text-lg">Student Enrollment Track</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              View history, change status, move slots, add courses, or remove records.
            </DialogDescription>
          </DialogHeader>

          {trackLoading || !studentTrack ? (
            <div className="flex min-h-0 flex-1 items-center justify-center gap-2 p-10 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading student track
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 space-y-4 border-b border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase text-slate-500">Student</p>
                    <p className="mt-1 truncate font-medium text-slate-950">{studentTrack.student.name}</p>
                    <p className="text-xs text-slate-500">{studentTrack.student.universityStudentId}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase text-slate-500">Program</p>
                    <p className="mt-1 truncate font-medium text-slate-950">{studentTrack.student.program.name}</p>
                    <p className="text-xs text-slate-500">Level {studentTrack.student.programLevel.level}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase text-slate-500">Academic State</p>
                    <p className="mt-1 font-medium text-slate-950">CGPA {studentTrack.student.cgpa.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{studentTrack.student.status}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase text-slate-500">Enrollment Date</p>
                    <p className="mt-1 font-medium text-slate-950">{studentTrack.student.enrollmentDate}</p>
                    <p className="truncate text-xs text-slate-500">{studentTrack.student.email}</p>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                  <Select value={selectedAddSlot} onValueChange={setSelectedAddSlot}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Add another schedule slot for this student" /></SelectTrigger>
                    <SelectContent>
                      {trackAvailableSlots.map((slot) => (
                        <SelectItem key={slot.slotContextId} value={String(slot.slotContextId)}>
                          {formatSlot(slot)} - {slot.semesterLabel} - {slot.schedule.remainingSeats} seats
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    className="gap-2"
                    disabled={!selectedAddSlot || busyAction?.startsWith('create')}
                    onClick={() => handleCreateEnrollment(studentTrack.student.id, Number(selectedAddSlot), 'modal')}
                  >
                    {busyAction?.startsWith('create') ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add Course
                  </Button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                {trackEnrollments.length === 0 ? (
                  <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                    This student has no enrollment records yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trackEnrollments.map((enrollment) => (
                      <div key={enrollment.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
                          <div className="min-w-0 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={statusBadgeClass(enrollment.status)}>{enrollment.status}</Badge>
                              <span className="min-w-0 break-words font-medium text-slate-950">
                                {enrollment.course?.code} - {enrollment.course?.name}
                              </span>
                            </div>
                            <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                              <span className="flex min-w-0 items-center gap-2">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span className="truncate">{enrollment.schedule?.dayOfWeek} {enrollment.schedule?.startTime}-{enrollment.schedule?.endTime}</span>
                              </span>
                              <span className="truncate">{enrollment.classroom?.label}</span>
                              <span className="truncate">{enrollment.teacher?.name}</span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Semester {enrollment.semesterLabel} - enrolled {enrollment.enrollmentDate} - seats {enrollment.schedule?.enrolledSeats ?? 0}/{enrollment.schedule?.allowedCapacity ?? 0}
                            </p>
                            {enrollment.course?.prerequisites && enrollment.course.prerequisites.length > 0 && (
                              <p className="text-xs text-slate-500">
                                Prerequisites: {enrollment.course.prerequisites.map((item) => item.code).join(', ')}
                              </p>
                            )}
                          </div>

                          <div className="grid min-w-0 gap-2 rounded-lg bg-slate-50 p-3">
                            <Select
                              value={enrollment.status}
                              onValueChange={(value) => handleUpdateEnrollment(enrollment.id, { status: value as AdminEnrollmentStatus })}
                              disabled={busyAction === `update-${enrollment.id}`}
                            >
                              <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Select
                              value={enrollment.slotContextId ? String(enrollment.slotContextId) : ''}
                              onValueChange={(value) => handleUpdateEnrollment(enrollment.id, { slotContextId: Number(value) })}
                              disabled={busyAction === `update-${enrollment.id}`}
                            >
                              <SelectTrigger className="bg-white"><SelectValue placeholder="Move to another slot" /></SelectTrigger>
                              <SelectContent>
                                {[
                                  ...trackAvailableSlots,
                                  ...(enrollment.slotContextId ? [{
                                    slotContextId: enrollment.slotContextId,
                                    scheduleSlotId: enrollment.scheduleSlotId ?? 0,
                                    semesterId: enrollment.semesterId,
                                    semesterLabel: enrollment.semesterLabel,
                                    programId: 0,
                                    programName: enrollment.programName,
                                    academicLevel: enrollment.academicLevel,
                                    course: enrollment.course!,
                                    teacher: enrollment.teacher!,
                                    classroom: enrollment.classroom!,
                                    schedule: enrollment.schedule!,
                                  }] : []),
                                ].filter((slot) => slot.course?.id === enrollment.course?.id).map((slot) => (
                                  <SelectItem key={slot.slotContextId} value={String(slot.slotContextId)}>
                                    {formatSlot(slot)} - {slot.schedule.remainingSeats} seats
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              className="gap-2 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              disabled={busyAction === `delete-${enrollment.id}`}
                              onClick={() => handleDeleteEnrollment(enrollment)}
                            >
                              {busyAction === `delete-${enrollment.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              Delete Enrollment
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
