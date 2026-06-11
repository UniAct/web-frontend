import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Search, 
  Shield, 
  Clock,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter
} from 'lucide-react';

interface AuditLogsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

export function AuditLogsPage({ selectedUniversity }: AuditLogsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock audit log data
  const auditLogs = [
    {
      id: '1',
      timestamp: '2024-07-22T14:30:15Z',
      user: 'Admin User',
      userEmail: 'admin@anu.edu.eg',
      action: 'CREATE',
      resource: 'Student',
      resourceId: 'STU-2024-001',
      details: 'Created new student record for John Doe',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'Low',
      status: 'Success'
    },
    {
      id: '2',
      timestamp: '2024-07-22T14:25:08Z',
      user: 'Dr. Sarah Wilson',
      userEmail: 'sarah.wilson@anu.edu.eg',
      action: 'UPDATE',
      resource: 'Course',
      resourceId: 'CS-301',
      details: 'Updated course prerequisites for Data Structures',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (MacOS)',
      severity: 'Medium',
      status: 'Success'
    },
    {
      id: '3',
      timestamp: '2024-07-22T14:20:33Z',
      user: 'System',
      userEmail: 'system@anu.edu.eg',
      action: 'DELETE',
      resource: 'Enrollment',
      resourceId: 'ENR-2024-456',
      details: 'Auto-deleted expired enrollment record',
      ipAddress: '127.0.0.1',
      userAgent: 'System Process',
      severity: 'Low',
      status: 'Success'
    },
    {
      id: '4',
      timestamp: '2024-07-22T14:15:22Z',
      user: 'Unknown User',
      userEmail: 'unknown@external.com',
      action: 'LOGIN_ATTEMPT',
      resource: 'Authentication',
      resourceId: 'AUTH-FAIL-001',
      details: 'Failed login attempt with invalid credentials',
      ipAddress: '203.45.67.89',
      userAgent: 'Unknown Bot',
      severity: 'High',
      status: 'Failed'
    },
    {
      id: '5',
      timestamp: '2024-07-22T14:10:18Z',
      user: 'Finance Officer',
      userEmail: 'finance@anu.edu.eg',
      action: 'EXPORT',
      resource: 'Financial Report',
      resourceId: 'FIN-RPT-07-2024',
      details: 'Exported monthly financial summary report',
      ipAddress: '192.168.1.120',
      userAgent: 'Mozilla/5.0 (Chrome)',
      severity: 'Medium',
      status: 'Success'
    }
  ];

  const systemEvents = [
    {
      id: '1',
      type: 'Database Backup',
      status: 'Completed',
      timestamp: '2024-07-22T02:00:00Z',
      duration: '45 minutes',
      details: 'Automated daily backup completed successfully'
    },
    {
      id: '2',
      type: 'Security Scan',
      status: 'Completed',
      timestamp: '2024-07-22T01:30:00Z',
      duration: '15 minutes',
      details: 'No security vulnerabilities detected'
    },
    {
      id: '3',
      type: 'System Update',
      status: 'In Progress',
      timestamp: '2024-07-22T00:00:00Z',
      duration: 'Ongoing',
      details: 'Installing security patches and updates'
    }
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'default';
      case 'UPDATE': return 'secondary';
      case 'DELETE': return 'destructive';
      case 'LOGIN_ATTEMPT': return 'outline';
      case 'EXPORT': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'default';
      case 'Failed': return 'destructive';
      case 'Warning': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success': return CheckCircle;
      case 'Failed': return XCircle;
      case 'Warning': return AlertTriangle;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-slate-900 break-words">Audit Logs</h2>
          <p className="text-slate-600 mt-1 break-words">Monitor system activity, user actions, and security events</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex">
          <Button variant="outline" className="gap-2 w-full">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </Button>
          <Button className="gap-2 w-full">
            <Download className="w-4 h-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search logs by user, action, resource, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:shrink-0">
              <Button variant="outline" className="w-full">Filter by User</Button>
              <Button variant="outline" className="w-full">Filter by Action</Button>
              <Button variant="outline" className="w-full">Filter by Date</Button>
              <Button variant="outline" className="w-full">Filter by Severity</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">1,247</p>
                <p className="text-sm text-slate-600">Total Events Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">1,195</p>
                <p className="text-sm text-slate-600">Successful Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">52</p>
                <p className="text-sm text-slate-600">Failed Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">15</p>
                <p className="text-sm text-slate-600">High Severity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            System Audit Trail
          </CardTitle>
          <CardDescription>
            Detailed log of all user actions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => {
              const StatusIcon = getStatusIcon(log.status);
              return (
                <div key={log.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-slate-100 text-slate-700 text-xs">
                        {log.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-medium text-slate-900 break-words">{log.user}</h4>
                            <Badge variant={getActionColor(log.action)}>
                              {log.action}
                            </Badge>
                            <Badge variant={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{log.userEmail}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${
                            log.status === 'Success' ? 'text-green-600' : 
                            log.status === 'Failed' ? 'text-red-600' : 'text-orange-600'
                          }`} />
                          <Badge variant={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-slate-700 mb-2">{log.details}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <span className="font-medium">Resource:</span> {log.resource} ({log.resourceId})
                          </div>
                          <div>
                            <span className="font-medium">Timestamp:</span> {new Date(log.timestamp).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">IP Address:</span> {log.ipAddress}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium">User Agent:</span> 
                            <span className="ml-1 inline-block max-w-full truncate align-bottom">{log.userAgent}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                        <Button size="sm" variant="outline" className="gap-1 w-full sm:w-auto">
                          <Eye className="w-3 h-3" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          Related Events
                        </Button>
                        {log.status === 'Failed' && (
                          <Button size="sm" variant="outline" className="w-full text-orange-600 hover:text-orange-700 sm:w-auto">
                            Investigate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Events
          </CardTitle>
          <CardDescription>
            Automated system processes and maintenance activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemEvents.map((event) => (
              <div key={event.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-slate-900">{event.type}</h4>
                    <p className="text-sm text-slate-600">{event.details}</p>
                  </div>
                  <Badge variant={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div>
                    <span className="font-medium">Started:</span> {new Date(event.timestamp).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {event.duration}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-3 h-3" />
                    View Logs
                  </Button>
                  {event.status === 'In Progress' && (
                    <Button size="sm" variant="outline" className="text-orange-600 hover:text-orange-700">
                      Monitor Progress
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Overview
          </CardTitle>
          <CardDescription>
            Recent security events and threat detection summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Failed Login Attempts</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Last 24 hours:</span>
                  <span className="font-medium text-red-600">23 attempts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Blocked IPs:</span>
                  <span className="font-medium">8 addresses</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Most targeted:</span>
                  <span className="font-medium">admin@anu.edu.eg</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Access Patterns</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Peak hours:</span>
                  <span className="font-medium">9 AM - 5 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Unique users:</span>
                  <span className="font-medium">156 today</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Average session:</span>
                  <span className="font-medium">2.5 hours</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-3">System Health</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Uptime:</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Last backup:</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Security updates:</span>
                  <span className="font-medium text-green-600">Up to date</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Management */}
      <Card>
        <CardHeader>
          <CardTitle>Log Management</CardTitle>
          <CardDescription>
            Configure audit log settings and retention policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg text-center">
              <Download className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <h4 className="font-medium text-slate-900 mb-1">Export Logs</h4>
              <p className="text-sm text-slate-600 mb-3">Download audit logs for compliance</p>
              <Button size="sm" variant="outline">Export All</Button>
            </div>
            
            <div className="p-4 border border-slate-200 rounded-lg text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <h4 className="font-medium text-slate-900 mb-1">Retention Policy</h4>
              <p className="text-sm text-slate-600 mb-3">Configure log retention settings</p>
              <Button size="sm" variant="outline">Manage Policy</Button>
            </div>
            
            <div className="p-4 border border-slate-200 rounded-lg text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <h4 className="font-medium text-slate-900 mb-1">Alert Rules</h4>
              <p className="text-sm text-slate-600 mb-3">Set up security alert notifications</p>
              <Button size="sm" variant="outline">Configure Alerts</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
