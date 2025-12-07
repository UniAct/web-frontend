import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { GraduationCap, Mail, QrCode, Shield, Users } from 'lucide-react';
import type { UserRole } from '../App';

interface LoginPageProps {
  onLogin: (email: string, role: UserRole) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'verify'>('email');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow super admin emails to bypass .edu requirement
    const isSuperAdmin = email === 'superadmin@gmail.com' || email === 'arsanyosama3@gmail.com';
    if (email.endsWith('.edu') || isSuperAdmin) {
      setStep('otp');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep('verify');
    }
  };

  const handleVerifySubmit = () => {
    // Auto-assign superadmin role for super admin emails
    const isSuperAdmin = email === 'superadmin@gmail.com' || email === 'arsanyosama3@gmail.com';
    if (isSuperAdmin) {
      onLogin(email, 'superadmin');
    } else {
      onLogin(email, selectedRole);
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student', icon: GraduationCap, color: 'bg-blue-500' },
    { value: 'faculty', label: 'Faculty', icon: Users, color: 'bg-green-500' },
    { value: 'admin', label: 'Administrator', icon: Shield, color: 'bg-purple-500' },
    { value: 'alumni', label: 'Alumni', icon: GraduationCap, color: 'bg-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Branding Section */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-blue-900">UniAct</h1>
              <p className="text-sm text-blue-600">Digital University Ecosystem</p>
            </div>
          </div>

          <h2 className="text-2xl text-gray-800 mb-4">
            Your Complete University Experience
          </h2>
          <p className="text-gray-600 mb-6">
            Streamline your academic journey with AI-powered tools, seamless collaboration,
            and comprehensive university services all in one platform.
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-gray-800">Smart Collaboration</p>
              <p className="text-xs text-gray-600">Team up with AI assistance</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <QrCode className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-gray-800">Digital Attendance</p>
              <p className="text-xs text-gray-600">QR code & GPS tracking</p>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in with your institutional email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={step} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="email" className="text-xs">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="otp" disabled={step === 'email'} className="text-xs">
                  OTP
                </TabsTrigger>
                <TabsTrigger value="verify" disabled={step !== 'verify'} className="text-xs">
                  Verify
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="your.email@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use your institutional email ending with .edu
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={!email.endsWith('.edu') && email !== 'superadmin@gmail.com' && email !== 'arsanyosama3@gmail.com'}>
                    Send Verification Code
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="otp" className="space-y-4">
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Check your email for the verification code
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={otp.length !== 6}>
                    Verify Code
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="verify" className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">Select your role:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((role) => (
                      <button
                        key={role.value}
                        onClick={() => setSelectedRole(role.value as UserRole)}
                        className={`p-3 rounded-lg border-2 transition-all ${selectedRole === role.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className={`w-6 h-6 ${role.color} rounded-md flex items-center justify-center mx-auto mb-1`}>
                          <role.icon className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-xs">{role.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-4 h-4 text-gray-600" />
                    <p className="text-xs text-gray-700">University ID Verification</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Scan QR code with your student ID or tap your ID card on the reader
                  </p>
                </div>

                <Button onClick={handleVerifySubmit} className="w-full">
                  Complete Sign In
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Need help? Contact{' '}
                <button className="text-blue-600 hover:underline">
                  IT Support
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
