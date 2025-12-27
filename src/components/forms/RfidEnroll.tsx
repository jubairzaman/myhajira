import { useState } from 'react';
import { CreditCard, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RfidEnrollProps {
  value?: string;
  onChange: (value: string) => void;
  deviceIp?: string;
}

export function RfidEnroll({ value, onChange, deviceIp = '192.168.1.100' }: RfidEnrollProps) {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const startEnrollment = () => {
    setStatus('waiting');
    setErrorMessage('');

    // Simulate RFID card reading (in production, this would connect to ZKTeco device)
    setTimeout(() => {
      // Simulate successful card read
      const cardId = `RFID-${Date.now().toString(36).toUpperCase()}`;
      onChange(cardId);
      setStatus('success');
    }, 3000);
  };

  const cancelEnrollment = () => {
    setStatus('idle');
  };

  const clearCard = () => {
    onChange('');
    setStatus('idle');
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed p-6 transition-all duration-300',
          status === 'idle' && 'border-border bg-muted/30',
          status === 'waiting' && 'border-primary bg-primary/5 animate-pulse',
          status === 'success' && 'border-success bg-success/5',
          status === 'error' && 'border-destructive bg-destructive/5'
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              status === 'idle' && 'bg-muted text-muted-foreground',
              status === 'waiting' && 'bg-primary/20 text-primary',
              status === 'success' && 'bg-success/20 text-success',
              status === 'error' && 'bg-destructive/20 text-destructive'
            )}
          >
            {status === 'waiting' ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : status === 'success' ? (
              <Check className="w-8 h-8" />
            ) : status === 'error' ? (
              <AlertCircle className="w-8 h-8" />
            ) : (
              <CreditCard className="w-8 h-8" />
            )}
          </div>

          {status === 'idle' && !value && (
            <>
              <div className="text-center">
                <p className="font-medium text-foreground">RFID Card Enrollment</p>
                <p className="text-sm text-muted-foreground font-bengali">
                  আরএফআইডি কার্ড নিবন্ধন
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Device IP: {deviceIp}
              </p>
            </>
          )}

          {status === 'waiting' && (
            <>
              <div className="text-center">
                <p className="font-medium text-primary">Waiting for Card...</p>
                <p className="text-sm text-muted-foreground font-bengali">
                  কার্ড ট্যাপ করুন
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-center animate-pulse">
                Please tap the RFID card on the device
              </p>
            </>
          )}

          {status === 'success' && value && (
            <>
              <div className="text-center">
                <p className="font-medium text-success">Card Enrolled!</p>
                <p className="text-sm text-muted-foreground font-bengali">
                  কার্ড নিবন্ধিত হয়েছে
                </p>
              </div>
              <div className="bg-success/10 px-4 py-2 rounded-lg">
                <p className="text-sm font-mono text-success">{value}</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <div className="text-center">
              <p className="font-medium text-destructive">Enrollment Failed</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {status === 'idle' && !value && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={startEnrollment}
            className="gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span className="font-bengali">কার্ড নিবন্ধন শুরু করুন</span>
          </Button>
        )}

        {status === 'waiting' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cancelEnrollment}
          >
            Cancel
          </Button>
        )}

        {(status === 'success' || value) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearCard}
          >
            Remove Card
          </Button>
        )}

        {status === 'error' && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={startEnrollment}
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
