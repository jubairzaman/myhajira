import { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, AlertCircle } from 'lucide-react';

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

export const VideoPlayer = forwardRef<HTMLDivElement, VideoPlayerProps>(
  ({ videos, isPaused = false, onVideoEnd, hideControls = false, className }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleVideoEnd = useCallback(() => {
      const nextIndex = (currentIndex + 1) % videos.length;
      setCurrentIndex(nextIndex);
      setIsLoading(true);
      setHasError(false);

      if (nextIndex === 0 && onVideoEnd) {
        onVideoEnd();
      }
    }, [currentIndex, videos.length, onVideoEnd]);

    // Reset when video changes
    useEffect(() => {
      setIsLoading(true);
      setHasError(false);

      // Auto-advance fallback timer (60 seconds)
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleVideoEnd();
      }, 60000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [currentIndex, handleVideoEnd]);

    // Pause/Resume video
    useEffect(() => {
      if (!videoRef.current) return;

      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
      }
    }, [isPaused]);

    const handlePrevious = () => {
      setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
      setIsLoading(true);
      setHasError(false);
    };

    const handleNext = () => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
      setIsLoading(true);
      setHasError(false);
    };

    const handleVideoLoaded = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleVideoError = useCallback(() => {
      console.error('[VideoPlayer] Video error, skipping to next');
      setHasError(true);
      setIsLoading(false);

      // Auto-advance after 5 seconds on error
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleVideoEnd();
      }, 5000);
    }, [handleVideoEnd]);

    if (videos.length === 0) {
      return (
        <div className={cn('flex items-center justify-center bg-black/50 text-white/60', className)}>
          <div className="text-center">
            <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="font-bengali">কোনো ভিডিও যোগ করা হয়নি</p>
          </div>
        </div>
      );
    }

    const currentVideo = videos[currentIndex];

    return (
      <div ref={ref} className={cn('relative bg-black', className)}>
        {/* Loading indicator */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="font-bengali">ভিডিও লোড হচ্ছে...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-white text-center max-w-sm px-6">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <p className="font-bengali text-lg mb-2">ভিডিও লোড করা যায়নি</p>
              <p className="text-white/60 text-sm">পরবর্তী ভিডিও অটো প্লে হবে...</p>
            </div>
          </div>
        )}

        {/* Video Player */}
        <video
          ref={videoRef}
          key={currentVideo.id}
          src={currentVideo.video_url}
          autoPlay
          muted
          loop={videos.length === 1}
          playsInline
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          onLoadedData={handleVideoLoaded}
          className="w-full h-full object-cover"
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
                <p className="text-white text-sm font-medium truncate max-w-[240px]">{currentVideo.title}</p>
                <span className="text-white/60 text-sm">{currentIndex + 1} / {videos.length}</span>
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
                onClick={() => {
                  setCurrentIndex(index);
                  setIsLoading(true);
                  setHasError(false);
                }}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex ? 'bg-white w-4' : 'bg-white/40'
                )}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
