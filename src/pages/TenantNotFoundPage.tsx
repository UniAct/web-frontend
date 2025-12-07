import { Building2, AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

interface TenantNotFoundPageProps {
  subdomain: string;
  onGoHome: () => void;
}

export function TenantNotFoundPage({ subdomain, onGoHome }: TenantNotFoundPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-red-200">
        <div className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <Building2 className="w-16 h-16 text-red-500" />
              <AlertTriangle className="w-8 h-8 text-red-600 absolute bottom-0 right-0" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Tenant Not Registered</h1>
            <p className="text-base text-slate-700 font-semibold text-red-600">
              Unfortunately, this tenant is not registered with us
            </p>
          </div>

          {/* Subdomain Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Subdomain:</span> <code className="bg-red-100 px-3 py-1 rounded text-red-800 font-mono">{subdomain}</code>
            </p>
          </div>

          {/* Help Text */}
          <div className="text-left space-y-3">
            <p className="text-sm text-slate-600 font-semibold">
              This could mean:
            </p>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>The tenant has not been registered yet</li>
              <li>The domain name is incorrect</li>
              <li>The tenant account has been deactivated</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Open contact or help page
                alert('Please contact your system administrator to register this tenant.');
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Contact Administrator
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-xs text-slate-500 border-t pt-4">
            <p>If you believe this is an error, please contact the system administrator.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
