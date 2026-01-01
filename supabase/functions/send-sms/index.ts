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
  sms_type: "absent" | "late" | "present" | "custom" | "monthly_summary" | "punch" | "custom_notice";
}

interface BulkSmsRequest {
  date: string;
  academic_year_id: string;
  sms_type: "absent" | "late";
}

interface CustomNoticeRequest {
  sms_type: "custom_notice";
  message: string;
  class_id?: string;
  section_id?: string;
  academic_year_id: string;
}

interface PunchSmsRequest {
  sms_type: "punch" | "late";
  student_id: string;
  punch_time: string;
  late_minutes?: number;
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

    // Check if it's a custom notice bulk SMS request
    if (body.sms_type === "custom_notice") {
      return await handleCustomNoticeSms(supabase, body as CustomNoticeRequest);
    }

    // Check if it's a punch or late SMS from process-punch
    if (body.sms_type === "punch" || (body.sms_type === "late" && body.student_id && body.punch_time)) {
      return await handlePunchLateSms(supabase, body as PunchSmsRequest);
    }

    // Check if it's a bulk absent SMS request
    if (body.date && body.academic_year_id && !body.mobile_number) {
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

// Get SMS settings
async function getSmsSettings(supabase: any) {
  const { data: settings, error } = await supabase
    .from("sms_settings")
    .select("*")
    .limit(1)
    .single();

  if (error || !settings) {
    throw new Error("SMS settings not configured");
  }
  return settings;
}

// Get system settings for school name
async function getSystemSettings(supabase: any) {
  const { data } = await supabase
    .from("system_settings")
    .select("school_name, school_name_bn")
    .limit(1)
    .single();
  return data;
}

// Unified send message function with channel preference
async function sendMessage(
  supabase: any,
  settings: any,
  mobile: string,
  message: string,
  studentId: string | null,
  smsType: string
) {
  let result;
  let channel = "sms";
  let fallbackUsed = false;
  let whatsappMessageId = null;

  const preferredChannel = settings.preferred_channel || "sms_only";

  // Try WhatsApp first if enabled and preferred
  if (
    (preferredChannel === "whatsapp_first" || preferredChannel === "whatsapp_only") &&
    settings.whatsapp_enabled &&
    settings.whatsapp_phone_number_id &&
    settings.whatsapp_access_token
  ) {
    result = await sendViaWhatsApp(
      settings.whatsapp_phone_number_id,
      settings.whatsapp_access_token,
      mobile,
      message
    );

    if (result.success) {
      channel = "whatsapp";
      whatsappMessageId = result.messageId;
    } else if (preferredChannel === "whatsapp_first" && settings.whatsapp_fallback_to_sms) {
      // Fallback to SMS
      console.log("WhatsApp failed, falling back to SMS:", result.error);
      result = await sendViaMimSms(settings.api_key, settings.sender_id, mobile, message);
      channel = "sms";
      fallbackUsed = true;
    }
  } else {
    // Default: SMS only
    result = await sendViaMimSms(settings.api_key, settings.sender_id, mobile, message);
    channel = "sms";
  }

  // Log the message
  await supabase.from("sms_logs").insert({
    mobile_number: mobile,
    message,
    student_id: studentId,
    sms_type: smsType,
    status: result.success ? "sent" : "failed",
    channel,
    whatsapp_message_id: whatsappMessageId,
    fallback_used: fallbackUsed,
    error_message: result.error || null,
    sent_at: result.success ? new Date().toISOString() : null,
  });

  return result;
}

async function handleSingleSms(supabase: any, request: SmsRequest) {
  const { mobile_number, message, student_id, sms_type } = request;

  const settings = await getSmsSettings(supabase);

  if (!settings.is_enabled) {
    return new Response(
      JSON.stringify({ success: false, error: "SMS system is disabled" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const result = await sendMessage(supabase, settings, mobile_number, message, student_id || null, sms_type);

  return new Response(
    JSON.stringify(result),
    {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handlePunchLateSms(supabase: any, request: PunchSmsRequest) {
  const { sms_type, student_id, punch_time, late_minutes } = request;

  const settings = await getSmsSettings(supabase);

  if (!settings.is_enabled) {
    console.log("SMS system is disabled");
    return new Response(
      JSON.stringify({ success: false, error: "SMS system is disabled" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check if this SMS type is enabled
  if (sms_type === "punch" && !settings.punch_sms_enabled) {
    console.log("Punch SMS is disabled");
    return new Response(
      JSON.stringify({ success: false, error: "Punch SMS is disabled" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (sms_type === "late" && !settings.late_sms_enabled) {
    console.log("Late SMS is disabled");
    return new Response(
      JSON.stringify({ success: false, error: "Late SMS is disabled" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get student details
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(`
      id, name, name_bn, guardian_mobile,
      class:classes(name, name_bn),
      section:sections(name, name_bn)
    `)
    .eq("id", student_id)
    .single();

  if (studentError || !student) {
    console.error("Student not found:", studentError);
    return new Response(
      JSON.stringify({ success: false, error: "Student not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!student.guardian_mobile) {
    console.log("No guardian mobile for student:", student_id);
    return new Response(
      JSON.stringify({ success: false, error: "No guardian mobile" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const systemSettings = await getSystemSettings(supabase);
  const schoolName = systemSettings?.school_name_bn || systemSettings?.school_name || "স্কুল";

  // Format date and time
  const punchDate = new Date(punch_time);
  const dateStr = punchDate.toLocaleDateString("bn-BD");
  const timeStr = punchDate.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });

  // Get template and format message
  const template = sms_type === "punch" 
    ? settings.punch_sms_template || "প্রিয় অভিভাবক, আপনার সন্তান {{StudentName}} ({{Class}}) আজ {{Date}} সকাল {{Time}} এ স্কুলে এসেছে। - {{SchoolName}}"
    : settings.late_sms_template || "প্রিয় অভিভাবক, আপনার সন্তান {{StudentName}} ({{Class}}) আজ {{Date}} স্কুলে {{LateMinutes}} মিনিট দেরিতে এসেছে। - {{SchoolName}}";

  const className = `${student.class?.name_bn || student.class?.name || ""}-${student.section?.name_bn || student.section?.name || ""}`;

  const message = template
    .replace("{{StudentName}}", student.name_bn || student.name)
    .replace("{{Class}}", className)
    .replace("{{Date}}", dateStr)
    .replace("{{Time}}", timeStr)
    .replace("{{LateMinutes}}", String(late_minutes || 0))
    .replace("{{SchoolName}}", schoolName);

  const result = await sendMessage(supabase, settings, student.guardian_mobile, message, student_id, sms_type);

  return new Response(
    JSON.stringify(result),
    {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleCustomNoticeSms(supabase: any, request: CustomNoticeRequest) {
  const { message, class_id, section_id, academic_year_id } = request;

  const settings = await getSmsSettings(supabase);

  if (!settings.is_enabled) {
    return new Response(
      JSON.stringify({ success: false, error: "SMS system is disabled" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get students based on filters
  let query = supabase
    .from("students")
    .select("id, guardian_mobile")
    .eq("academic_year_id", academic_year_id)
    .eq("is_active", true)
    .not("guardian_mobile", "is", null);

  if (class_id) {
    query = query.eq("class_id", class_id);
  }
  if (section_id) {
    query = query.eq("section_id", section_id);
  }

  const { data: students, error: studentsError } = await query;

  if (studentsError) {
    throw studentsError;
  }

  console.log(`Sending custom notice to ${students?.length || 0} students`);

  let sentCount = 0;
  let failedCount = 0;

  for (const student of students || []) {
    if (!student.guardian_mobile) continue;

    try {
      const result = await sendMessage(
        supabase,
        settings,
        student.guardian_mobile,
        message,
        student.id,
        "custom_notice"
      );

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
      }
    } catch (error) {
      console.error(`Failed to send to ${student.guardian_mobile}:`, error);
      failedCount++;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      total: students?.length || 0,
      sent: sentCount,
      failed: failedCount,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleBulkSms(supabase: any, request: BulkSmsRequest) {
  const { date, academic_year_id, sms_type } = request;

  const settings = await getSmsSettings(supabase);

  if (!settings.is_enabled || !settings.absent_sms_enabled) {
    return new Response(
      JSON.stringify({ success: false, error: "Absent SMS is disabled" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const systemSettings = await getSystemSettings(supabase);
  const schoolName = systemSettings?.school_name_bn || systemSettings?.school_name || "স্কুল";

  // Get all students who are absent today
  const { data: allStudents, error: studentsError } = await supabase
    .from("students")
    .select(`
      id, name, name_bn, guardian_mobile,
      class:classes(name, name_bn),
      section:sections(name, name_bn)
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

    const className = `${student.class?.name_bn || student.class?.name || ""}-${student.section?.name_bn || student.section?.name || ""}`;

    // Format message using template
    const message = template
      .replace("{{StudentName}}", student.name_bn || student.name)
      .replace("{{Class}}", className)
      .replace("{{Date}}", new Date(date).toLocaleDateString("bn-BD"))
      .replace("{{SchoolName}}", schoolName);

    try {
      const result = await sendMessage(
        supabase,
        settings,
        student.guardian_mobile,
        message,
        student.id,
        "absent"
      );

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

async function sendViaWhatsApp(phoneNumberId: string, accessToken: string, mobile: string, message: string) {
  try {
    // Format mobile number for WhatsApp (Bangladesh: 01712345678 → 8801712345678)
    let formattedMobile = mobile.replace(/[^0-9]/g, ""); // Remove non-numeric chars
    if (formattedMobile.startsWith("0")) {
      formattedMobile = "88" + formattedMobile;
    } else if (!formattedMobile.startsWith("88")) {
      formattedMobile = "88" + formattedMobile;
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedMobile,
        type: "text",
        text: { body: message },
      }),
    });

    const result = await response.json();
    console.log("WhatsApp API response:", result);

    if (result.messages && result.messages[0]?.id) {
      return { success: true, messageId: result.messages[0].id };
    } else {
      return { success: false, error: result.error?.message || "WhatsApp send failed" };
    }
  } catch (error: any) {
    console.error("WhatsApp API error:", error);
    return { success: false, error: error.message };
  }
}

async function sendViaMimSms(apiKey: string, senderId: string, mobile: string, message: string) {
  try {
    if (!apiKey || !senderId) {
      return { success: false, error: "SMS API key or sender ID not configured" };
    }

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
