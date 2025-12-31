import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('Received punch data:', body);

    const { card_number, device_ip, punch_time } = body;

    if (!card_number) {
      return new Response(
        JSON.stringify({ error: 'Card number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const punchTimestamp = punch_time ? new Date(punch_time) : new Date();
    const punchDate = punchTimestamp.toISOString().split('T')[0];
    const punchTimeStr = punchTimestamp.toTimeString().split(' ')[0];

    console.log('Processing punch:', { card_number, punchDate, punchTimeStr });

    // Get device info
    let deviceId = null;
    if (device_ip) {
      const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('ip_address', device_ip)
        .maybeSingle();
      deviceId = device?.id;
    }

    // Try to find student RFID card
    const { data: studentCard } = await supabase
      .from('rfid_cards_students')
      .select('student_id')
      .eq('card_number', card_number)
      .eq('is_active', true)
      .maybeSingle();

    if (studentCard) {
      console.log('Found student card:', studentCard);
      return await processStudentPunch(supabase, studentCard.student_id, punchTimestamp, punchDate, punchTimeStr, deviceId, card_number);
    }

    // Try to find teacher RFID card
    const { data: teacherCard } = await supabase
      .from('rfid_cards_teachers')
      .select('teacher_id')
      .eq('card_number', card_number)
      .eq('is_active', true)
      .maybeSingle();

    if (teacherCard) {
      console.log('Found teacher card:', teacherCard);
      return await processTeacherPunch(supabase, teacherCard.teacher_id, punchTimestamp, punchDate, punchTimeStr, deviceId, card_number);
    }

    console.log('Card not found:', card_number);
    return new Response(
      JSON.stringify({ error: 'Card not registered', card_number }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing punch:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processStudentPunch(
  supabase: any,
  studentId: string,
  punchTimestamp: Date,
  punchDate: string,
  punchTimeStr: string,
  deviceId: string | null,
  cardNumber: string
) {
  // RULE 1: Always save punch log first (unlimited punches allowed)
  const { error: punchLogError } = await supabase
    .from('punch_logs')
    .insert({
      person_id: studentId,
      person_type: 'student',
      punch_date: punchDate,
      punch_time: punchTimestamp.toISOString(),
      device_id: deviceId,
      card_number: cardNumber,
    });

  if (punchLogError) {
    console.error('Error saving punch log:', punchLogError);
  }

  // Get student with shift info
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select(`
      id, name, name_bn, photo_url, academic_year_id,
      shifts(id, start_time, late_threshold_time, absent_cutoff_time),
      classes(id, name),
      sections(id, name)
    `)
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    console.error('Student not found:', studentError);
    return new Response(
      JSON.stringify({ error: 'Student not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  // RULE 4: Check if attendance already exists for this person and date
  const { data: existingAttendance } = await supabase
    .from('student_attendance')
    .select('id, status')
    .eq('student_id', studentId)
    .eq('attendance_date', punchDate)
    .maybeSingle();

  // If attendance already exists, only save punch event (already done above)
  if (existingAttendance) {
    console.log('Attendance already exists, punch logged only:', existingAttendance);
    return new Response(
      JSON.stringify({
        success: true,
        type: 'student',
        name: student.name,
        name_bn: student.name_bn,
        photo_url: student.photo_url,
        class_name: student.classes?.name,
        section_name: student.sections?.name,
        status: existingAttendance.status,
        punch_time: punchTimeStr,
        is_first_punch: false,
        message: 'Punch recorded (attendance already marked)'
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  // RULE 5: First punch of the day - create attendance record
  let status = 'present';
  const shift = student.shifts;
  
  if (shift) {
    const punchMinutes = timeToMinutes(punchTimeStr);
    const startMinutes = timeToMinutes(shift.start_time);
    const lateThreshold = timeToMinutes(shift.late_threshold_time || shift.start_time);
    const absentCutoff = timeToMinutes(shift.absent_cutoff_time || '23:59');

    // Status determination rules (RULE 5):
    // Punch ≤ Shift Start → Present
    // Punch > Shift Start and ≤ Late Time → Late
    // Punch > Late Time → Absent (but still creating record since they punched)
    if (punchMinutes <= startMinutes) {
      status = 'present';
    } else if (punchMinutes <= lateThreshold) {
      status = 'late';
    } else if (punchMinutes > absentCutoff) {
      status = 'absent';
    } else {
      status = 'late';
    }
  }

  console.log('Recording first attendance:', { studentId, status, punchTimeStr });

  // Insert attendance record (first punch only)
  const { data: attendance, error: insertError } = await supabase
    .from('student_attendance')
    .insert({
      student_id: studentId,
      attendance_date: punchDate,
      punch_time: punchTimestamp.toISOString(),
      status,
      device_id: deviceId,
      academic_year_id: student.academic_year_id,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting attendance:', insertError);
    return new Response(
      JSON.stringify({ error: insertError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      type: 'student',
      name: student.name,
      name_bn: student.name_bn,
      photo_url: student.photo_url,
      class_name: student.classes?.name,
      section_name: student.sections?.name,
      status,
      punch_time: punchTimeStr,
      is_first_punch: true,
      message: 'First punch - attendance recorded'
    }),
    { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
}

async function processTeacherPunch(
  supabase: any,
  teacherId: string,
  punchTimestamp: Date,
  punchDate: string,
  punchTimeStr: string,
  deviceId: string | null,
  cardNumber: string
) {
  // RULE 1: Always save punch log first (unlimited punches allowed)
  const { error: punchLogError } = await supabase
    .from('punch_logs')
    .insert({
      person_id: teacherId,
      person_type: 'teacher',
      punch_date: punchDate,
      punch_time: punchTimestamp.toISOString(),
      device_id: deviceId,
      card_number: cardNumber,
    });

  if (punchLogError) {
    console.error('Error saving punch log:', punchLogError);
  }

  // Get teacher with shift info
  const { data: teacher, error: teacherError } = await supabase
    .from('teachers')
    .select(`
      id, name, name_bn, photo_url, designation, academic_year_id,
      shifts(id, start_time, late_threshold_time, absent_cutoff_time)
    `)
    .eq('id', teacherId)
    .single();

  if (teacherError || !teacher) {
    console.error('Teacher not found:', teacherError);
    return new Response(
      JSON.stringify({ error: 'Teacher not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  // Check existing attendance for today
  const { data: existingAttendance } = await supabase
    .from('teacher_attendance')
    .select('id, punch_in_time, punch_out_time, status')
    .eq('teacher_id', teacherId)
    .eq('attendance_date', punchDate)
    .maybeSingle();

  if (existingAttendance) {
    // Attendance already exists - this is a punch-out or additional punch
    // Update punch_out_time if punch_in exists
    if (existingAttendance.punch_in_time && !existingAttendance.punch_out_time) {
      const { error: updateError } = await supabase
        .from('teacher_attendance')
        .update({ punch_out_time: punchTimestamp.toISOString() })
        .eq('id', existingAttendance.id);

      if (updateError) {
        console.error('Error updating punch-out:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          type: 'teacher',
          name: teacher.name,
          name_bn: teacher.name_bn,
          photo_url: teacher.photo_url,
          designation: teacher.designation,
          status: existingAttendance.status,
          action: 'punch_out',
          punch_time: punchTimeStr,
          is_first_punch: false,
          message: 'Punch out recorded'
        }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Already has both punch in and out - just log additional punch
    return new Response(
      JSON.stringify({
        success: true,
        type: 'teacher',
        name: teacher.name,
        name_bn: teacher.name_bn,
        photo_url: teacher.photo_url,
        designation: teacher.designation,
        status: existingAttendance.status,
        action: 'additional_punch',
        punch_time: punchTimeStr,
        is_first_punch: false,
        message: 'Additional punch recorded'
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  // First punch of the day - create attendance record
  let status = 'present';
  let lateMinutes = 0;
  const shift = teacher.shifts;

  if (shift) {
    const punchMinutes = timeToMinutes(punchTimeStr);
    const startMinutes = timeToMinutes(shift.start_time);
    const lateThreshold = timeToMinutes(shift.late_threshold_time || shift.start_time);

    if (punchMinutes <= startMinutes) {
      status = 'present';
    } else if (punchMinutes > lateThreshold) {
      status = 'late';
      lateMinutes = punchMinutes - startMinutes;
    } else {
      status = 'late';
      lateMinutes = punchMinutes - startMinutes;
    }
  }

  console.log('Recording first teacher attendance:', { teacherId, status, punchTimeStr, lateMinutes });

  // Insert attendance record
  const { data: attendance, error: insertError } = await supabase
    .from('teacher_attendance')
    .insert({
      teacher_id: teacherId,
      attendance_date: punchDate,
      punch_in_time: punchTimestamp.toISOString(),
      status,
      late_minutes: lateMinutes,
      device_id: deviceId,
      academic_year_id: teacher.academic_year_id,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting teacher attendance:', insertError);
    return new Response(
      JSON.stringify({ error: insertError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      type: 'teacher',
      name: teacher.name,
      name_bn: teacher.name_bn,
      photo_url: teacher.photo_url,
      designation: teacher.designation,
      status,
      action: 'punch_in',
      punch_time: punchTimeStr,
      late_minutes: lateMinutes,
      is_first_punch: true,
      message: 'First punch - attendance recorded'
    }),
    { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
