import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  academicYear?: string;
  month?: string;
}

interface SystemSettings {
  school_name: string | null;
  school_name_bn: string | null;
  school_logo_url: string | null;
}

export function ReportHeader({ title, subtitle, academicYear, month }: ReportHeaderProps) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('school_name, school_name_bn, school_logo_url')
        .limit(1)
        .single();
      
      if (data) {
        setSettings(data);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="report-header text-center mb-6 pb-4 border-b-2 border-border print:border-black">
      <div className="flex items-center justify-center gap-4 mb-2">
        {settings?.school_logo_url && (
          <img 
            src={settings.school_logo_url} 
            alt="School Logo" 
            className="w-16 h-16 object-contain print:w-20 print:h-20"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground print:text-black print:text-3xl">
            {settings?.school_name_bn || settings?.school_name || 'স্কুলের নাম'}
          </h1>
          {settings?.school_name && settings?.school_name_bn && (
            <p className="text-sm text-muted-foreground print:text-gray-600">
              {settings.school_name}
            </p>
          )}
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-foreground mt-4 print:text-black print:text-2xl">
        {title}
      </h2>
      
      {subtitle && (
        <p className="text-lg text-muted-foreground print:text-gray-700">
          {subtitle}
        </p>
      )}
      
      <div className="flex justify-center gap-6 mt-2 text-sm text-muted-foreground print:text-gray-600">
        {academicYear && (
          <span>শিক্ষাবর্ষ: <strong className="text-foreground print:text-black">{academicYear}</strong></span>
        )}
        {month && (
          <span>মাস: <strong className="text-foreground print:text-black">{month}</strong></span>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mt-4 print:text-gray-500">
        Developed by Jubair Zaman
      </p>
    </div>
  );
}
