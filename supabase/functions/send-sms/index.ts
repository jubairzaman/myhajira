import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// BulkSMSBD response codes mapping
const BULKSMSBD_CODES: Record<string, string> = {
  "202": "SMS Sent Successfully",
  "1001": "Invalid Number",
  "1002": "Sender ID invalid or disabled",
  "1003": "Missing required fields",
  "1007": "Insufficient balance",
  "1031": "Account not verified",
  "1032": "IP not whitelisted",
};

interface SmsRequest {
  mobile_number: string;
  message: string;
  student_id?: string;
  sms_type: "absent" | "late" | "present" | "custom" | "monthly_summary" | "punch" | "custom_notice" | "fee_due" | "otp";
  sent_by?: "admin" | "system";
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

interface BalanceCheckRequest {
  action: "check_balance";
  provider: "mim_sms" | "bulksmsbd";
}

interface TestSmsRequest {
  action: "test_sms";
  mobile_number: string;
  message: string;
  provider: "mim_sms" | "bulksmsbd";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log("SMS request received:", JSON.stringify(body));

    // Handle balance check
    if (body.action === "check_balance") {
      return await handleBalanceCheck(supabase, body as BalanceCheckRequest);
    }

    // Handle test SMS
    if (body.action === "test_sms") {
      return await handleTestSms(supabase, body as TestSmsRequest);
    }

    // Handle custom notice bulk SMS
    if (body.sms_type === "custom_notice") {
      return await handleCustomNoticeSms(supabase, body as CustomNoticeRequest);
    }

    // Handle punch/late SMS
    if (body.sms_type === "punch" || (body.sms_type === "late" && body.student_id && body.punch_time)) {
      return await handlePunchLateSms(supabase, body as PunchSmsRequest);
    }

    // Handle bulk absent SMS
    if (body.date && body.academic_year_id && !body.mobile_number) {
      return await handleBulkSms(supabase, body as BulkSmsRequest);
    }

    // Single SMS
    return await handleSingleSms(supabase, body as SmsRequest);
  } catch (error: any) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

// Get system settings
async function getSystemSettings(supabase: any) {
  const { data } = await supabase
    .from("system_settings")
    .select("school_name, school_name_bn")
    .limit(1)
    .single();
  return data;
}

// Unified send message function with provider selection
async function sendMessage(
  supabase: any,
  settings: any,
  mobile: string,
  message: string,
  studentId: string | null,
  smsType: string,
  sentBy: "admin" | "system" = "system"
) {
  let result;
  let channel = "sms";
  let fallbackUsed = false;
  let whatsappMessageId = null;
  let providerName = settings.active_sms_provider || "mim_sms";
  let responseCode = null;
  let responseMessage = null;

  const preferredChannel = settings.preferred_channel || "sms_only";

  // Try WhatsApp first if enabled
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
      providerName = "whatsapp";
    } else if (preferredChannel === "whatsapp_first" && settings.whatsapp_fallback_to_sms) {
      console.log("WhatsApp failed, falling back to SMS:", result.error);
      result = await sendViaSmsProvider(settings, mobile, message);
      channel = "sms";
      fallbackUsed = true;
      providerName = settings.active_sms_provider || "mim_sms";
      responseCode = result.responseCode;
      responseMessage = result.responseMessage;
    }
  } else {
    // Use active SMS provider
    result = await sendViaSmsProvider(settings, mobile, message);
    channel = "sms";
    providerName = settings.active_sms_provider || "mim_sms";
    responseCode = result.responseCode;
    responseMessage = result.responseMessage;
  }

  // Log the message
  await supabase.from("sms_logs").insert({
    mobile_number: mobile,
    message,
    student_id: studentId,
    sms_type: smsType,
    status: result.success ? "sent" : "failed",
    channel,
    provider_name: providerName,
    response_code: responseCode,
    response_message: responseMessage,
    whatsapp_message_id: whatsappMessageId,
    fallback_used: fallbackUsed,
    error_message: result.error || null,
    sent_at: result.success ? new Date().toISOString() : null,
    sent_by: sentBy,
  });

  return result;
}

// Send via active SMS provider
async function sendViaSmsProvider(settings: any, mobile: string, message: string) {
  const provider = settings.active_sms_provider || "mim_sms";
  
  if (provider === "bulksmsbd") {
    return await sendViaBulkSmsBD(
      settings.bulksmsbd_api_key,
      settings.bulksmsbd_sender_id,
      mobile,
      message
    );
  } else {
    return await sendViaMimSms(
      settings.api_key,
      settings.sender_id,
      mobile,
      message
    );
  }
}

