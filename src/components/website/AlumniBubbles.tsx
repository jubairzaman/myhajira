import { useWebsiteAlumni } from '@/hooks/queries/useWebsiteCMS';

interface AlumniBubblesProps {
  compact?: boolean;
}

export function AlumniBubbles({ compact = false }: AlumniBubblesProps) {
  const { data: alumni } = useWebsiteAlumni(true);
  const bubbleAlumni = alumni?.filter(a => a.show_in_bubble && a.comment) || [];

  if (bubbleAlumni.length === 0) return null;

  const cardWidthDesktop = compact ? 'w-[260px]' : 'w-[300px]';
  const cardWidthMobile = 'w-[140px]';
  const imgSizeDesktop = compact ? 'w-24 h-24' : 'w-32 h-32';
  const imgSizeMobile = 'w-14 h-14';

  return (
    <section className={`${compact ? 'py-12' : 'py-12 md:py-20'} bg-gradient-to-br from-[#0D0221] via-[#1A0533] to-[#4B0082] relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#00D4FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#4B0082]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white font-bengali mb-3 md:mb-4">প্রাক্তনদের কথা</h2>
        <p className="text-white/60 mb-8 md:mb-12 text-sm md:text-base">তাদের স্মৃতি ও অনুভূতি</p>
      </div>

      {/* Mobile Scroll View */}
      <div className="md:hidden relative z-10">
        {/* Mobile Row 1 - Scroll Left */}
        <div className="relative overflow-hidden py-2">
          <div 
            className="flex gap-3 animate-scroll-left hover:[animation-play-state:paused]"
            style={{ width: 'fit-content' }}
          >
            {[...bubbleAlumni.filter((_, i) => i % 2 === 0), ...bubbleAlumni.filter((_, i) => i % 2 === 0)].map((person, index) => (
              <div
                key={`mobile-row1-${person.id}-${index}`}
                className={`flex-shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-3 ${cardWidthMobile} border border-white/20 shadow-xl`}
              >
                {person.photo_url ? (
                  <img 
                    src={person.photo_url} 
                    alt={person.name}
                    className={`${imgSizeMobile} rounded-lg mx-auto mb-2 object-cover ring-2 ring-white/30`}
                  />
                ) : (
                  <div className={`${imgSizeMobile} rounded-lg mx-auto mb-2 bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white text-lg font-bold ring-2 ring-white/30`}>
                    {person.name.charAt(0)}
                  </div>
                )}
                <p className="text-white text-[10px] font-bengali leading-relaxed text-center line-clamp-2 min-h-[28px]">
                  "{(person.comment_bn || person.comment || '').slice(0, 40)}..."
                </p>
                <div className="mt-1.5 pt-1.5 border-t border-white/10 text-center">
                  <p className="text-[#00D4FF] text-[10px] font-medium truncate">{person.name_bn || person.name}</p>
                  <p className="text-white/50 text-[8px]">ব্যাচ {person.passing_year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Row 2 - Scroll Right */}
        <div className="relative overflow-hidden py-2 mt-2">
          <div 
            className="flex gap-3 animate-scroll-right hover:[animation-play-state:paused]"
            style={{ width: 'fit-content' }}
          >
            {[...bubbleAlumni.filter((_, i) => i % 2 === 1), ...bubbleAlumni.filter((_, i) => i % 2 === 1)].map((person, index) => (
              <div
                key={`mobile-row2-${person.id}-${index}`}
                className={`flex-shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-3 ${cardWidthMobile} border border-white/20 shadow-xl`}
              >
                {person.photo_url ? (
                  <img 
                    src={person.photo_url} 
                    alt={person.name}
                    className={`${imgSizeMobile} rounded-lg mx-auto mb-2 object-cover ring-2 ring-white/30`}
                  />
                ) : (
                  <div className={`${imgSizeMobile} rounded-lg mx-auto mb-2 bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white text-lg font-bold ring-2 ring-white/30`}>
                    {person.name.charAt(0)}
                  </div>
                )}
                <p className="text-white text-[10px] font-bengali leading-relaxed text-center line-clamp-2 min-h-[28px]">
                  "{(person.comment_bn || person.comment || '').slice(0, 40)}..."
                </p>
                <div className="mt-1.5 pt-1.5 border-t border-white/10 text-center">
                  <p className="text-[#00D4FF] text-[10px] font-medium truncate">{person.name_bn || person.name}</p>
                  <p className="text-white/50 text-[8px]">ব্যাচ {person.passing_year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Row 1 - Scroll Left */}
      <div className="hidden md:block relative overflow-hidden py-4">
        <div 
          className="flex gap-8 animate-scroll-left hover:[animation-play-state:paused]"
          style={{ width: 'fit-content' }}
        >
          {[...bubbleAlumni.filter((_, i) => i % 2 === 0), ...bubbleAlumni.filter((_, i) => i % 2 === 0)].map((person, index) => (
            <div
              key={`row1-${person.id}-${index}`}
              className={`flex-shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-6 ${cardWidthDesktop} border border-white/20 shadow-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300 group cursor-default`}
            >
              {person.photo_url ? (
                <img 
                  src={person.photo_url} 
                  alt={person.name}
                  className={`${imgSizeDesktop} rounded-2xl mx-auto mb-4 object-cover ring-4 ring-white/30 group-hover:ring-[#00D4FF]/60 transition-all shadow-lg`}
                />
              ) : (
                <div className={`${imgSizeDesktop} rounded-2xl mx-auto mb-4 bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white/30`}>
                  {person.name.charAt(0)}
                </div>
              )}
              <p className="text-white text-sm font-bengali leading-relaxed text-center min-h-[60px]">
                "{(person.comment_bn || person.comment || '').slice(0, 80)}{(person.comment_bn || person.comment || '').length > 80 ? '...' : ''}"
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <p className="text-[#00D4FF] text-base font-medium">{person.name_bn || person.name}</p>
                <p className="text-white/50 text-sm">ব্যাচ {person.passing_year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Row 2 - Scroll Right */}
      <div className="hidden md:block relative overflow-hidden py-4 mt-4">
        <div 
          className="flex gap-8 animate-scroll-right hover:[animation-play-state:paused]"
          style={{ width: 'fit-content' }}
        >
          {[...bubbleAlumni.filter((_, i) => i % 2 === 1), ...bubbleAlumni.filter((_, i) => i % 2 === 1)].map((person, index) => (
            <div
              key={`row2-${person.id}-${index}`}
              className={`flex-shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-6 ${cardWidthDesktop} border border-white/20 shadow-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300 group cursor-default`}
            >
              {person.photo_url ? (
                <img 
                  src={person.photo_url} 
                  alt={person.name}
                  className={`${imgSizeDesktop} rounded-2xl mx-auto mb-4 object-cover ring-4 ring-white/30 group-hover:ring-[#00D4FF]/60 transition-all shadow-lg`}
                />
              ) : (
                <div className={`${imgSizeDesktop} rounded-2xl mx-auto mb-4 bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white/30`}>
                  {person.name.charAt(0)}
                </div>
              )}
              <p className="text-white text-sm font-bengali leading-relaxed text-center min-h-[60px]">
                "{(person.comment_bn || person.comment || '').slice(0, 80)}{(person.comment_bn || person.comment || '').length > 80 ? '...' : ''}"
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <p className="text-[#00D4FF] text-base font-medium">{person.name_bn || person.name}</p>
                <p className="text-white/50 text-sm">ব্যাচ {person.passing_year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
