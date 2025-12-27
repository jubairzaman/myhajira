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
      return await processStudentPunch(supabase, studentCard.student_id, punchTimestamp, punchDate, punchTimeStr, deviceId);
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
      return await processTeacherPunch(supabase, teacherCard.teacher_id, punchTimestamp, punchDate, punchTimeStr, deviceId);
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
  deviceId: string | null
) {
  // Get student with shift info
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*, shifts(id, start_time, late_threshold_time, absent_cutoff_time)')
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    console.error('Student not found:', studentError);
    return new Response(
      JSON.stringify({ error: 'Student not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  // Check if already punched today
  const { data: existingPunch } = await supabase
    .from('student_attendance')
    .select('id')
    .eq('student_id', studentId)
    .eq('attendance_date', punchDate)
    .maybeSingle();

  if (existingPunch) {
    console.log('Already punched today:', existingPunch);
    return new Response(
      JSON.stringify({ message: 'Already recorded', student_name: student.name }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  // Determine status based on shift timing
  let status = 'present';
  const shift = student.shifts;
  
  if (shift) {
    const punchMinutes = timeToMinutes(punchTimeStr);
    const lateThreshold = timeToMinutes(shift.late_threshold_time || shift.start_time);
    const absentCutoff = timeToMinutes(shift.absent_cutoff_time || '23:59');

    if (punchMinutes > absentCutoff) {
      status = 'absent';
    } else if (punchMinutes > lateThreshold) {
      status = 'late';
    }
  }

  console.log('Recording attendance:', { studentId, status, punchTimeStr });

  // Insert attendance record
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
      status,
      punch_time: punchTimeStr,
      photo_url: student.photo_url,
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
  deviceId: string | null
) {
  // Get teacher with shift info
  const { data: teacher, error: teacherError } = await supabase
    .from('teachers')
    .select('*, shifts(id, start_time, late_threshold_time)')
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
  const { data: existingPunch } = await supabase
    .from('teacher_attendance')
    .select('id, punch_in_time')
    .eq('teacher_id', teacherId)
    .eq('attendance_date', punchDate)
    .maybeSingle();

  if (existingPunch) {
    // This is a punch-out
    if (existingPunch.punch_in_time && !existingPunch.punch_out_time) {
      const { error: updateError } = await supabase
        .from('teacher_attendance')
        .update({ punch_out_time: punchTimestamp.toISOString() })
        .eq('id', existingPunch.id);

      if (updateError) {
        console.error('Error updating punch-out:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          type: 'teacher',
          name: teacher.name,
          name_bn: teacher.name_bn,
          action: 'punch_out',
          punch_time: punchTimeStr,
          photo_url: teacher.photo_url,
        }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Already recorded', teacher_name: teacher.name }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  // Determine status based on shift timing
  let status = 'present';
  let lateMinutes = 0;
  const shift = teacher.shifts;

  if (shift) {
    const punchMinutes = timeToMinutes(punchTimeStr);
    const lateThreshold = timeToMinutes(shift.late_threshold_time || shift.start_time);

    if (punchMinutes > lateThreshold) {
      status = 'late';
      lateMinutes = punchMinutes - lateThreshold;
    }
  }

  console.log('Recording teacher attendance:', { teacherId, status, punchTimeStr });

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
      status,
      action: 'punch_in',
      punch_time: punchTimeStr,
      photo_url: teacher.photo_url,
    }),
    { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
