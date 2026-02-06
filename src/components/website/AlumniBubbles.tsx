import { useState } from 'react';
import { useWebsiteAlumni } from '@/hooks/queries/useWebsiteCMS';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import type { WebsiteAlumni } from '@/hooks/queries/useWebsiteCMS';

interface AlumniBubblesProps {
  compact?: boolean;
}

export function AlumniBubbles({ compact = false }: AlumniBubblesProps) {
  const { data: alumni } = useWebsiteAlumni(true);
  const bubbleAlumni = alumni?.filter(a => a.show_in_bubble && a.comment) || [];
  const [selectedAlumni, setSelectedAlumni] = useState<WebsiteAlumni | null>(null);

  if (bubbleAlumni.length === 0) return null;

  const cardWidthDesktop = compact ? 'w-[260px]' : 'w-[300px]';
  const cardWidthMobile = 'w-[140px]';
  const imgSizeDesktop = compact ? 'w-24 h-24' : 'w-32 h-32';
  const imgSizeMobile = 'w-14 h-14';

  const renderCard = (person: WebsiteAlumni, index: number, keyPrefix: string, isMobile: boolean) => {
    const cardWidth = isMobile ? cardWidthMobile : cardWidthDesktop;
    const imgSize = isMobile ? imgSizeMobile : imgSizeDesktop;
    const commentSlice = isMobile ? 40 : 80;

    return (
      <div
        key={`${keyPrefix}-${person.id}-${index}`}
        className={`flex-shrink-0 bg-white/10 backdrop-blur-md ${isMobile ? 'rounded-xl p-3' : 'rounded-2xl p-6'} ${cardWidth} border border-white/20 ${isMobile ? 'shadow-xl' : 'shadow-2xl hover:bg-white/20 hover:scale-105'} transition-all duration-300 group cursor-pointer`}
        onClick={() => setSelectedAlumni(person)}
      >
        {person.photo_url ? (
          <img
            src={person.photo_url}
            alt={person.name}
            className={`${imgSize} ${isMobile ? 'rounded-lg' : 'rounded-2xl'} mx-auto ${isMobile ? 'mb-2' : 'mb-4'} object-cover ${isMobile ? 'ring-2' : 'ring-4'} ring-white/30 ${!isMobile ? 'group-hover:ring-[#00D4FF]/60' : ''} transition-all shadow-lg`}
          />
        ) : (
          <div className={`${imgSize} ${isMobile ? 'rounded-lg' : 'rounded-2xl'} mx-auto ${isMobile ? 'mb-2' : 'mb-4'} bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white ${isMobile ? 'text-lg' : 'text-4xl'} font-bold ${isMobile ? 'ring-2' : 'ring-4'} ring-white/30`}>
            {person.name.charAt(0)}
          </div>
        )}
        <p className={`text-white ${isMobile ? 'text-[10px]' : 'text-sm'} font-bengali leading-relaxed text-center ${isMobile ? 'line-clamp-2 min-h-[28px]' : 'min-h-[60px]'}`}>
          "{(person.comment_bn || person.comment || '').slice(0, commentSlice)}{(person.comment_bn || person.comment || '').length > commentSlice ? '...' : ''}"
        </p>
        <div className={`${isMobile ? 'mt-1.5 pt-1.5' : 'mt-4 pt-3'} border-t border-white/10 text-center`}>
          <p className={`text-[#00D4FF] ${isMobile ? 'text-[10px]' : 'text-base'} font-medium ${isMobile ? 'truncate' : ''}`}>{person.name_bn || person.name}</p>
          <p className={`text-white/50 ${isMobile ? 'text-[8px]' : 'text-sm'}`}>ব্যাচ {person.passing_year}</p>
        </div>
      </div>
    );
  };

  const row1 = bubbleAlumni.filter((_, i) => i % 2 === 0);
  const row2 = bubbleAlumni.filter((_, i) => i % 2 === 1);

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
        <div className="relative overflow-hidden py-2">
          <div className="flex gap-3 animate-scroll-left hover:[animation-play-state:paused]" style={{ width: 'fit-content' }}>
            {[...row1, ...row1].map((person, index) => renderCard(person, index, 'mobile-row1', true))}
          </div>
        </div>
        <div className="relative overflow-hidden py-2 mt-2">
          <div className="flex gap-3 animate-scroll-right hover:[animation-play-state:paused]" style={{ width: 'fit-content' }}>
            {[...row2, ...row2].map((person, index) => renderCard(person, index, 'mobile-row2', true))}
          </div>
        </div>
      </div>

      {/* Desktop Row 1 */}
      <div className="hidden md:block relative overflow-hidden py-4">
        <div className="flex gap-8 animate-scroll-left hover:[animation-play-state:paused]" style={{ width: 'fit-content' }}>
          {[...row1, ...row1].map((person, index) => renderCard(person, index, 'row1', false))}
        </div>
      </div>

      {/* Desktop Row 2 */}
      <div className="hidden md:block relative overflow-hidden py-4 mt-4">
        <div className="flex gap-8 animate-scroll-right hover:[animation-play-state:paused]" style={{ width: 'fit-content' }}>
          {[...row2, ...row2].map((person, index) => renderCard(person, index, 'row2', false))}
        </div>
      </div>

      {/* Alumni Detail Popup */}
      <Dialog open={!!selectedAlumni} onOpenChange={(open) => !open && setSelectedAlumni(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-gradient-to-br from-[#0D0221] via-[#1A0533] to-[#4B0082] text-white">
          <button
            onClick={() => setSelectedAlumni(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          {selectedAlumni && (
            <div className="p-8 text-center">
              {selectedAlumni.photo_url ? (
                <img
                  src={selectedAlumni.photo_url}
                  alt={selectedAlumni.name}
                  className="w-32 h-32 rounded-2xl mx-auto mb-6 object-cover ring-4 ring-[#00D4FF]/40 shadow-2xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl mx-auto mb-6 bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-5xl font-bold ring-4 ring-[#00D4FF]/40">
                  {selectedAlumni.name.charAt(0)}
                </div>
              )}
              <h3 className="text-2xl font-bold font-bengali text-[#00D4FF] mb-1">
                {selectedAlumni.name_bn || selectedAlumni.name}
              </h3>
              <p className="text-white/60 mb-1">ব্যাচ {selectedAlumni.passing_year}</p>
              {(selectedAlumni.current_position_bn || selectedAlumni.current_position) && (
                <p className="text-white/80 text-sm font-bengali mb-4">
                  {selectedAlumni.current_position_bn || selectedAlumni.current_position}
                </p>
              )}
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/90 font-bengali leading-relaxed italic text-base">
                  "{selectedAlumni.comment_bn || selectedAlumni.comment}"
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
