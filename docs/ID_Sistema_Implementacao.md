# 📚 Documentação Completa - Sistema de IDs Humanizados

## 🎯 Visão Geral

Sistema production-ready para gerenciar ativos de TI com IDs humanizados automáticos.

### IDs Humanizados
- **Notebooks**: N1, N2, N3...
- **Desktops**: D1, D2, D3...
- **Servidores**: S1, S2, S3...
- **Outros**: O1, O2, O3...

## 🏗️ Arquitetura

### Banco de Dados (PostgreSQL/Supabase)
```sql
-- Tabela: ativos
id (UUID) - Chave primária
codigo_humanizado (VARCHAR) - N1, D1, S1...
tipo (VARCHAR) - notebook, desktop, servidor, outro
nome (VARCHAR) - Nome do ativo
descricao (TEXT) - Descrição
localizacao (VARCHAR) - Localização física
status (VARCHAR) - ativo, inativo
criado_em (TIMESTAMP)
atualizado_em (TIMESTAMP)

-- Tabela: sequencias_humanas
tipo_ativo (VARCHAR) - Tipo do ativo
proximo_numero (INTEGER) - Próximo número a usar
prefixo (VARCHAR) - Prefixo (N, D, S, O)
descricao (VARCHAR)
atualizado_em (TIMESTAMP)
```

### Backend (Node.js + Express)
```
GET  /api/ativos       - Listar todos os ativos
POST /api/ativos       - Criar novo ativo
PUT  /api/ativos/:id   - Atualizar ativo
DEL  /api/ativos/:id   - Deletar ativo
```

### Frontend
- HTML5 + CSS3 + JavaScript
- Interface responsiva
- CRUD completo
- Filtros e estatísticas

## 🚀 Como Usar

### 1. Configurar Banco de Dados

Executar os scripts SQL em `db/scripts.sql`

### 2. Configurar Backend

```bash
npm install express @supabase/supabase-js
```

Variáveis de ambiente:
```
SUPABASE_URL=seu_url
SUPABASE_KEY=sua_chave
```

### 3. Iniciar Backend

```bash
node server.js
```

### 4. Abrir Frontend

```bash
open frontend/index.html
```

## 📋 Operações CRUD

### Criar Ativo
```javascript
POST /api/ativos
{
  "nome": "Notebook Dell",
  "tipo": "notebook",
  "descricao": "Intel i7, 16GB RAM",
  "localizacao": "Sala 301"
}
```

### Listar Ativos
```javascript
GET /api/ativos
```

### Atualizar Ativo
```javascript
PUT /api/ativos/uuid-aqui
{
  "nome": "Novo Nome",
  "status": "inativo"
}
```

### Deletar Ativo
```javascript
DELETE /api/ativos/uuid-aqui
```

## 🔒 Segurança

- ✅ UUIDs como chave primária (não sequencial)
- ✅ IDs humanizados apenas para apresentação
- ✅ Validação no backend
- ✅ Proteção contra SQL injection
- ✅ CORS habilitado para desenvolvimento

## 📊 Exemplo de Fluxo

1. Usuário preenche formulário (nome: "Notebook Dell", tipo: "notebook")
2. Frontend envia POST para backend
3. Backend insere na tabela `ativos` (sem código)
4. Trigger PostgreSQL dispara:
   - Obtém próximo número de `sequencias_humanas` (ex: 5)
   - Incrementa para 6
   - Define `codigo_humanizado = 'N5'`
5. Backend retorna resposta com ID humanizado
6. Frontend exibe sucesso e atualiza tabela

## 🧪 Testes

```bash
# Testar GET
curl http://localhost:3000/api/ativos

# Testar POST
curl -X POST http://localhost:3000/api/ativos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Notebook","tipo":"notebook"}'
```

## ⚠️ Troubleshooting

### Erro de conexão ao banco
- Verificar variáveis de ambiente
- Verificar URL e chave do Supabase
- Testar conexão manualmente

### IDs humanizados não aparecem
- Verificar se trigger está ativo no PostgreSQL
- Verificar logs do backend
- Executar testes SQL

### Frontend não conecta ao backend
- Verificar se backend está rodando em :3000
- Verificar CORS habilitado
- Verificar console do navegador para erros

## 📝 Próximos Passos

- [ ] Adicionar autenticação JWT
- [ ] Implementar auditoria completa
- [ ] Adicionar busca avançada
- [ ] Gerar relatórios em PDF
- [ ] Mobile app
- [ ] Integração com Active Directory

---

**Status**: ✅ Production Ready  
**Última atualização**: 20/01/2026  
**Versão**: 1.0.0