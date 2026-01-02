import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { bn } from 'date-fns/locale';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { ChevronLeft, ChevronRight, Plus, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = [
  { day: 0, name: 'Sunday', nameBn: 'রবিবার' },
  { day: 1, name: 'Monday', nameBn: 'সোমবার' },
  { day: 2, name: 'Tuesday', nameBn: 'মঙ্গলবার' },
  { day: 3, name: 'Wednesday', nameBn: 'বুধবার' },
  { day: 4, name: 'Thursday', nameBn: 'বৃহস্পতিবার' },
  { day: 5, name: 'Friday', nameBn: 'শুক্রবার' },
  { day: 6, name: 'Saturday', nameBn: 'শনিবার' },
];

const DAY_TYPES = [
  { value: 'holiday', label: 'Holiday', labelBn: 'ছুটি', color: 'bg-red-500' },
  { value: 'exam_day', label: 'Exam Day', labelBn: 'পরীক্ষার দিন', color: 'bg-amber-500' },
  { value: 'half_day', label: 'Half Day', labelBn: 'অর্ধদিবস', color: 'bg-blue-500' },
  { value: 'working', label: 'Working Day', labelBn: 'কর্মদিবস', color: 'bg-green-500' },
];

const ENTRY_TYPES = [
  { value: 'holiday', label: 'Holiday', labelBn: 'ছুটি' },
  { value: 'exam', label: 'Exam', labelBn: 'পরীক্ষা' },
  { value: 'working', label: 'Working', labelBn: 'কর্মদিবস' },
];

export default function SchoolCalendar() {
  const { activeYear } = useAcademicYear();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  // Form state
  const [dayType, setDayType] = useState<string>('holiday');
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [description, setDescription] = useState('');
  const [appliesToAllClasses, setAppliesToAllClasses] = useState(true);
  const [classEntries, setClassEntries] = useState<Record<string, string>>({});

  // Fetch weekly holidays
  const { data: weeklyHolidays = [] } = useQuery({
    queryKey: ['weekly-holidays', activeYear?.id],
    queryFn: async () => {
      if (!activeYear?.id) return [];
      const { data, error } = await supabase
        .from('weekly_holidays')
        .select('*')
        .eq('academic_year_id', activeYear.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeYear?.id,
  });

  // Fetch calendar entries for current month
  const { data: calendarEntries = [] } = useQuery({
    queryKey: ['school-calendar', activeYear?.id, format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      if (!activeYear?.id) return [];
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('school_calendar')
        .select(`
          *,
          calendar_class_entries (
            id,
            class_id,
            entry_type
          )
        `)
        .eq('academic_year_id', activeYear.id)
        .gte('calendar_date', start)
        .lte('calendar_date', end);
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeYear?.id,
  });

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('grade_order');
      if (error) throw error;
      return data || [];
    },
  });

  // Save weekly holidays mutation
  const saveWeeklyHolidaysMutation = useMutation({
    mutationFn: async (holidays: number[]) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      // Delete existing
      await supabase
        .from('weekly_holidays')
        .delete()
        .eq('academic_year_id', activeYear.id);

      // Insert new
      if (holidays.length > 0) {
        const { error } = await supabase
          .from('weekly_holidays')
          .insert(holidays.map(day => ({
            day_of_week: day,
            is_holiday: true,
            academic_year_id: activeYear.id,
          })));
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-holidays'] });
      toast.success('সাপ্তাহিক ছুটি সংরক্ষণ করা হয়েছে');
    },
    onError: (error: any) => {
      toast.error(error.message || 'সংরক্ষণ করতে সমস্যা হয়েছে');
    },
  });

  // Save calendar entry mutation
  const saveCalendarEntryMutation = useMutation({
    mutationFn: async (data: {
      date: string;
      dayType: string;
      title: string;
      titleBn: string;
      description: string;
      appliesToAllClasses: boolean;
      classEntries: Record<string, string>;
      editId?: string;
    }) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      let calendarId = data.editId;

      if (data.editId) {
        // Update existing
        const { error } = await supabase
          .from('school_calendar')
          .update({
            day_type: data.dayType,
            title: data.title,
            title_bn: data.titleBn,
            description: data.description,
            applies_to_all_classes: data.appliesToAllClasses,
          })
          .eq('id', data.editId);
        if (error) throw error;

        // Delete existing class entries
        await supabase
          .from('calendar_class_entries')
          .delete()
          .eq('calendar_id', data.editId);
      } else {
        // Insert new
        const { data: newEntry, error } = await supabase
          .from('school_calendar')
          .insert({
            calendar_date: data.date,
            day_type: data.dayType,
            title: data.title,
            title_bn: data.titleBn,
            description: data.description,
            applies_to_all_classes: data.appliesToAllClasses,
            academic_year_id: activeYear.id,
          })
          .select()
          .single();
        if (error) throw error;
        calendarId = newEntry.id;
      }

      // Insert class entries if not applying to all
      if (!data.appliesToAllClasses && calendarId) {
        const entries = Object.entries(data.classEntries)
          .filter(([_, type]) => type)
          .map(([classId, entryType]) => ({
            calendar_id: calendarId,
            class_id: classId,
            entry_type: entryType,
          }));

        if (entries.length > 0) {
          const { error } = await supabase
            .from('calendar_class_entries')
            .insert(entries);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-calendar'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('ক্যালেন্ডার এন্ট্রি সংরক্ষণ করা হয়েছে');
    },
    onError: (error: any) => {
      toast.error(error.message || 'সংরক্ষণ করতে সমস্যা হয়েছে');
    },
  });

  // Delete calendar entry mutation
  const deleteCalendarEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('school_calendar')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-calendar'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('ক্যালেন্ডার এন্ট্রি মুছে ফেলা হয়েছে');
    },
    onError: (error: any) => {
      toast.error(error.message || 'মুছতে সমস্যা হয়েছে');
    },
  });

  const resetForm = () => {
    setDayType('holiday');
    setTitle('');
    setTitleBn('');
    setDescription('');
    setAppliesToAllClasses(true);
    setClassEntries({});
    setEditingEntry(null);
    setSelectedDate(null);
  };

  const handleWeeklyHolidayChange = (day: number, checked: boolean) => {
    const currentHolidays = weeklyHolidays.map(h => h.day_of_week);
    const newHolidays = checked
      ? [...currentHolidays, day]
      : currentHolidays.filter(d => d !== day);
    saveWeeklyHolidaysMutation.mutate(newHolidays);
  };

  const handleDateClick = (date: Date) => {
    const entry = calendarEntries.find(e => isSameDay(new Date(e.calendar_date), date));
    
    if (entry) {
      setEditingEntry(entry);
      setDayType(entry.day_type);
      setTitle(entry.title || '');
      setTitleBn(entry.title_bn || '');
      setDescription(entry.description || '');
      setAppliesToAllClasses(entry.applies_to_all_classes);
      const entries: Record<string, string> = {};
      entry.calendar_class_entries?.forEach((ce: any) => {
        entries[ce.class_id] = ce.entry_type;
      });
      setClassEntries(entries);
    } else {
      resetForm();
    }
    
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleSaveEntry = () => {
    if (!selectedDate) return;
    
    saveCalendarEntryMutation.mutate({
      date: format(selectedDate, 'yyyy-MM-dd'),
      dayType,
      title,
      titleBn,
      description,
      appliesToAllClasses,
      classEntries,
      editId: editingEntry?.id,
    });
  };

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startDayOfWeek = getDay(startOfMonth(currentMonth));

  const getEntryForDate = (date: Date) => {
    return calendarEntries.find(e => isSameDay(new Date(e.calendar_date), date));
  };

  const isWeeklyHoliday = (date: Date) => {
    const dayOfWeek = getDay(date);
    return weeklyHolidays.some(h => h.day_of_week === dayOfWeek);
  };

  const getDayTypeInfo = (type: string) => {
    return DAY_TYPES.find(t => t.value === type);
  };

  return (
    <MainLayout title="School Calendar" titleBn="স্কুল ক্যালেন্ডার">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">School Calendar</h1>
          <p className="text-muted-foreground font-bengali">স্কুল ক্যালেন্ডার - ছুটি এবং পরীক্ষার দিন সেট করুন</p>
        </div>

        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList>
            <TabsTrigger value="weekly">
              <span className="hidden sm:inline">সাপ্তাহিক ছুটি</span>
              <span className="sm:hidden">সাপ্তাহিক</span>
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <span className="hidden sm:inline">ক্যালেন্ডার</span>
              <span className="sm:hidden">ক্যালেন্ডার</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle className="font-bengali">সাপ্তাহিক ছুটির দিন</CardTitle>
                <CardDescription className="font-bengali">
                  প্রতি সপ্তাহে কোন কোন দিন ছুটি থাকবে সেটি নির্ধারণ করুন
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const isHoliday = weeklyHolidays.some(h => h.day_of_week === day.day);
                    return (
                      <div
                        key={day.day}
                        className={cn(
                          "flex flex-col items-center p-4 rounded-lg border transition-colors cursor-pointer",
                          isHoliday 
                            ? "bg-red-500/10 border-red-500/30 text-red-600" 
                            : "bg-muted/30 border-border hover:bg-muted/50"
                        )}
                        onClick={() => handleWeeklyHolidayChange(day.day, !isHoliday)}
                      >
                        <Checkbox
                          checked={isHoliday}
                          onCheckedChange={(checked) => handleWeeklyHolidayChange(day.day, !!checked)}
                          className="mb-2"
                        />
                        <span className="font-medium text-sm">{day.name}</span>
                        <span className="text-xs font-bengali opacity-70">{day.nameBn}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-bengali">
                      {format(currentMonth, 'MMMM yyyy', { locale: bn })}
                    </CardTitle>
                    <CardDescription className="font-bengali">
                      তারিখে ক্লিক করে এন্ট্রি যোগ বা সম্পাদনা করুন
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentMonth(new Date())}
                    >
                      আজ
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500" />
                    <span className="text-xs font-bengali">সাপ্তাহিক ছুটি</span>
                  </div>
                  {DAY_TYPES.filter(t => t.value !== 'working').map(type => (
                    <div key={type.value} className="flex items-center gap-1.5">
                      <div className={cn("w-3 h-3 rounded-full", type.color)} />
                      <span className="text-xs font-bengali">{type.labelBn}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Header */}
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day.day}
                      className="text-center py-2 text-xs font-medium text-muted-foreground"
                    >
                      <span className="hidden sm:inline">{day.nameBn}</span>
                      <span className="sm:hidden">{day.nameBn.charAt(0)}</span>
                    </div>
                  ))}

                  {/* Empty cells for days before month start */}
                  {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Days */}
                  {daysInMonth.map((date) => {
                    const entry = getEntryForDate(date);
                    const isWeeklyOff = isWeeklyHoliday(date);
                    const isToday = isSameDay(date, new Date());
                    const typeInfo = entry ? getDayTypeInfo(entry.day_type) : null;

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => handleDateClick(date)}
                        className={cn(
                          "aspect-square p-1 rounded-lg border transition-all text-sm relative",
                          "hover:border-primary hover:shadow-sm",
                          isToday && "ring-2 ring-primary ring-offset-1",
                          isWeeklyOff && !entry && "bg-red-500/10 border-red-500/30",
                          entry && typeInfo && `${typeInfo.color}/20 border-current`
                        )}
                        style={entry && typeInfo ? { 
                          borderColor: typeInfo.color.replace('bg-', '').includes('red') ? 'rgb(239 68 68)' :
                                       typeInfo.color.includes('amber') ? 'rgb(245 158 11)' :
                                       typeInfo.color.includes('blue') ? 'rgb(59 130 246)' :
                                       'rgb(34 197 94)'
                        } : undefined}
                      >
                        <span className={cn(
                          "block font-medium",
                          isToday && "text-primary"
                        )}>
                          {format(date, 'd')}
                        </span>
                        {entry && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", typeInfo?.color)} />
                          </span>
                        )}
                        {entry?.title_bn && (
                          <span className="absolute bottom-4 left-0 right-0 text-[8px] font-bengali truncate px-0.5 hidden sm:block">
                            {entry.title_bn}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Entries List */}
                {calendarEntries.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h4 className="text-sm font-medium font-bengali">এই মাসের এন্ট্রিসমূহ</h4>
                    <div className="space-y-2">
                      {calendarEntries.map((entry) => {
                        const typeInfo = getDayTypeInfo(entry.day_type);
                        return (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("w-2 h-8 rounded-full", typeInfo?.color)} />
                              <div>
                                <p className="font-medium text-sm">
                                  {format(new Date(entry.calendar_date), 'd MMMM', { locale: bn })}
                                  {' - '}
                                  <span className="font-bengali">{entry.title_bn || entry.title || typeInfo?.labelBn}</span>
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="outline" className="text-xs">
                                    {typeInfo?.labelBn}
                                  </Badge>
                                  {!entry.applies_to_all_classes && (
                                    <Badge variant="secondary" className="text-xs font-bengali">
                                      নির্দিষ্ট ক্লাস
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDateClick(new Date(entry.calendar_date))}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Entry Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-bengali">
                {editingEntry ? 'ক্যালেন্ডার এন্ট্রি সম্পাদনা' : 'নতুন ক্যালেন্ডার এন্ট্রি'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Date Display */}
              {selectedDate && (
                <div className="p-3 bg-muted rounded-lg text-center">
                  <span className="font-bengali text-lg">
                    {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: bn })}
                  </span>
                </div>
              )}

              {/* Day Type */}
              <div className="space-y-2">
                <Label className="font-bengali">দিনের ধরন</Label>
                <Select value={dayType} onValueChange={setDayType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", type.color)} />
                          <span className="font-bengali">{type.labelBn}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Eid Holiday"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">শিরোনাম (বাংলা)</Label>
                  <Input
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    placeholder="যেমন: ঈদের ছুটি"
                    className="font-bengali"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="font-bengali">বিবরণ (ঐচ্ছিক)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="অতিরিক্ত তথ্য..."
                  className="font-bengali"
                  rows={2}
                />
              </div>

              {/* Applies to all classes */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label className="font-bengali">সব ক্লাসে প্রযোজ্য</Label>
                  <p className="text-xs text-muted-foreground font-bengali">
                    বন্ধ করলে ক্লাস অনুযায়ী আলাদা সেট করতে পারবেন
                  </p>
                </div>
                <Switch
                  checked={appliesToAllClasses}
                  onCheckedChange={setAppliesToAllClasses}
                />
              </div>

              {/* Class-specific entries */}
              {!appliesToAllClasses && (
                <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                  <Label className="font-bengali">ক্লাসভিত্তিক সেটিংস</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {classes.map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between p-2 bg-background rounded">
                        <span className="text-sm font-bengali">{cls.name_bn || cls.name}</span>
                        <Select
                          value={classEntries[cls.id] || ''}
                          onValueChange={(value) => setClassEntries(prev => ({ ...prev, [cls.id]: value }))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="সিলেক্ট করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">-</SelectItem>
                            {ENTRY_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <span className="font-bengali">{type.labelBn}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {editingEntry && (
                <Button
                  variant="destructive"
                  onClick={() => deleteCalendarEntryMutation.mutate(editingEntry.id)}
                  disabled={deleteCalendarEntryMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  মুছে ফেলুন
                </Button>
              )}
              <div className="flex gap-2 w-full sm:w-auto">
                <DialogClose asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none">বাতিল</Button>
                </DialogClose>
                <Button
                  onClick={handleSaveEntry}
                  disabled={saveCalendarEntryMutation.isPending}
                  className="flex-1 sm:flex-none"
                >
                  {saveCalendarEntryMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
