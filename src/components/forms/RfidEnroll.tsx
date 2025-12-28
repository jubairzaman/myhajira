import { useState, useEffect, useRef, useCallback } from 'react';
import { CreditCard, Check, AlertCircle, Loader2, Usb, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RfidEnrollProps {
  value?: string;
  onChange: (value: string) => void;
  type?: 'student' | 'teacher';
  checkDuplicate?: boolean;
}

export function RfidEnroll({ 
  value, 
  onChange, 
  type = 'student',
  checkDuplicate = true 
}: RfidEnrollProps) {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [inputMode, setInputMode] = useState<'usb' | 'manual'>('usb');
  const [manualInput, setManualInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if card number already exists
  const checkCardExists = async (cardNumber: string): Promise<boolean> => {
    if (!checkDuplicate) return false;

    try {
      // Check in student RFID cards
      const { data: studentCards } = await supabase
        .from('rfid_cards_students')
        .select('id')
        .eq('card_number', cardNumber)
        .eq('is_active', true)
        .limit(1);

      if (studentCards && studentCards.length > 0) {
        return true;
      }

      // Check in teacher RFID cards
      const { data: teacherCards } = await supabase
        .from('rfid_cards_teachers')
        .select('id')
        .eq('card_number', cardNumber)
        .eq('is_active', true)
        .limit(1);

      if (teacherCards && teacherCards.length > 0) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking card:', error);
      return false;
    }
  };

  // Handle successful card scan
  const handleCardScanned = useCallback(async (cardNumber: string) => {
    const trimmedCard = cardNumber.trim();
    
    if (!trimmedCard || trimmedCard.length < 4) {
      setErrorMessage('Invalid card number');
      setStatus('error');
      return;
    }

    // Check for duplicates
    const exists = await checkCardExists(trimmedCard);
    if (exists) {
      setErrorMessage('This card is already registered to another person');
      setStatus('error');
      toast.error('Card already in use');
      return;
    }

    onChange(trimmedCard);
    setStatus('success');
    toast.success('Card scanned successfully!');
  }, [onChange, checkDuplicate]);

  // USB RFID Reader - listens for keyboard input when in waiting mode
  useEffect(() => {
    if (status !== 'waiting' || inputMode !== 'usb') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If Enter key, process the buffer
      if (e.key === 'Enter') {
        e.preventDefault();
        if (bufferRef.current.length > 0) {
          handleCardScanned(bufferRef.current);
          bufferRef.current = '';
        }
        return;
      }

      // Ignore modifier keys and special keys
      if (e.key.length > 1 && !['Backspace'].includes(e.key)) {
        return;
      }

      // Handle backspace
      if (e.key === 'Backspace') {
        bufferRef.current = bufferRef.current.slice(0, -1);
        return;
      }

      // Add character to buffer
      bufferRef.current += e.key;

      // Auto-submit after 500ms of no input (for readers that don't send Enter)
      timeoutRef.current = setTimeout(() => {
        if (bufferRef.current.length >= 4) {
          handleCardScanned(bufferRef.current);
          bufferRef.current = '';
        }
      }, 500);
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [status, inputMode, handleCardScanned]);

  const startEnrollment = () => {
    setStatus('waiting');
    setErrorMessage('');
    bufferRef.current = '';
    
    if (inputMode === 'manual' && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const cancelEnrollment = () => {
    setStatus('idle');
    bufferRef.current = '';
    setManualInput('');
  };

  const clearCard = () => {
    onChange('');
    setStatus('idle');
    setManualInput('');
  };

  const handleManualSubmit = async () => {
    if (manualInput.trim().length >= 4) {
      await handleCardScanned(manualInput);
      setManualInput('');
    } else {
      setErrorMessage('Card number must be at least 4 characters');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Selector - only show when idle and no value */}
      {status === 'idle' && !value && (
        <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg">
          <Button
            type="button"
            variant={inputMode === 'usb' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setInputMode('usb')}
            className="gap-2 flex-1"
          >
            <Usb className="w-4 h-4" />
            USB Reader
          </Button>
          <Button
            type="button"
            variant={inputMode === 'manual' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setInputMode('manual')}
            className="gap-2 flex-1"
          >
            <Keyboard className="w-4 h-4" />
            Manual
          </Button>
        </div>
      )}

      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed p-6 transition-all duration-300',
          status === 'idle' && 'border-border bg-muted/30',
          status === 'waiting' && 'border-primary bg-primary/5',
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
                {inputMode === 'usb' 
                  ? 'USB RFID Reader Mode - Connect your USB reader'
                  : 'Manual Entry Mode - Type card number manually'}
              </p>
            </>
          )}

          {status === 'waiting' && inputMode === 'usb' && (
            <>
              <div className="text-center">
                <p className="font-medium text-primary animate-pulse">Waiting for Card...</p>
                <p className="text-sm text-muted-foreground font-bengali">
                  কার্ড ট্যাপ করুন
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan the RFID card with your USB reader
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Usb className="w-4 h-4" />
                <span>USB Reader Active</span>
              </div>
            </>
          )}

          {status === 'waiting' && inputMode === 'manual' && (
            <>
              <div className="text-center">
                <p className="font-medium text-primary">Enter Card Number</p>
                <p className="text-sm text-muted-foreground font-bengali">
                  কার্ড নম্বর লিখুন
                </p>
              </div>
              <div className="w-full max-w-xs space-y-2">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter card number..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleManualSubmit();
                    }
                  }}
                  className="text-center font-mono"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleManualSubmit}
                  className="w-full"
                  disabled={manualInput.trim().length < 4}
                >
                  Enroll Card
                </Button>
              </div>
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
