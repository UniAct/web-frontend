import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import {
  Settings,
  Globe,
  Mail,
  Clock,
  Download,
  Upload,
  Database,
  Palette,
  Shield,
  Bell,
  Save,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface UniversitySettingsPageProps {
  selectedUniversity: string | null;
  setSelectedUniversity: (id: string | null) => void;
}

export function UniversitySettingsPage({ selectedUniversity }: UniversitySettingsPageProps) {
  const [settings, setSettings] = useState({
    // Branding
    universityName: 'Alexandria National University',
    logoUrl: '',
    primaryColor: '#2563eb',
    secondaryColor: '#7c3aed',

    // Domain Settings
    domain: 'anu.edu.eg',
    allowedEmailDomains: ['anu.edu.eg', 'students.anu.edu.eg'],

    // System Settings
    timezone: 'Africa/Cairo',
    academicYearStart: '2024-09-01',
    academicYearEnd: '2025-06-30',

    // Data Retention
    dataRetentionPeriod: 7, // years
    autoArchiveEnabled: true,

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    systemAlerts: true,

    // Security
    twoFactorRequired: false,
    passwordExpiration: 90, // days
    sessionTimeout: 120, // minutes
  });

  const [newEmailDomain, setNewEmailDomain] = useState('');

  const handleSaveSettings = () => {
    // In a real app, this would make an API call
    toast.success('Settings saved successfully');
  };

  const handleAddEmailDomain = () => {
    if (!newEmailDomain) return;

    if (settings.allowedEmailDomains.includes(newEmailDomain)) {
      toast.error('Domain already exists');
      return;
    }

    setSettings({
      ...settings,
      allowedEmailDomains: [...settings.allowedEmailDomains, newEmailDomain]
    });
    setNewEmailDomain('');
    toast.success('Email domain added');
  };

  const handleRemoveEmailDomain = (domain: string) => {
    setSettings({
      ...settings,
      allowedEmailDomains: settings.allowedEmailDomains.filter(d => d !== domain)
    });
    toast.success('Email domain removed');
  };

  const handleExportConfig = () => {
    const configData = JSON.stringify(settings, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.universityName.toLowerCase().replace(/\s+/g, '-')}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Configuration exported');
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings({ ...settings, ...importedSettings });
        toast.success('Configuration imported successfully');
      } catch (error) {
        toast.error('Invalid configuration file');
      }
    };
    reader.readAsText(file);
  };

  if (!selectedUniversity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No University Selected</h3>
          <p className="text-slate-600 text-center">Please select a university from the Universities page to manage its settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">University Settings</h2>
          <p className="text-slate-600 mt-1">Configure system settings for {settings.universityName}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportConfig} className="gap-2">
            <Download className="w-4 h-4" />
            Export Config
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Import Config
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="hidden"
            />
          </label>
          <Button onClick={handleSaveSettings} className="gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Branding & Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of your university portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    University Name
                  </label>
                  <Input
                    value={settings.universityName}
                    onChange={(e) => setSettings({ ...settings, universityName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Logo URL
                  </label>
                  <Input
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-12 h-10 rounded border border-slate-300"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      placeholder="#2563eb"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="w-12 h-10 rounded border border-slate-300"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      placeholder="#7c3aed"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Color Preview</h4>
                <div className="flex gap-4">
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Primary
                  </div>
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: settings.secondaryColor }}
                  >
                    Secondary
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Settings */}
        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Domain Configuration
              </CardTitle>
              <CardDescription>Manage allowed email domains and domain settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Primary Domain
                </label>
                <Input
                  value={settings.domain}
                  onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Allowed Email Domains
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input
                      value={newEmailDomain}
                      onChange={(e) => setNewEmailDomain(e.target.value)}
                      placeholder="e.g., students.anu.edu.eg"
                    />
                    <Button onClick={handleAddEmailDomain}>Add Domain</Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {settings.allowedEmailDomains.map((domain) => (
                      <Badge key={domain} variant="outline" className="gap-2">
                        <Mail className="w-3 h-3" />
                        {domain}
                        <button
                          onClick={() => handleRemoveEmailDomain(domain)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Configure timezone and academic calendar settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                    <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Academic Year Start
                  </label>
                  <Input
                    type="date"
                    value={settings.academicYearStart}
                    onChange={(e) => setSettings({ ...settings, academicYearStart: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Academic Year End
                  </label>
                  <Input
                    type="date"
                    value={settings.academicYearEnd}
                    onChange={(e) => setSettings({ ...settings, academicYearEnd: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>Configure data retention and archival policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Auto-Archive Old Records</h4>
                  <p className="text-sm text-slate-600">Automatically archive old student records and data</p>
                </div>
                <Switch
                  checked={settings.autoArchiveEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoArchiveEnabled: checked })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data Retention Period (Years)
                </label>
                <Input
                  type="number"
                  value={settings.dataRetentionPeriod}
                  onChange={(e) => setSettings({ ...settings, dataRetentionPeriod: parseInt(e.target.value) })}
                  min="1"
                  max="20"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Data older than this period will be archived or deleted according to policy
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Data Retention Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Changes to data retention policies may take up to 24 hours to take effect.
                      Consult your legal team before modifying retention periods.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system-wide notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">Email Notifications</h4>
                    <p className="text-sm text-slate-600">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">SMS Notifications</h4>
                    <p className="text-sm text-slate-600">Send urgent notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">System Alerts</h4>
                    <p className="text-sm text-slate-600">Show system alerts and maintenance notices</p>
                  </div>
                  <Switch
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, systemAlerts: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure authentication and security policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Require Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-600">Enforce 2FA for all users</p>
                </div>
                <Switch
                  checked={settings.twoFactorRequired}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorRequired: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password Expiration (Days)
                  </label>
                  <Input
                    type="number"
                    value={settings.passwordExpiration}
                    onChange={(e) => setSettings({ ...settings, passwordExpiration: parseInt(e.target.value) })}
                    min="0"
                    max="365"
                  />
                  <p className="text-sm text-slate-500 mt-1">Set to 0 to disable password expiration</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Session Timeout (Minutes)
                  </label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                    min="15"
                    max="480"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
