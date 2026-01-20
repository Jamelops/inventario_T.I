const express = require('express');
const { supabase } = require('../config/supabase');
const router = express.Router();

// ✅ GET /api/ativos - Listar todos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ativos')
      .select('*')
      .order('criado_em', { ascending: false });
    
    if (error) throw error;
    
    const ativos = data.map(ativo => ({
      id_humanizado: ativo.codigo_humanizado,
      id_interno: ativo.id,
      nome: ativo.nome,
      tipo: ativo.tipo,
      descricao: ativo.descricao,
      localizacao: ativo.localizacao,
      status: ativo.status,
      criado_em: ativo.criado_em
    }));
    
    res.json({ dados: ativos });
  } catch (error) {
    console.error('Erro ao listar:', error);
    res.status(500).json({ erro: 'Erro ao listar ativos' });
  }
});

// ✅ POST /api/ativos - Criar novo
router.post('/', async (req, res) => {
  try {
    const { nome, tipo, descricao, localizacao } = req.body;
    
    if (!nome || !tipo) {
      return res.status(400).json({ erro: 'Nome e tipo obrigatórios' });
    }
    
    const { data, error } = await supabase
      .from('ativos')
      .insert({
        nome,
        tipo: tipo.toLowerCase(),
        descricao,
        localizacao,
        status: 'ativo'
      })
      .select('id, codigo_humanizado, nome, tipo');
    
    if (error) throw error;
    
    const novoAtivo = data[0];
    
    res.status(201).json({
      id_humanizado: novoAtivo.codigo_humanizado,
      id_interno: novoAtivo.id,
      nome: novoAtivo.nome,
      mensagem: `✅ Ativo ${novoAtivo.codigo_humanizado} criado!`
    });
  } catch (error) {
    console.error('Erro ao criar:', error);
    res.status(500).json({ erro: 'Erro ao criar ativo' });
  }
});

// ✅ PUT /api/ativos/:idInterno - Atualizar
router.put('/:idInterno', async (req, res) => {
  try {
    const { idInterno } = req.params;
    const atualizacoes = req.body;
    
    // Não permitir alterar ID
    delete atualizacoes.id;
    delete atualizacoes.codigo_humanizado;
    
    const { data, error } = await supabase
      .from('ativos')
      .update(atualizacoes)
      .eq('id', idInterno)
      .select('id, codigo_humanizado, nome');
    
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ erro: 'Ativo não encontrado' });
    }
    
    res.json({
      id_humanizado: data[0].codigo_humanizado,
      mensagem: `✅ Ativo ${data[0].codigo_humanizado} atualizado!`
    });
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    res.status(500).json({ erro: 'Erro ao atualizar ativo' });
  }
});

// ✅ DELETE /api/ativos/:idInterno - Deletar
router.delete('/:idInterno', async (req, res) => {
  try {
    const { idInterno } = req.params;
    
    const { data: ativo } = await supabase
      .from('ativos')
      .select('codigo_humanizado')
      .eq('id', idInterno)
      .single();
    
    if (!ativo) {
      return res.status(404).json({ erro: 'Ativo não encontrado' });
    }
    
    const { error } = await supabase
      .from('ativos')
      .delete()
      .eq('id', idInterno);
    
    if (error) throw error;
    
    res.json({
      mensagem: `✅ Ativo ${ativo.codigo_humanizado} deletado!`,
      id_humanizado: ativo.codigo_humanizado
    });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ erro: 'Erro ao deletar ativo' });
  }
});

module.exports = router;