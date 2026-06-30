import { useState } from 'react';
import type { FormEvent } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthService } from '../api';
import type { LoginResponse } from '../api';
import type { UserRole } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

interface SuperAdminLoginPageProps {
  onLogin: (email: string, role: UserRole, session?: LoginResponse) => void;
}

export function SuperAdminLoginPage({ onLogin }: SuperAdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await AuthService.loginSuperAdmin(email, password);
      onLogin(email, 'superadmin', session);
    } catch (error: any) {
      toast.error(error?.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_440px]">
          <section className="space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Shield className="h-7 w-7 text-emerald-300" />
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
                UniAct Control Center
              </p>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight lg:text-6xl">
                Super admin access for university management.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                Manage universities, tenant root admins, and platform super admins from one secured workspace.
              </p>
            </div>
          </section>

          <Card className="border-white/10 bg-white text-slate-950 shadow-2xl">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Use your verified super administrator account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@uniact.website"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Open Super Admin'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