// BulkSMSBD API
async function sendViaBulkSmsBD(apiKey: string, senderId: string, mobile: string, message: string) {
  try {
    if (!apiKey || !senderId) {
      return { success: false, error: "BulkSMSBD API key or sender ID not configured", responseCode: null, responseMessage: null };
    }

    // Format mobile number (Bangladesh: 01712345678 → 88017XXXXXXXX)
    let formattedMobile = mobile.replace(/[^0-9]/g, "");
    if (formattedMobile.startsWith("0")) {
      formattedMobile = "88" + formattedMobile;
    } else if (!formattedMobile.startsWith("88")) {
      formattedMobile = "88" + formattedMobile;
    }

    const url = "http://bulksmsbd.net/api/smsapi";
    
    const params = new URLSearchParams({
      api_key: apiKey,
      senderid: senderId,
      number: formattedMobile,
      message: message,
    });

    console.log("Sending via BulkSMSBD:", formattedMobile);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.json();
    console.log("BulkSMSBD response:", result);

    const responseCode = String(result.response_code || result.code || "");
    const responseMessage = BULKSMSBD_CODES[responseCode] || result.error_message || result.message || "Unknown response";

    if (responseCode === "202") {
      return { success: true, responseCode, responseMessage };
    } else {
      return { success: false, error: responseMessage, responseCode, responseMessage };
    }
  } catch (error: any) {
    console.error("BulkSMSBD API error:", error);
    return { success: false, error: error.message, responseCode: null, responseMessage: null };
  }
}

// BulkSMSBD Bulk SMS (comma-separated numbers)
async function sendBulkViaBulkSmsBD(apiKey: string, senderId: string, mobiles: string[], message: string) {
  try {
    if (!apiKey || !senderId) {
      return { success: false, error: "BulkSMSBD API key or sender ID not configured" };
    }

    // Format and join mobile numbers
    const formattedNumbers = mobiles.map(m => {
      let formatted = m.replace(/[^0-9]/g, "");
      if (formatted.startsWith("0")) {
        formatted = "88" + formatted;
      } else if (!formatted.startsWith("88")) {
        formatted = "88" + formatted;
      }
      return formatted;
    }).join(",");

    const url = "http://bulksmsbd.net/api/smsapi";
    
    const params = new URLSearchParams({
      api_key: apiKey,
      senderid: senderId,
      number: formattedNumbers,
      message: message,
    });

    console.log("Sending bulk via BulkSMSBD to", mobiles.length, "numbers");

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.json();
    console.log("BulkSMSBD bulk response:", result);

    const responseCode = String(result.response_code || result.code || "");

    if (responseCode === "202") {
      return { success: true, sentCount: mobiles.length };
    } else {
      return { success: false, error: BULKSMSBD_CODES[responseCode] || result.error_message || "Unknown error" };
    }
  } catch (error: any) {
    console.error("BulkSMSBD bulk API error:", error);
    return { success: false, error: error.message };
  }
}

