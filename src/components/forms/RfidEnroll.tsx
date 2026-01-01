import { useState, useEffect, useRef, useCallback } from 'react';
import { CreditCard, Check, AlertCircle, Loader2, Usb, Keyboard, AlertTriangle } from 'lucide-react';
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
  const [focusLost, setFocusLost] = useState(false);
  const [usbBuffer, setUsbBuffer] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
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
    setUsbBuffer('');
    toast.success('Card scanned successfully!');
  }, [onChange, checkDuplicate]);

  // Process USB buffer for card submission
  const processUsbBuffer = useCallback((buffer: string) => {
    if (buffer.length >= 4) {
      handleCardScanned(buffer);
    }
  }, [handleCardScanned]);

  // Handle USB input change (hidden input captures all keyboard input from RFID reader)
  const handleUsbInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setUsbBuffer(newValue);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Auto-submit after 500ms of no input
    timeoutRef.current = setTimeout(() => {
      if (newValue.length >= 4) {
        processUsbBuffer(newValue);
      }
    }, 500);
  };

  // Handle Enter key for USB input
  const handleUsbKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (usbBuffer.length >= 4) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        processUsbBuffer(usbBuffer);
      }
    }
  };

  // Handle focus events for hidden input
  const handleUsbInputBlur = () => {
    if (status === 'waiting' && inputMode === 'usb') {
      setFocusLost(true);
    }
  };

  const handleUsbInputFocus = () => {
    setFocusLost(false);
  };

  // Refocus hidden input
  const refocusUsbInput = () => {
    hiddenInputRef.current?.focus();
    setFocusLost(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startEnrollment = () => {
    setStatus('waiting');
    setErrorMessage('');
    setUsbBuffer('');
    setFocusLost(false);
    
    if (inputMode === 'usb') {
      // Focus on hidden input for USB mode
      setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 100);
    } else if (inputMode === 'manual' && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const cancelEnrollment = () => {
    setStatus('idle');
    setUsbBuffer('');
    setManualInput('');
    setFocusLost(false);
  };

  const clearCard = () => {
    onChange('');
    setStatus('idle');
    setManualInput('');
    setUsbBuffer('');
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
      {/* Hidden input for USB RFID reader - captures all keyboard input */}
      {status === 'waiting' && inputMode === 'usb' && (
        <input
          ref={hiddenInputRef}
          type="text"
          className="absolute -left-[9999px] opacity-0 pointer-events-none"
          value={usbBuffer}
          onChange={handleUsbInputChange}
          onKeyDown={handleUsbKeyDown}
          onBlur={handleUsbInputBlur}
          onFocus={handleUsbInputFocus}
          autoComplete="off"
          aria-hidden="true"
        />
      )}

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

      {/* Focus Lost Warning */}
      {focusLost && status === 'waiting' && inputMode === 'usb' && (
        <div className="bg-warning/20 border border-warning rounded-lg p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-warning">Focus হারিয়ে গেছে!</p>
            <p className="text-xs text-muted-foreground">কার্ড স্ক্যান করতে নিচে ক্লিক করুন</p>
          </div>
          <Button 
            type="button"
            size="sm" 
            variant="outline"
            onClick={refocusUsbInput}
            className="border-warning text-warning hover:bg-warning hover:text-warning-foreground"
          >
            Refocus
          </Button>
        </div>
      )}

      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed p-6 transition-all duration-300 cursor-pointer',
          status === 'idle' && 'border-border bg-muted/30',
          status === 'waiting' && !focusLost && 'border-primary bg-primary/5',
          status === 'waiting' && focusLost && 'border-warning bg-warning/5',
          status === 'success' && 'border-success bg-success/5',
          status === 'error' && 'border-destructive bg-destructive/5'
        )}
        onClick={() => {
          if (status === 'waiting' && inputMode === 'usb') {
            refocusUsbInput();
          }
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              status === 'idle' && 'bg-muted text-muted-foreground',
              status === 'waiting' && !focusLost && 'bg-primary/20 text-primary',
              status === 'waiting' && focusLost && 'bg-warning/20 text-warning',
              status === 'success' && 'bg-success/20 text-success',
              status === 'error' && 'bg-destructive/20 text-destructive'
            )}
          >
            {status === 'waiting' ? (
              focusLost ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <Loader2 className="w-8 h-8 animate-spin" />
              )
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
                <p className={cn(
                  "font-medium animate-pulse",
                  focusLost ? "text-warning" : "text-primary"
                )}>
                  {focusLost ? 'Click here to continue...' : 'Waiting for Card...'}
                </p>
                <p className="text-sm text-muted-foreground font-bengali">
                  {focusLost ? 'স্ক্যান চালিয়ে যেতে এখানে ক্লিক করুন' : 'কার্ড ট্যাপ করুন'}
                </p>
              </div>
              {!focusLost && (
                <>
                  <p className="text-xs text-muted-foreground text-center">
                    Scan the RFID card with your USB reader
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Usb className="w-4 h-4" />
                    <span>USB Reader Active</span>
                  </div>
                  {usbBuffer && (
                    <div className="bg-muted px-3 py-1 rounded text-xs font-mono">
                      Reading: {usbBuffer}
                    </div>
                  )}
                </>
              )}
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
