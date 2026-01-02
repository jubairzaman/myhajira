import { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, AlertCircle, ExternalLink } from 'lucide-react';

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

function extractGoogleDriveFileId(url: string): string | null {
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) return fileIdMatch[1];

  const openIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch) return openIdMatch[1];

  return null;
}

// Check if URL is a Google Drive link
function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}

// Best-effort direct URL for HTML5 video (may fail due to Drive restrictions)
function convertToDirectUrl(url: string): string {
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) return `https://drive.google.com/uc?export=download&id=${fileId}`;
  return url;
}

// Reliable embed URL for Google Drive (usually loads, but autoplay may be blocked)
function convertToPreviewUrl(url: string): string {
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  return url;
}

export const VideoPlayer = forwardRef<HTMLDivElement, VideoPlayerProps>(
  ({ videos, isPaused = false, onVideoEnd, hideControls = false, className }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [useIframeFallback, setUseIframeFallback] = useState(false);
    const [hasError, setHasError] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleVideoEnd = useCallback(() => {
      const nextIndex = (currentIndex + 1) % videos.length;
      setCurrentIndex(nextIndex);
      setIsLoading(true);
      setHasError(false);
      setUseIframeFallback(false);

      if (nextIndex === 0 && onVideoEnd) {
        onVideoEnd();
      }
    }, [currentIndex, videos.length, onVideoEnd]);

    // Reset when video changes - use iframe immediately for Google Drive
    useEffect(() => {
      const currentVideo = videos[currentIndex];
      const shouldUseIframe = currentVideo && isGoogleDriveUrl(currentVideo.video_url);
      
      setIsLoading(true);
      setHasError(false);
      // Skip failed direct URL attempt for Google Drive - use iframe immediately
      setUseIframeFallback(shouldUseIframe);

      // Auto-advance fallback timer (60 seconds)
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleVideoEnd();
      }, 60000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [currentIndex, handleVideoEnd, videos]);

    // Pause/Resume only affects HTML5 video. For iframe we just show overlay.
    useEffect(() => {
      if (!videoRef.current) return;
      if (useIframeFallback) return;

      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
      }
    }, [isPaused, useIframeFallback]);

    const handlePrevious = () => {
      setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
      setIsLoading(true);
      setHasError(false);
      setUseIframeFallback(false);
    };

    const handleNext = () => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
      setIsLoading(true);
      setHasError(false);
      setUseIframeFallback(false);
    };

    const handleVideoLoaded = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleIframeLoaded = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleVideoError = useCallback(() => {
      // 1st failure: fallback to iframe preview (more reliable for Drive)
      if (!useIframeFallback) {
        console.warn('[VideoPlayer] HTML5 video failed, falling back to Google Drive preview iframe');
        setUseIframeFallback(true);
        setIsLoading(true);
        setHasError(false);
        return;
      }

      // 2nd failure: show error + auto-advance
      console.error('[VideoPlayer] Video error even in fallback, skipping to next');
      setHasError(true);
      setIsLoading(false);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleVideoEnd();
      }, 5000);
    }, [handleVideoEnd, useIframeFallback]);

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
    const directUrl = convertToDirectUrl(currentVideo.video_url);
    const previewUrl = convertToPreviewUrl(currentVideo.video_url);

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

        {/* Player */}
        {!useIframeFallback ? (
          <video
            ref={videoRef}
            key={currentVideo.id}
            src={directUrl}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            onLoadedData={handleVideoLoaded}
            className="w-full h-full object-cover"
          />
        ) : (
          <iframe
            key={`${currentVideo.id}-iframe`}
            src={previewUrl}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ border: 'none' }}
            onLoad={handleIframeLoaded}
          />
        )}

        {/* Pause overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <Pause className="h-16 w-16 mx-auto mb-4" />
              <p className="text-2xl font-bengali">পাঞ্চ প্রদর্শন হচ্ছে</p>
            </div>
          </div>
        )}

        {/* Note for Drive fallback (only when iframe fallback) */}
        {useIframeFallback && !hideControls && (
          <div className="absolute top-3 right-3 z-30">
            <a
              href={currentVideo.video_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/90 backdrop-blur hover:bg-black/60 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Google Drive Preview
            </a>
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
                  setUseIframeFallback(false);
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
