import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useWebsitePopupNotice } from '@/hooks/queries/useWebsiteCMSNew';
import { useWebsiteSettings } from '@/hooks/queries/useWebsiteCMS';

const SESSION_KEY = 'popup_notice_shown';

export function PopupNotice() {
  const { data: popup } = useWebsitePopupNotice();
  const { data: settings } = useWebsiteSettings();
  const [open, setOpen] = useState(false);

  const primaryColor = settings?.primary_color || '#4B0082';
  const ctaColor = settings?.cta_button_color || settings?.secondary_color || '#00D4FF';

  useEffect(() => {
    if (!popup?.is_enabled) return;

    // Check session storage
    if (popup.show_once_per_session) {
      const shown = sessionStorage.getItem(SESSION_KEY);
      if (shown) return;
    }

    // Show popup after a short delay
    const timer = setTimeout(() => {
      setOpen(true);
      if (popup.show_once_per_session) {
        sessionStorage.setItem(SESSION_KEY, 'true');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [popup]);

  if (!popup?.is_enabled) return null;

  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-md overflow-hidden border-0 bg-transparent shadow-2xl">
        {popup.display_type === 'image' && popup.image_url ? (
          // Image-only popup
          <div className="relative">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <Link to={popup.button_link || '/website/notices'} onClick={handleClose}>
              <img
                src={popup.image_url}
                alt={popup.title || 'Notice'}
                className="w-full h-auto rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
              />
            </Link>
          </div>
        ) : (
          // Card popup
          <div className="bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <div 
              className="p-4 flex items-center justify-between"
              style={{ background: `linear-gradient(to right, ${primaryColor}, ${adjustColorBrightness(primaryColor, 30)})` }}
            >
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-bengali">
                  {popup.title_bn || popup.title || 'গুরুত্বপূর্ণ নোটিশ'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {popup.image_url && (
                <img
                  src={popup.image_url}
                  alt={popup.title || 'Notice'}
                  className="w-full h-auto rounded-lg mb-4"
                />
              )}
              {(popup.description_bn || popup.description) && (
                <p className="text-gray-600 font-bengali mb-6">
                  {popup.description_bn || popup.description}
                </p>
              )}

              {/* Button */}
              <Button 
                asChild 
                className="w-full font-bengali"
                style={{ 
                  backgroundColor: ctaColor,
                  color: '#0D0221'
                }}
              >
                <Link to={popup.button_link || '/website/notices'} onClick={handleClose}>
                  {popup.button_text_bn || popup.button_text || 'বিস্তারিত দেখুন'}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
