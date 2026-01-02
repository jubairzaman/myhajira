import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  title: string;
  title_bn: string | null;
}

interface NewsScrollerProps {
  items: NewsItem[];
  logoUrl?: string | null;
  className?: string;
}

export function NewsScroller({ items, logoUrl, className }: NewsScrollerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate items for seamless loop
  const displayItems = [...items, ...items];

  if (items.length === 0) {
    return null;
  }

  return (
    <div 
      className={cn(
        "news-scroller-container relative h-12 sm:h-14 bg-gradient-to-r from-red-700 via-red-600 to-red-700 overflow-hidden",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left gradient overlay */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-red-700 to-transparent z-10" />
      
      {/* Logo */}
      {logoUrl && (
        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2">
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </div>
      )}
      
      {/* Breaking news badge */}
      <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2" style={{ left: logoUrl ? '60px' : '16px' }}>
        <span className="bg-white text-red-700 px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold rounded animate-pulse">
          সংবাদ
        </span>
      </div>

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
          paddingLeft: logoUrl ? '140px' : '100px',
          animationDuration: `${items.length * 8}s`
        }}
      >
        {displayItems.map((item, index) => (
          <span 
            key={`${item.id}-${index}`} 
            className="inline-flex items-center text-white font-bengali text-sm sm:text-lg mx-4 sm:mx-8"
          >
            <span className="text-yellow-300 mr-2 sm:mr-3">●</span>
            {item.title_bn || item.title}
          </span>
        ))}
      </div>
    </div>
  );
}
