import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === 'super@admin.com')

    if (existingUser) {
      // Make sure user has super_admin role
      await supabaseAdmin.from('user_roles').upsert({
        user_id: existingUser.id,
        role: 'super_admin'
      }, { onConflict: 'user_id' })

      return new Response(
        JSON.stringify({ message: 'Super admin already exists', userId: existingUser.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the super admin user
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'super@admin.com',
      password: '123456',
      email_confirm: true,
      user_metadata: { full_name: 'Super Admin' }
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Super admin created successfully', userId: user.user?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
