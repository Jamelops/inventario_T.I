const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Armazenamento em memória (substitua por banco de dados real depois)
let ativos = [
    {
        id_interno: '1',
        id_humanizado: 'N1',
        nome: 'Notebook Dell',
        tipo: 'notebook',
        descricao: 'Intel i7, 16GB RAM',
        localizacao: 'Sala 301',
        status: 'ativo'
    },
    {
        id_interno: '2',
        id_humanizado: 'N2',
        nome: 'Notebook HP',
        tipo: 'notebook',
        descricao: 'Intel i5, 8GB RAM',
        localizacao: 'Sala 302',
        status: 'ativo'
    },
    {
        id_interno: '3',
        id_humanizado: 'D1',
        nome: 'Desktop Gamer',
        tipo: 'desktop',
        descricao: 'RTX 3060, 32GB RAM',
        localizacao: 'Sala 201',
        status: 'ativo'
    }
];

// Prefixos por tipo
const PREFIXOS = {
    'notebook': 'N',
    'desktop': 'D',
    'servidor': 'S',
    'outro': 'O'
};

// Função para gerar próximo ID humanizado
function gerarIdHumanizado(tipo) {
    const prefixo = PREFIXOS[tipo] || 'O';
    const numerosMesmoTipo = ativos
        .filter(a => a.tipo === tipo && a.id_humanizado.startsWith(prefixo))
        .map(a => {
            const num = parseInt(a.id_humanizado.replace(prefixo, ''), 10);
            return isNaN(num) ? 0 : num;
        });
    
    const maxNumero = numerosMesmoTipo.length > 0 ? Math.max(...numerosMesmoTipo) : 0;
    return `${prefixo}${maxNumero + 1}`;
}

// ROTAS

// GET /api/ativos - Listar todos os ativos
app.get('/api/ativos', (req, res) => {
    res.json({
        sucesso: true,
        dados: ativos,
        total: ativos.length
    });
});

// GET /api/ativos/:id - Obter ativo por ID
app.get('/api/ativos/:id', (req, res) => {
    const ativo = ativos.find(a => a.id_interno === req.params.id);
    
    if (!ativo) {
        return res.status(404).json({
            sucesso: false,
            erro: 'Ativo não encontrado'
        });
    }
    
    res.json({
        sucesso: true,
        dados: ativo
    });
});

// POST /api/ativos - Criar novo ativo
app.post('/api/ativos', (req, res) => {
    const { nome, tipo, descricao, localizacao } = req.body;
    
    if (!nome || !tipo) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Nome e tipo são obrigatórios'
        });
    }
    
    if (!PREFIXOS[tipo]) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Tipo inválido'
        });
    }
    
    const id_humanizado = gerarIdHumanizado(tipo);
    const novoAtivo = {
        id_interno: Date.now().toString(),
        id_humanizado,
        nome,
        tipo,
        descricao: descricao || '',
        localizacao: localizacao || '',
        status: 'ativo',
        data_criacao: new Date().toISOString()
    };
    
    ativos.push(novoAtivo);
    
    res.status(201).json({
        sucesso: true,
        mensagem: `Ativo criado com sucesso! ID: ${id_humanizado}`,
        dados: novoAtivo
    });
});

// PUT /api/ativos/:id - Atualizar ativo
app.put('/api/ativos/:id', (req, res) => {
    const ativo = ativos.find(a => a.id_interno === req.params.id);
    
    if (!ativo) {
        return res.status(404).json({
            sucesso: false,
            erro: 'Ativo não encontrado'
        });
    }
    
    const { nome, descricao, localizacao, status } = req.body;
    
    if (nome) ativo.nome = nome;
    if (descricao !== undefined) ativo.descricao = descricao;
    if (localizacao !== undefined) ativo.localizacao = localizacao;
    if (status) ativo.status = status;
    ativo.data_atualizacao = new Date().toISOString();
    
    res.json({
        sucesso: true,
        mensagem: 'Ativo atualizado com sucesso',
        dados: ativo
    });
});

// DELETE /api/ativos/:id - Deletar ativo
app.delete('/api/ativos/:id', (req, res) => {
    const index = ativos.findIndex(a => a.id_interno === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({
            sucesso: false,
            erro: 'Ativo não encontrado'
        });
    }
    
    const deletado = ativos.splice(index, 1)[0];
    
    res.json({
        sucesso: true,
        mensagem: `Ativo ${deletado.id_humanizado} deletado com sucesso`,
        dados: deletado
    });
});

// GET /api/stats - Obter estatísticas
app.get('/api/stats', (req, res) => {
    const stats = {
        total: ativos.length,
        ativo: ativos.filter(a => a.status === 'ativo').length,
        inativo: ativos.filter(a => a.status === 'inativo').length,
        por_tipo: {
            notebook: ativos.filter(a => a.tipo === 'notebook').length,
            desktop: ativos.filter(a => a.tipo === 'desktop').length,
            servidor: ativos.filter(a => a.tipo === 'servidor').length,
            outro: ativos.filter(a => a.tipo === 'outro').length
        }
    };
    
    res.json({
        sucesso: true,
        dados: stats
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de erro
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({
        sucesso: false,
        erro: 'Erro interno do servidor',
        detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 API disponível em http://localhost:${PORT}/api/ativos`);
    console.log(`\n🔑 Endpoints disponíveis:`);
    console.log(`   GET    /api/ativos`);
    console.log(`   GET    /api/ativos/:id`);
    console.log(`   POST   /api/ativos`);
    console.log(`   PUT    /api/ativos/:id`);
    console.log(`   DELETE /api/ativos/:id`);
    console.log(`   GET    /api/stats`);
    console.log(`   GET    /api/health`);
    console.log('\n');
});

module.exports = app;
