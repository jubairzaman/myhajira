import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  video_url: string;
}

interface VideoPlayerProps {
  videos: VideoItem[];
  isPaused?: boolean;
  hideControls?: boolean;
  onVideoEnd?: () => void;
  className?: string;
}

// Convert Google Drive share URL to embed URL with autoplay
function convertGoogleDriveUrl(url: string): string {
  // Pattern: https://drive.google.com/file/d/FILE_ID/view
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview?autoplay=1&mute=1`;
  }
  
  // Pattern: https://drive.google.com/open?id=FILE_ID
  const openIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch) {
    return `https://drive.google.com/file/d/${openIdMatch[1]}/preview?autoplay=1&mute=1`;
  }
  
  // Already an embed URL or other format - add autoplay params if not present
  if (!url.includes('autoplay')) {
    return url + (url.includes('?') ? '&' : '?') + 'autoplay=1&mute=1';
  }
  return url;
}

export function VideoPlayer({ videos, isPaused = false, onVideoEnd, hideControls = false, className }: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isIframeMuted, setIsIframeMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance to next video every 60 seconds (Google Drive doesn't provide video end events)
  useEffect(() => {
    if (videos.length === 0 || isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % videos.length;
      setCurrentIndex(nextIndex);
      if (nextIndex === 0 && onVideoEnd) {
        onVideoEnd();
      }
    }, 60000); // 60 seconds per video

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, videos.length, isPaused, onVideoEnd]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  if (videos.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-black/50 text-white/60",
        className
      )}>
        <div className="text-center">
          <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="font-bengali">কোনো ভিডিও যোগ করা হয়নি</p>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];
  const embedUrl = convertGoogleDriveUrl(currentVideo.video_url);

  return (
    <div className={cn("relative bg-black", className)}>
      {/* Video iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{ border: 'none' }}
      />

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <Pause className="h-16 w-16 mx-auto mb-4" />
            <p className="text-2xl font-bengali">পাঞ্চ প্রদর্শন হচ্ছে</p>
          </div>
        </div>
      )}

      {/* Video info bar - only show when not hideControls */}
      {!hideControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-white text-sm font-medium truncate max-w-[200px]">
                {currentVideo.title}
              </p>
              <span className="text-white/60 text-sm">
                {currentIndex + 1} / {videos.length}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
              >
                ◀
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video indicator dots - only show when not hideControls */}
      {!hideControls && videos.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex ? "bg-white w-4" : "bg-white/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
