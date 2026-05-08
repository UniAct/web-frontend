export type AttendanceMode = 'Manual' | 'QRCode' | 'Biometric' | 'Geofencing' | 'Hotspot' | 'Online';

export interface CreateAttendanceSessionDto {
  scheduleSlotId: number;
  facultyMemberId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  attendanceMode: AttendanceMode;
  hotspotSsid?: string;
  qrCode?: string;
  sessionNotes?: string;
}

export interface EnrolledStudent {
  id: number;
  studentId: number;
  student: { user: { id: number; firstName?: string; lastName?: string; email?: string } };
}

export interface AttendanceCourseOption {
  id: number;
  programId: number;
  academicLevel: number;
  program: {
    id: number;
    name: string;
  };
  slot: {
    id: number;
    teacherId: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    type: string;
    course: {
      id: number;
      code: string;
      name: string;
    };
  };
}

export interface AttendanceSessionRecord {
  id: number;
  studentId: number;
  status: 'Present' | 'Absent' | 'Late' | 'Excused' | 'Medical';
  notes?: string | null;
}

export interface AttendanceSession {
  id: number;
  scheduleSlotId: number;
  facultyMemberId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  attendanceMode: AttendanceMode;
  attendance?: AttendanceSessionRecord[];
}

export interface UpsertAttendancesDto {
  attendanceSessionId: number;
  records: Array<{ studentId: number; status: 'present'|'absent'|'late'; deviceIp?: string; deviceMac?: string; notes?: string }>;
}
