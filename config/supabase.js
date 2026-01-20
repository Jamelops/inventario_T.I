const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sua-chave-publica';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };