import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { TenantDetectionService } from '../services/TenantDetectionService';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyStaffAccountPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  const tenantParam = searchParams.get('tenant');
  const redirectStatus = searchParams.get('status');

  const tenantData = useMemo(() => {
    if (!tenantParam) return null;

    const tenantKey = TenantDetectionService.buildTenantKey(tenantParam);
    if (!tenantKey) return null;

    return {
      key: tenantKey,
      displayName: tenantParam,
    };
  }, [tenantParam]);

  useEffect(() => {
    if (redirectStatus !== 'success') {
      setStatus('error');
      setMessage('Invalid or expired verification link.');
      return;
    }

    if (!tenantData) {
      setStatus('error');
      setMessage('Account verified, but tenant information is missing. Please contact support.');
      return;
    }

    TenantDetectionService.rememberTenantMapping(tenantData.displayName, tenantData.key);
    setStatus('success');
    setMessage('Your staff account has been verified successfully.');
  }, [redirectStatus, tenantData]);

  useEffect(() => {
    if (status !== 'success' || !tenantData?.key) return;

    const timer = window.setTimeout(() => {
      TenantDetectionService.navigateToTenant(tenantData.key);
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [status, tenantData]);

  const handleNavigateToTenant = () => {
    if (!tenantData?.key) return;
    TenantDetectionService.navigateToTenant(tenantData.key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Staff Account Verification</CardTitle>
          <CardDescription>Activate your tenant account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {status === 'success' && (
              <>
                <CheckCircle className="w-12 h-12 text-emerald-600" />
                <div className="text-center">
                  <p className="text-slate-900 font-medium text-lg">{message}</p>
                  {tenantData && (
                    <p className="text-sm text-slate-500 mt-2">
                      Redirecting to <span className="font-semibold">{tenantData.displayName}</span>. If it does not open, use the button below.
                    </p>
                  )}
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="w-12 h-12 text-red-600" />
                <div className="text-center">
                  <p className="text-slate-900 font-medium text-lg">Verification Failed</p>
                  <p className="text-sm text-slate-500 mt-2">{message}</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3 pt-4">
            {status === 'success' && tenantData && (
              <Button
                onClick={handleNavigateToTenant}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2"
              >
                Go To Tenant Sign In
              </Button>
            )}

            {status === 'error' && (
              <Button
                onClick={() => {
                  TenantDetectionService.navigateToSuperAdmin();
                }}
                variant="outline"
                className="w-full"
              >
                Return to Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
