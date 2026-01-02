import { forwardRef, useState, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  title: string;
  title_bn: string | null;
}

interface ScrollerSettings {
  fontSize?: number;
  fontFamily?: string;
  speed?: number;
  bgColor?: string;
  textColor?: string;
  bulletColor?: string;
}

interface NewsScrollerProps {
  items: NewsItem[];
  logoUrl?: string | null;
  schoolLogoUrl?: string | null;
  settings?: ScrollerSettings;
  className?: string;
}

const DEFAULT_SETTINGS: Required<ScrollerSettings> = {
  fontSize: 24,
  fontFamily: 'Hind Siliguri',
  speed: 50,
  bgColor: '#991B1B',
  textColor: '#FFFFFF',
  bulletColor: '#FDE047',
};

export const NewsScroller = forwardRef<HTMLDivElement, NewsScrollerProps>(
  ({ items, logoUrl, schoolLogoUrl, settings = {}, className }, ref) => {
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Merge settings with defaults
    const mergedSettings = useMemo(() => ({
      ...DEFAULT_SETTINGS,
      ...settings,
    }), [settings]);

    // Duplicate items for seamless loop
    const displayItems = [...items, ...items];

    if (items.length === 0) {
      return null;
    }

    // Use monitor logo if available, otherwise school logo
    const displayLogo = logoUrl || schoolLogoUrl;

    // Calculate animation duration based on speed (lower speed = slower)
    const animationDuration = `${items.length * (100 - mergedSettings.speed + 10) / 10}s`;

    return (
      <div 
        ref={ref}
        className={cn(
          "news-scroller-container flex h-16 sm:h-20 overflow-hidden",
          className
        )}
        style={{ backgroundColor: mergedSettings.bgColor }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Fixed Logo Area - বাম পাশে */}
        {displayLogo && (
          <div 
            className="flex-shrink-0 px-4 sm:px-6 flex items-center gap-3 border-r"
            style={{ 
              backgroundColor: mergedSettings.bgColor,
              borderColor: `${mergedSettings.textColor}20`,
            }}
          >
            <img 
              src={displayLogo} 
              alt="Logo" 
              className="h-10 sm:h-14 w-auto object-contain"
            />
          </div>
        )}

        {/* Scrolling Area - লোগোর পরে */}
        <div 
          className="flex-1 relative overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${mergedSettings.bgColor}, ${adjustColor(mergedSettings.bgColor, 10)}, ${mergedSettings.bgColor})`,
          }}
        >
          {/* Right gradient overlay */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10" 
            style={{
              background: `linear-gradient(to left, ${mergedSettings.bgColor}, transparent)`,
            }}
          />

          {/* Scrolling content with GPU acceleration */}
          <div 
            ref={scrollRef}
            className={cn(
              "news-scroller-content flex items-center h-full whitespace-nowrap will-change-transform",
              !isPaused && "animate-news-scroll"
            )}
            style={{ 
              paddingLeft: '24px',
              animationDuration,
              fontFamily: mergedSettings.fontFamily,
            }}
          >
            {displayItems.map((item, index) => (
              <span 
                key={`${item.id}-${index}`} 
                className="inline-flex items-center font-semibold mx-6 sm:mx-10"
                style={{
                  color: mergedSettings.textColor,
                  fontSize: `${mergedSettings.fontSize}px`,
                }}
              >
                <span 
                  className="mr-3 sm:mr-4"
                  style={{ color: mergedSettings.bulletColor }}
                >
                  ●
                </span>
                {item.title_bn || item.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

NewsScroller.displayName = 'NewsScroller';

// Helper function to lighten/darken a hex color
function adjustColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust
  r = Math.min(255, Math.max(0, r + percent));
  g = Math.min(255, Math.max(0, g + percent));
  b = Math.min(255, Math.max(0, b + percent));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
