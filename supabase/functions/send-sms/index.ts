import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SmsRequest {
  mobile_number: string;
  message: string;
  student_id?: string;
  sms_type: "absent" | "late" | "present" | "custom" | "monthly_summary";
}

interface BulkSmsRequest {
  date: string;
  academic_year_id: string;
  sms_type: "absent" | "late";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log("SMS request received:", body);

    // Check if it's a bulk SMS request
    if (body.date && body.academic_year_id) {
      return await handleBulkSms(supabase, body as BulkSmsRequest);
    }

    // Single SMS
    return await handleSingleSms(supabase, body as SmsRequest);
  } catch (error: any) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleSingleSms(supabase: any, request: SmsRequest) {
  const { mobile_number, message, student_id, sms_type } = request;

  // Get SMS settings
  const { data: settings, error: settingsError } = await supabase
    .from("sms_settings")
    .select("*")
    .limit(1)
    .single();

  if (settingsError || !settings) {
    throw new Error("SMS settings not configured");
  }

  if (!settings.is_enabled) {
    return new Response(
      JSON.stringify({ success: false, error: "SMS system is disabled" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!settings.api_key || !settings.sender_id) {
    throw new Error("SMS API key or sender ID not configured");
  }

  // Send SMS via mimSMS API
  const smsResult = await sendViaMimSms(settings.api_key, settings.sender_id, mobile_number, message);

  // Log the SMS
  await supabase.from("sms_logs").insert({
    mobile_number,
    message,
    student_id,
    sms_type,
    status: smsResult.success ? "sent" : "failed",
    error_message: smsResult.error || null,
    sent_at: smsResult.success ? new Date().toISOString() : null,
  });

  return new Response(
    JSON.stringify(smsResult),
    {
      status: smsResult.success ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleBulkSms(supabase: any, request: BulkSmsRequest) {
  const { date, academic_year_id, sms_type } = request;

  // Get SMS settings
  const { data: settings, error: settingsError } = await supabase
    .from("sms_settings")
    .select("*")
    .limit(1)
    .single();

  if (settingsError || !settings) {
    throw new Error("SMS settings not configured");
  }

  if (!settings.is_enabled || !settings.absent_sms_enabled) {
    return new Response(
      JSON.stringify({ success: false, error: "Absent SMS is disabled" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get system settings for school name
  const { data: systemSettings } = await supabase
    .from("system_settings")
    .select("school_name, school_name_bn")
    .limit(1)
    .single();

  const schoolName = systemSettings?.school_name_bn || systemSettings?.school_name || "স্কুল";

  // Get all students who are absent today
  const { data: allStudents, error: studentsError } = await supabase
    .from("students")
    .select(`
      id, name, name_bn, guardian_mobile,
      class:classes(name),
      section:sections(name)
    `)
    .eq("academic_year_id", academic_year_id)
    .eq("is_active", true);

  if (studentsError) throw studentsError;

  // Get students who have attendance records for today
  const { data: attendanceRecords } = await supabase
    .from("student_attendance")
    .select("student_id, status")
    .eq("attendance_date", date)
    .eq("academic_year_id", academic_year_id);

  const attendedStudentIds = new Set((attendanceRecords || []).map((r: any) => r.student_id));

  // Find absent students (no attendance record = absent)
  const absentStudents = (allStudents || []).filter((s: any) => !attendedStudentIds.has(s.id));

  console.log(`Found ${absentStudents.length} absent students for ${date}`);

  let sentCount = 0;
  let failedCount = 0;
  const template = settings.sms_template || "প্রিয় অভিভাবক, আপনার সন্তান {{StudentName}} ({{Class}}) আজ {{Date}} স্কুলে অনুপস্থিত। - {{SchoolName}}";

  for (const student of absentStudents) {
    if (!student.guardian_mobile) continue;

    // Format message using template
    const message = template
      .replace("{{StudentName}}", student.name_bn || student.name)
      .replace("{{Class}}", `${student.class?.name || ''}-${student.section?.name || ''}`)
      .replace("{{Date}}", new Date(date).toLocaleDateString("bn-BD"))
      .replace("{{SchoolName}}", schoolName);

    try {
      const result = await sendViaMimSms(
        settings.api_key,
        settings.sender_id,
        student.guardian_mobile,
        message
      );

      // Log SMS
      await supabase.from("sms_logs").insert({
        mobile_number: student.guardian_mobile,
        message,
        student_id: student.id,
        sms_type: "absent",
        status: result.success ? "sent" : "failed",
        error_message: result.error || null,
        sent_at: result.success ? new Date().toISOString() : null,
      });

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
      }
    } catch (error) {
      console.error(`Failed to send SMS to ${student.guardian_mobile}:`, error);
      failedCount++;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      total_absent: absentStudents.length,
      sent: sentCount,
      failed: failedCount,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function sendViaMimSms(apiKey: string, senderId: string, mobile: string, message: string) {
  try {
    // mimSMS API endpoint
    const url = `https://api.mimsms.com/api/SmsSending/MimSingleSms`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ApiKey: apiKey,
        SenderId: senderId,
        MobileNo: mobile,
        Message: message,
        MsgType: "UNI", // Unicode for Bengali
      }),
    });

    const result = await response.json();
    console.log("mimSMS response:", result);

    // Check response status
    if (result.Status === "Success" || result.status === "success") {
      return { success: true };
    } else {
      return { success: false, error: result.Message || result.message || "Unknown error" };
    }
  } catch (error: any) {
    console.error("mimSMS API error:", error);
    return { success: false, error: error.message };
  }
}