// Check BulkSMSBD balance
async function checkBulkSmsBDBalance(apiKey: string) {
  try {
    const url = `http://bulksmsbd.net/api/getBalanceApi?api_key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);
    const result = await response.json();
    console.log("BulkSMSBD balance response:", result);
    
    // Response format: { balance: "123.45" } or error
    if (result.balance !== undefined) {
      return { success: true, balance: parseFloat(result.balance) || 0 };
    } else {
      return { success: false, error: result.error_message || "Failed to get balance" };
    }
  } catch (error: any) {
    console.error("BulkSMSBD balance check error:", error);
    return { success: false, error: error.message };
  }
}

// Handle balance check request
async function handleBalanceCheck(supabase: any, request: BalanceCheckRequest) {
  const settings = await getSmsSettings(supabase);
  
  if (request.provider === "bulksmsbd") {
    if (!settings.bulksmsbd_api_key) {
      return new Response(
        JSON.stringify({ success: false, error: "BulkSMSBD API key not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await checkBulkSmsBDBalance(settings.bulksmsbd_api_key);
    
    if (result.success) {
      // Update cached balance
      await supabase.from("sms_settings").update({
        bulksmsbd_balance: result.balance,
        bulksmsbd_balance_updated_at: new Date().toISOString(),
      }).eq("id", settings.id);
    }

    return new Response(
      JSON.stringify(result),
      { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } else {
    // MIM SMS balance - return cached value
    return new Response(
      JSON.stringify({ success: true, balance: settings.balance || 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Handle test SMS
async function handleTestSms(supabase: any, request: TestSmsRequest) {
  const settings = await getSmsSettings(supabase);
  
  let result;
  if (request.provider === "bulksmsbd") {
    result = await sendViaBulkSmsBD(
      settings.bulksmsbd_api_key,
      settings.bulksmsbd_sender_id,
      request.mobile_number,
      request.message
    );
  } else {
    result = await sendViaMimSms(
      settings.api_key,
      settings.sender_id,
      request.mobile_number,
      request.message
    );
  }

  // Log test SMS
  await supabase.from("sms_logs").insert({
    mobile_number: request.mobile_number,
    message: request.message,
    sms_type: "custom",
    status: result.success ? "sent" : "failed",
    channel: "sms",
    provider_name: request.provider,
    response_code: result.responseCode || null,
    response_message: result.responseMessage || null,
    error_message: result.error || null,
    sent_at: result.success ? new Date().toISOString() : null,
    sent_by: "admin",
  });

  return new Response(
    JSON.stringify(result),
    { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleSingleSms(supabase: any, request: SmsRequest) {
  const { mobile_number, message, student_id, sms_type, sent_by } = request;

  const settings = await getSmsSettings(supabase);

  if (!settings.is_enabled) {
    return new Response(
      JSON.stringify({ success: false, error: "SMS system is disabled" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const result = await sendMessage(supabase, settings, mobile_number, message, student_id || null, sms_type, sent_by || "system");

  return new Response(
    JSON.stringify(result),
    { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

  const punchDate = new Date(punch_time);
  const dateStr = punchDate.toLocaleDateString("bn-BD");
  const timeStr = punchDate.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });

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
    { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

  let query = supabase
    .from("students")
    .select("id, guardian_mobile")
    .eq("academic_year_id", academic_year_id)
    .eq("is_active", true)
    .not("guardian_mobile", "is", null);

  if (class_id) query = query.eq("class_id", class_id);
  if (section_id) query = query.eq("section_id", section_id);

  const { data: students, error: studentsError } = await query;

  if (studentsError) throw studentsError;

  console.log(`Sending custom notice to ${students?.length || 0} students`);

  let sentCount = 0;
  let failedCount = 0;

  // If BulkSMSBD is active and has enough recipients, use bulk API
  if (settings.active_sms_provider === "bulksmsbd" && students && students.length > 1) {
    const mobiles = students.map((s: any) => s.guardian_mobile).filter(Boolean);
    const bulkResult = await sendBulkViaBulkSmsBD(
      settings.bulksmsbd_api_key,
      settings.bulksmsbd_sender_id,
      mobiles,
      message
    );

    if (bulkResult.success) {
      sentCount = mobiles.length;
      // Log bulk SMS
      for (const student of students) {
        await supabase.from("sms_logs").insert({
          mobile_number: student.guardian_mobile,
          message,
          student_id: student.id,
          sms_type: "custom_notice",
          status: "sent",
          channel: "sms",
          provider_name: "bulksmsbd",
          sent_at: new Date().toISOString(),
          sent_by: "admin",
        });
      }
    } else {
      failedCount = mobiles.length;
    }
  } else {
    // Send individually
    for (const student of students || []) {
      if (!student.guardian_mobile) continue;

      try {
        const result = await sendMessage(supabase, settings, student.guardian_mobile, message, student.id, "custom_notice", "admin");
        if (result.success) sentCount++;
        else failedCount++;
      } catch (error) {
        console.error(`Failed to send to ${student.guardian_mobile}:`, error);
        failedCount++;
      }
    }
  }

  return new Response(
    JSON.stringify({ success: true, total: students?.length || 0, sent: sentCount, failed: failedCount }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

  const { data: attendanceRecords } = await supabase
    .from("student_attendance")
    .select("student_id, status")
    .eq("attendance_date", date)
    .eq("academic_year_id", academic_year_id);

  const attendedStudentIds = new Set((attendanceRecords || []).map((r: any) => r.student_id));
  const absentStudents = (allStudents || []).filter((s: any) => !attendedStudentIds.has(s.id));

  console.log(`Found ${absentStudents.length} absent students for ${date}`);

  let sentCount = 0;
  let failedCount = 0;
  const template = settings.sms_template || "প্রিয় অভিভাবক, আপনার সন্তান {{StudentName}} ({{Class}}) আজ {{Date}} স্কুলে অনুপস্থিত। - {{SchoolName}}";

  for (const student of absentStudents) {
    if (!student.guardian_mobile) continue;

    const className = `${student.class?.name_bn || student.class?.name || ""}-${student.section?.name_bn || student.section?.name || ""}`;

    const message = template
      .replace("{{StudentName}}", student.name_bn || student.name)
      .replace("{{Class}}", className)
      .replace("{{Date}}", new Date(date).toLocaleDateString("bn-BD"))
      .replace("{{SchoolName}}", schoolName);

    try {
      const result = await sendMessage(supabase, settings, student.guardian_mobile, message, student.id, "absent");
      if (result.success) sentCount++;
      else failedCount++;
    } catch (error) {
      console.error(`Failed to send SMS to ${student.guardian_mobile}:`, error);
      failedCount++;
    }
  }

  return new Response(
    JSON.stringify({ success: true, total_absent: absentStudents.length, sent: sentCount, failed: failedCount }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function sendViaWhatsApp(phoneNumberId: string, accessToken: string, mobile: string, message: string) {
  try {
    let formattedMobile = mobile.replace(/[^0-9]/g, "");
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
      return { success: false, error: "SMS API key or sender ID not configured", responseCode: null, responseMessage: null };
    }

    const url = `https://api.mimsms.com/api/SmsSending/MimSingleSms`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ApiKey: apiKey,
        SenderId: senderId,
        MobileNo: mobile,
        Message: message,
        MsgType: "UNI",
      }),
    });

    const result = await response.json();
    console.log("mimSMS response:", result);

    if (result.Status === "Success" || result.status === "success") {
      return { success: true, responseCode: "200", responseMessage: "Success" };
    } else {
      return { success: false, error: result.Message || result.message || "Unknown error", responseCode: null, responseMessage: result.Message || result.message };
    }
  } catch (error: any) {
    console.error("mimSMS API error:", error);
    return { success: false, error: error.message, responseCode: null, responseMessage: null };
  }
}
