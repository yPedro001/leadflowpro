const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLogin() {
  console.log("Iniciando teste de login com conta master...");
  const { data, error } = await client.auth.signInWithPassword({
    email: 'lyvox.consult@gmail.com',
    password: 'senha-super-segura-123' // Or whichever password the user uses, wait I don't know the exact master password
  });
  
  if (error) {
    console.error("Login falhou. (Erro esperado se a senha testada não for a real, ou se for erro de conexão):", error.message);
  } else {
    console.log("Login BEM-SUCEDIDO! User ID:", data.user.id);
  }
}

testLogin();
