import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Download, 
  FileSpreadsheet,
  FileText,
  BarChart3,
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  Clock,
  Filter,
  Play
} from 'lucide-react';

interface ExportsReportsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (university: string | null) => void;
}

export function ExportsReportsPage({ selectedUniversity }: ExportsReportsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock report templates
  const reportTemplates = [
    {
      id: '1',
      name: 'Student Enrollment Report',
      description: 'Comprehensive enrollment statistics by program and semester',
      category: 'Academic',
      format: ['Excel', 'PDF', 'CSV'],
      lastGenerated: '2024-07-20',
      frequency: 'Monthly',
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'Faculty Performance Analytics',
      description: 'Teaching load, course evaluations, and research metrics',
      category: 'Faculty',
      format: ['PDF', 'Excel'],
      lastGenerated: '2024-07-18',
      frequency: 'Quarterly',
      size: '1.8 MB'
    },
    {
      id: '3',
      name: 'Financial Summary Report',
      description: 'Revenue, expenses, and budget allocation across departments',
      category: 'Financial',
      format: ['Excel', 'PDF'],
      lastGenerated: '2024-07-15',
      frequency: 'Monthly',
      size: '3.2 MB'
    },
    {
      id: '4',
      name: 'Course Completion Analysis',
      description: 'Pass rates, dropout analysis, and academic performance trends',
      category: 'Academic',
      format: ['Excel', 'PDF', 'CSV'],
      lastGenerated: '2024-07-19',
      frequency: 'Semester',
      size: '4.1 MB'
    }
  ];

  const recentExports = [
    {
      id: '1',
      filename: 'student_enrollment_july_2024.xlsx',
      type: 'Student Enrollment Report',
      generatedBy: 'Admin User',
      generatedAt: '2024-07-22 14:30',
      size: '2.4 MB',
      status: 'Completed',
      downloadCount: 15
    },
    {
      id: '2',
      filename: 'faculty_analytics_q2_2024.pdf',
      type: 'Faculty Performance Analytics',
      generatedBy: 'HR Manager',
      generatedAt: '2024-07-21 09:15',
      size: '1.8 MB',
      status: 'Completed',
      downloadCount: 8
    },
    {
      id: '3',
      filename: 'financial_summary_july_2024.xlsx',
      type: 'Financial Summary Report',
      generatedBy: 'Finance Officer',
      generatedAt: '2024-07-20 16:45',
      size: '3.2 MB',
      status: 'Processing',
      downloadCount: 0
    }
  ];

  const quickExports = [
    {
      id: '1',
      title: 'All Students Data',
      description: 'Complete student database export',
      icon: Users,
      formats: ['Excel', 'CSV'],
      estimatedSize: '15 MB'
    },
    {
      id: '2',
      title: 'Course Catalog',
      description: 'All courses with details and prerequisites',
      icon: BookOpen,
      formats: ['PDF', 'Excel'],
      estimatedSize: '2 MB'
    },
    {
      id: '3',
      title: 'Faculty Directory',
      description: 'Staff information and contact details',
      icon: GraduationCap,
      formats: ['Excel', 'PDF', 'CSV'],
      estimatedSize: '1 MB'
    },
    {
      id: '4',
      title: 'Academic Calendar',
      description: 'Semester dates, holidays, and important events',
      icon: Calendar,
      formats: ['PDF', 'Excel'],
      estimatedSize: '500 KB'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Academic': return 'default';
      case 'Faculty': return 'secondary';
      case 'Financial': return 'outline';
      case 'Administrative': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Processing': return 'secondary';
      case 'Failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Exports & Reports</h2>
          <p className="text-slate-600 mt-1">Generate and download comprehensive reports and data exports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </Button>
          <Button className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search reports by name, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter by Category</Button>
            <Button variant="outline">Filter by Date Range</Button>
            <Button variant="outline">Filter by Format</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">156</p>
                <p className="text-sm text-slate-600">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">89</p>
                <p className="text-sm text-slate-600">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">12</p>
                <p className="text-sm text-slate-600">Scheduled Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">2.4 GB</p>
                <p className="text-sm text-slate-600">Total Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Quick Exports
          </CardTitle>
          <CardDescription>
            Instantly export common data sets in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickExports.map((export_item) => {
              const Icon = export_item.icon;
              return (
                <div key={export_item.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-slate-900">{export_item.title}</h4>
                      <p className="text-sm text-slate-600 truncate">{export_item.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Size:</span>
                      <span className="text-slate-900">{export_item.estimatedSize}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {export_item.formats.map((format, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button size="sm" className="w-full gap-1">
                    <Download className="w-3 h-3" />
                    Export Now
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Report Templates
          </CardTitle>
          <CardDescription>
            Pre-configured reports with automated generation options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportTemplates.map((template) => (
              <div key={template.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-slate-900">{template.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-sm">
                    <span className="text-slate-600">Last Generated:</span>
                    <p className="font-medium text-slate-900">{new Date(template.lastGenerated).toLocaleDateString()}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">Frequency:</span>
                    <p className="font-medium text-slate-900">{template.frequency}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">File Size:</span>
                    <p className="font-medium text-slate-900">{template.size}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">Formats:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.format.map((format, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="gap-1">
                    <Play className="w-3 h-3" />
                    Generate Now
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    Schedule
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="w-3 h-3" />
                    Download Last
                  </Button>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Exports
          </CardTitle>
          <CardDescription>
            Recently generated reports and export history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExports.map((export_item) => (
              <div key={export_item.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-slate-900">{export_item.filename}</h4>
                    <p className="text-sm text-slate-600">{export_item.type}</p>
                  </div>
                  <Badge variant={getStatusColor(export_item.status)}>
                    {export_item.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-slate-600">Generated by:</span>
                    <p className="font-medium text-slate-900">{export_item.generatedBy}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Generated at:</span>
                    <p className="font-medium text-slate-900">{export_item.generatedAt}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">File size:</span>
                    <p className="font-medium text-slate-900">{export_item.size}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Downloads:</span>
                    <p className="font-medium text-slate-900">{export_item.downloadCount} times</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {export_item.status === 'Completed' && (
                    <Button size="sm" className="gap-1">
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    Share
                  </Button>
                  {export_item.status === 'Processing' && (
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Export Settings & Automation</CardTitle>
          <CardDescription>
            Configure automated reports and export preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <h4 className="font-medium text-slate-900 mb-1">Scheduled Reports</h4>
              <p className="text-sm text-slate-600 mb-3">Automate report generation</p>
              <Button size="sm" variant="outline">Configure Schedules</Button>
            </div>
            
            <div className="p-4 border border-slate-200 rounded-lg text-center">
              <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <h4 className="font-medium text-slate-900 mb-1">Export Formats</h4>
              <p className="text-sm text-slate-600 mb-3">Manage output formats</p>
              <Button size="sm" variant="outline">Format Settings</Button>
            </div>
            
            <div className="p-4 border border-slate-200 rounded-lg text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <h4 className="font-medium text-slate-900 mb-1">Access Permissions</h4>
              <p className="text-sm text-slate-600 mb-3">Control report access</p>
              <Button size="sm" variant="outline">Manage Permissions</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}