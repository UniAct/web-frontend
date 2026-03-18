import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../api';
import { TenantDetectionService } from '../services/TenantDetectionService';

const decodeTokenPayload = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

export default function VerifyRootAccountPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account...');
  const [universityData, setUniversityData] = useState<{
    subdomain: string;
    name: string;
  } | null>(null);
  const token = searchParams.get('token');
  const redirectStatus = searchParams.get('status');
  const universityParam = searchParams.get('university');

  useEffect(() => {
    const decoded = token ? decodeTokenPayload(token) : null;
    const decodedUniversityName =
      typeof decoded?.university_name === 'string' ? decoded.university_name : undefined;
    const decodedSchemaName =
      typeof decoded?.schema_name === 'string' ? decoded.schema_name : undefined;

    // If backend redirected with success status, show success immediately
    if (redirectStatus === 'success' && universityParam) {
      setStatus('success');
      setMessage('Your account has been verified successfully!');

      const subdomain = TenantDetectionService.buildTenantKey(
        decodedSchemaName || universityParam,
      );
      const displayName = decodedUniversityName || universityParam;

      TenantDetectionService.rememberTenantMapping(displayName, subdomain);

      setUniversityData({
        subdomain,
        name: displayName,
      });
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Token is missing.');
      return;
    }

    verifyAccount();
  }, [token, redirectStatus, universityParam]);

  const verifyAccount = async () => {
    try {
      setStatus('loading');
      setMessage('Verifying your account...');

      // Decode the JWT to extract information
      const decoded = decodeTokenPayload(token!);
      const universityName =
        typeof decoded?.university_name === 'string' ? decoded.university_name : undefined;
      const schemaName =
        typeof decoded?.schema_name === 'string' ? decoded.schema_name : undefined;

      // Call the verification endpoint
      const response = await apiClient.verifyRootAccount(token!);

      if (response.status === 'success') {
        const subdomain = TenantDetectionService.buildTenantKey(schemaName || universityName || '');
        const displayName = universityName || schemaName || 'your university';

        if (!subdomain) {
          throw new Error('Tenant key could not be detected from the verification token');
        }

        TenantDetectionService.rememberTenantMapping(displayName, subdomain);

        setStatus('success');
        setMessage('Your account has been verified successfully!');
        setUniversityData({
          subdomain,
          name: displayName,
        });
      } else {
        setStatus('error');
        setMessage(response.message || 'Failed to verify account. Please try again.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage(error.message || 'An error occurred during verification. Please try again or contact support.');
    }
  };

  const handleNavigateToTenant = () => {
    if (universityData?.subdomain) {
      TenantDetectionService.navigateToTenant(universityData.subdomain);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Account Verification</CardTitle>
          <CardDescription>Activating your root administrator account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Icon and Message */}
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <div className="text-center">
                  <p className="text-slate-900 font-medium">{message}</p>
                  <p className="text-sm text-slate-500 mt-2">Please wait while we activate your account...</p>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-12 h-12 text-emerald-600" />
                <div className="text-center">
                  <p className="text-slate-900 font-medium text-lg">{message}</p>
                  {universityData && (
                    <p className="text-sm text-slate-500 mt-2">
                      Ready to access <span className="font-semibold">{universityData.name}</span> dashboard
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

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {status === 'success' && universityData && (
              <Button
                onClick={handleNavigateToTenant}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-purple-500 font-medium py-2"
              >
                Go to {universityData.name} Dashboard →
              </Button>
            )}

            {status === 'error' && (
              <>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  Return to Home
                </Button>
                <p className="text-xs text-center text-slate-500">
                  If the problem persists, please contact your system administrator.
                </p>
              </>
            )}

            {status === 'loading' && (
              <Button disabled className="w-full bg-slate-400">
                Verifying...
              </Button>
            )}
          </div>

          {/* Token Display (for debugging) */}
          {token && (
            <details className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
              <summary className="cursor-pointer font-medium">Technical Details</summary>
              <div className="mt-2 space-y-1 break-all font-mono">
                <p>Token: {token.substring(0, 50)}...</p>
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
