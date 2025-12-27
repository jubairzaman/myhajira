import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoCaptureProps {
  value?: string;
  onChange: (value: string) => void;
}

export function PhotoCapture({ value, onChange }: PhotoCaptureProps) {
  const [mode, setMode] = useState<'idle' | 'camera' | 'preview'>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Set video source when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported in this browser');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 320 }, 
          height: { ideal: 400 }, 
          facingMode: 'user' 
        }
      });
      
      setStream(mediaStream);
      setMode('camera');
    } catch (err: any) {
      console.error('Camera access denied:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permission.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Could not access camera. Please try uploading instead.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setMode('idle');
    setError(null);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onChange(dataUrl);
        stopCamera();
        setMode('preview');
      }
    }
  }, [onChange, stopCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        setMode('preview');
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read file');
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow re-uploading same file
    event.target.value = '';
  };

  const clearPhoto = () => {
    onChange('');
    setMode('idle');
    setError(null);
  };

  // Initialize preview mode if value exists
  useEffect(() => {
    if (value && mode === 'idle') {
      setMode('preview');
    }
  }, [value, mode]);

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileUpload}
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="photo-upload-area w-40 h-48 mx-auto relative overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/50">
        {mode === 'idle' && !value && (
          <div className="flex flex-col items-center justify-center gap-3 p-4 h-full">
            <Camera className="w-10 h-10 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center font-bengali">
              ছবি তুলুন বা আপলোড করুন
            </p>
          </div>
        )}

        {mode === 'camera' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {(mode === 'preview' || (value && mode !== 'camera')) && value && (
          <img
            src={value}
            alt="Captured"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}

      <div className="flex items-center justify-center gap-2">
        {mode === 'idle' && !value && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startCamera}
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              <span className="font-bengali">ক্যামেরা</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="font-bengali">আপলোড</span>
            </Button>
          </>
        )}

        {mode === 'camera' && (
          <>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={capturePhoto}
              className="gap-2 bg-success hover:bg-success/90"
            >
              <Camera className="w-4 h-4" />
              <span className="font-bengali">তুলুন</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={stopCamera}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}

        {(mode === 'preview' || value) && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startCamera}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="font-bengali">পুনরায়</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearPhoto}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
