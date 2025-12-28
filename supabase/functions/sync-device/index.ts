import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  device_id: string;
  action: "sync" | "status" | "test";
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

    const { device_id, action } = (await req.json()) as SyncRequest;
    console.log(`Device sync request: ${action} for device ${device_id}`);

    // Get device info
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("*")
      .eq("id", device_id)
      .single();

    if (deviceError || !device) {
      throw new Error("Device not found");
    }

    if (action === "status") {
      // Just check if device is reachable (placeholder for actual device ping)
      const isOnline = await checkDeviceStatus(device.ip_address, device.port);
      
      await supabase
        .from("devices")
        .update({ is_online: isOnline })
        .eq("id", device_id);

      return new Response(
        JSON.stringify({ success: true, is_online: isOnline }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "test") {
      // Test connection to device
      const isConnected = await testDeviceConnection(device.ip_address, device.port);
      
      return new Response(
        JSON.stringify({ success: isConnected, message: isConnected ? "Connection successful" : "Connection failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "sync") {
      // Sync attendance data from device
      // In production, this would connect to ZKTeco SDK and fetch attendance logs
      
      // For now, update sync timestamp and mark as online
      await supabase
        .from("devices")
        .update({
          last_sync_at: new Date().toISOString(),
          is_online: true,
        })
        .eq("id", device_id);

      console.log(`Device ${device.name} synced successfully`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Device synced successfully",
          device_name: device.name,
          sync_time: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    console.error("Error in sync-device function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function checkDeviceStatus(ip: string, port: number): Promise<boolean> {
  // Placeholder for actual device status check
  // In production, this would attempt to connect to the ZKTeco device
  console.log(`Checking status of device at ${ip}:${port}`);
  
  // Simulate network check (always returns true for demo)
  // Replace with actual device ping/connection check
  return true;
}

async function testDeviceConnection(ip: string, port: number): Promise<boolean> {
  // Placeholder for actual device connection test
  // In production, this would use ZKTeco SDK to verify connection
  console.log(`Testing connection to device at ${ip}:${port}`);
  
  // Simulate connection test
  return true;
}
