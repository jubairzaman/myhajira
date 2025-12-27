import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('Creating super admin user...')

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Supabase URL:', supabaseUrl)
    console.log('Service role key exists:', !!serviceRoleKey)

    const supabaseAdmin = createClient(
      supabaseUrl ?? '',
      serviceRoleKey ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if user already exists
    console.log('Checking if user exists...')
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      throw listError
    }

    const existingUser = existingUsers?.users?.find(u => u.email === 'super@admin.com')
    console.log('Existing user found:', !!existingUser)

    if (existingUser) {
      console.log('User exists, ensuring role is set...')
      // Make sure user has super_admin role
      const { error: roleError } = await supabaseAdmin.from('user_roles').upsert({
        user_id: existingUser.id,
        role: 'super_admin'
      }, { onConflict: 'user_id' })

      if (roleError) {
        console.error('Error setting role:', roleError)
      }

      return new Response(
        JSON.stringify({ message: 'Super admin already exists', userId: existingUser.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the super admin user
    console.log('Creating new user...')
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'super@admin.com',
      password: '123456',
      email_confirm: true,
      user_metadata: { full_name: 'Super Admin' }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      throw createError
    }

    console.log('User created successfully:', userData.user?.id)

    // The trigger should assign the role, but let's ensure it
    if (userData.user) {
      console.log('Ensuring super_admin role...')
      const { error: roleError } = await supabaseAdmin.from('user_roles').upsert({
        user_id: userData.user.id,
        role: 'super_admin'
      }, { onConflict: 'user_id' })

      if (roleError) {
        console.error('Error setting role:', roleError)
      }
    }

    return new Response(
      JSON.stringify({ message: 'Super admin created successfully', userId: userData.user?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
