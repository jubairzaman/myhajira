import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoCaptureProps {
  value?: string;
  onChange: (value: string) => void;
}

export function PhotoCapture({ value, onChange }: PhotoCaptureProps) {
  const [mode, setMode] = useState<'idle' | 'camera' | 'preview'>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 400, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setMode('camera');
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setMode('idle');
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onChange(dataUrl);
        stopCamera();
        setMode('preview');
      }
    }
  }, [onChange, stopCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        setMode('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    onChange('');
    setMode('idle');
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="photo-upload-area w-40 h-48 mx-auto relative overflow-hidden">
        {mode === 'idle' && !value && (
          <div className="flex flex-col items-center justify-center gap-3 p-4">
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

        {(mode === 'preview' || value) && (
          <img
            src={value}
            alt="Captured"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        {mode === 'idle' && (
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
              variant="success"
              size="sm"
              onClick={capturePhoto}
              className="gap-2"
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
