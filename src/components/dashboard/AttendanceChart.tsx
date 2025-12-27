import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'সোম', present: 450, late: 30, absent: 20 },
  { name: 'মঙ্গল', present: 460, late: 25, absent: 15 },
  { name: 'বুধ', present: 440, late: 35, absent: 25 },
  { name: 'বৃহঃ', present: 470, late: 20, absent: 10 },
  { name: 'শুক্র', present: 455, late: 28, absent: 17 },
  { name: 'শনি', present: 380, late: 15, absent: 105 },
];

export function AttendanceChart() {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Weekly Attendance</h3>
          <p className="text-sm text-muted-foreground font-bengali">সাপ্তাহিক উপস্থিতি</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Absent</span>
          </div>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(215, 20%, 45%)"
              tick={{ fontFamily: 'Hind Siliguri' }}
            />
            <YAxis stroke="hsl(215, 20%, 45%)" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(214, 32%, 91%)',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="present"
              stroke="hsl(160, 84%, 39%)"
              fillOpacity={1}
              fill="url(#colorPresent)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="late"
              stroke="hsl(38, 92%, 50%)"
              fillOpacity={1}
              fill="url(#colorLate)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="absent"
              stroke="hsl(0, 84%, 60%)"
              fillOpacity={1}
              fill="url(#colorAbsent)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
