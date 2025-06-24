const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.join(__dirname, '..', '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseKey ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    // Check if a client exists
    const { data: existingClients, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('Error fetching clients:', fetchError);
      return;
    }

    if (existingClients && existingClients.length > 0) {
      console.log('Client already exists:', existingClients[0]);
      return;
    }

    // Create a new client
    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert({
        name: 'Demo Company',
        email: 'demo@example.com',
        plan: 'free'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating client:', createError);
      return;
    }

    console.log('Created client:', newClient);

    // Create a user for the client
    const { data: newUser, error: userError } = await supabase
      .from('client_users')
      .insert({
        client_id: newClient.id,
        email: 'demo@example.com',
        role: 'owner'
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }

    console.log('Created user:', newUser);
    console.log('Setup complete! You can now configure a website.');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 