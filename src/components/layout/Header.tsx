import { ReactNode } from 'react';
import { Bell, Search, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  title: string;
  titleBn?: string;
  children?: ReactNode;
}

export function Header({ title, titleBn, children }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-14 sm:h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button slot */}
        {children}
        
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h1>
          {titleBn && (
            <p className="text-xs sm:text-sm text-muted-foreground font-bengali hidden sm:block">{titleBn}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
          <Calendar className="w-4 h-4" />
          <span className="font-bengali">{currentDate}</span>
        </div>

        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 w-64 bg-muted/50 border-0"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative w-9 h-9 sm:w-10 sm:h-10">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* User */}
        <Button variant="ghost" size="icon" className="w-9 h-9 sm:w-10 sm:h-10">
          <User className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </header>
  );
}
