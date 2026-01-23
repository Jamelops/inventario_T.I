/**
 * Script para renumerar IDs de seções no Supabase
 * Altera IDs que começam em números altos (ex: e7e7a322)
 * Para começar em 1 (ex: 1, 2, 3, ...)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseLegacyKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabaseKey = supabaseAnonKey || supabaseLegacyKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Defina: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ou legado VITE_SUPABASE_PUBLISHABLE_KEY)');
  process.exit(1);
}
if (!supabaseAnonKey && supabaseLegacyKey) {
  console.warn('⚠️  [DEPRECATED] VITE_SUPABASE_PUBLISHABLE_KEY é legado. Use VITE_SUPABASE_ANON_KEY.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Renumerar seções
 * Muda IDs de:
 * e7e7a322-469f-4600-9701-da3f069737dc
 * Para:
 * 1, 2, 3, ...
 */
async function renumberSectionIds() {
  try {
    console.log('🔄 Iniciando renumeração de IDs de seções...');
    
    // 1. Buscar todas as seções atuais
    const { data: sections, error: fetchError } = await supabase
      .from('sections')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (fetchError) throw fetchError;
    
    if (!sections || sections.length === 0) {
      console.log('ℹ️  Nenhuma seção encontrada');
      return;
    }
    
    console.log(`📊 Encontradas ${sections.length} seções`);
    
    // 2. Criar mapa de IDs antigos -> novos
    const idMap = {};
    sections.forEach((section, index) => {
      idMap[section.id] = index + 1; // Começar em 1
    });
    
    console.log('📝 Mapa de renumeração:');
    Object.entries(idMap).forEach(([old, newId]) => {
      console.log(`  ${old} → ${newId}`);
    });
    
    // 3. Atualizar IDs nas seções
    console.log('\n🔄 Atualizando seções...');
    for (const section of sections) {
      const newId = idMap[section.id];
      
      const { error: updateError } = await supabase
        .from('sections')
        .update({ id: newId, display_id: newId })
        .eq('id', section.id);
      
      if (updateError) {
        console.error(`❌ Erro ao atualizar ${section.id}:`, updateError);
      } else {
        console.log(`✅ ${section.name} → ID ${newId}`);
      }
    }
    
    // 4. Atualizar referências em outras tabelas
    console.log('\n🔄 Atualizando referências em outras tabelas...');
    
    // Se houver referências em outros lugares, atualizar também
    const { data: references, error: refError } = await supabase
      .from('content')
      .select('id, section_id')
      .not('section_id', 'is', null);
    
    if (!refError && references) {
      for (const ref of references) {
        if (idMap[ref.section_id]) {
          const { error } = await supabase
            .from('content')
            .update({ section_id: idMap[ref.section_id] })
            .eq('id', ref.id);
          
          if (!error) {
            console.log(`✅ Atualizado content ${ref.id}`);
          }
        }
      }
    }
    
    console.log('\n✅ Renumeração concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante renumeração:', error);
    process.exit(1);
  }
}

// Executar
renumberSectionIds();
