const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nyobzadsuqnbxfkfekci.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b2J6YWRzdXFuYnhma2Zla2NpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjA2NDc1MCwiZXhwIjoyMDk3NjQwNzUwfQ.fFpO_i_cofyLOORttE0DRvWQZYPQDrGNYH391vZ9wIo';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function changePassword() {
  const email = 'gstalin110@gmail.com';
  const newPassword = '/ionmax//adm//2026.Stalin';

  try {
    // Primero obtener el user ID del email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error al listar usuarios:', listError);
      return;
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error('Usuario no encontrado:', email);
      return;
    }

    console.log('Usuario encontrado:', user.id);

    // Cambiar contraseña usando admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        password: newPassword 
      }
    );

    if (updateError) {
      console.error('Error al cambiar contraseña:', updateError);
      return;
    }

    console.log('✅ Contraseña cambiada exitosamente para', email);
    console.log('Nueva contraseña:', newPassword);
  } catch (error) {
    console.error('Error:', error);
  }
}

changePassword();
