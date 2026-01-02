import { forwardRef, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  title: string;
  title_bn: string | null;
}

interface NewsScrollerProps {
  items: NewsItem[];
  logoUrl?: string | null;
  schoolLogoUrl?: string | null;
  className?: string;
}

export const NewsScroller = forwardRef<HTMLDivElement, NewsScrollerProps>(
  ({ items, logoUrl, schoolLogoUrl, className }, ref) => {
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Duplicate items for seamless loop
    const displayItems = [...items, ...items];

    if (items.length === 0) {
      return null;
    }

    // Use monitor logo if available, otherwise school logo
    const displayLogo = logoUrl || schoolLogoUrl;

    return (
      <div 
        ref={ref}
        className={cn(
          "news-scroller-container flex h-16 sm:h-20 overflow-hidden",
          className
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Fixed Logo Area - বাম পাশে */}
        {displayLogo && (
          <div className="flex-shrink-0 bg-red-800 px-4 sm:px-6 flex items-center gap-3 border-r border-red-600">
            <img 
              src={displayLogo} 
              alt="Logo" 
              className="h-10 sm:h-14 w-auto object-contain"
            />
          </div>
        )}

        {/* Scrolling Area - লোগোর পরে */}
        <div className="flex-1 relative bg-gradient-to-r from-red-700 via-red-600 to-red-700 overflow-hidden">
          {/* Right gradient overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-red-700 to-transparent z-10" />

          {/* Scrolling content */}
          <div 
            ref={scrollRef}
            className={cn(
              "news-scroller-content flex items-center h-full whitespace-nowrap",
              !isPaused && "animate-news-scroll"
            )}
            style={{ 
              paddingLeft: '24px',
              animationDuration: `${items.length * 8}s`
            }}
          >
            {displayItems.map((item, index) => (
              <span 
                key={`${item.id}-${index}`} 
                className="inline-flex items-center text-white font-bengali text-xl sm:text-2xl lg:text-3xl font-semibold mx-6 sm:mx-10"
              >
                <span className="text-yellow-300 mr-3 sm:mr-4">●</span>
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
