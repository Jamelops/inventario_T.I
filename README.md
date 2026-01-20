# 📊 Inventário T.I. - Sistema de IDs Humanizados

## ✨ Visão Geral

Sistema **production-ready** para gerenciar ativos de TI com IDs humanizados automáticos e legíveis.

### 🎯 Objetivo

Transformar UUIDs confusos em IDs amigáveis:

```
❌ ANTES: 1b56ce27-7aff-4ac7-a63e-60d94a68c263
✅ DEPOIS: N1, D5, S2
```

## 🚀 Stack Técnico

| Componente | Tecnologia |
|---|---|
| **Banco de Dados** | PostgreSQL (Supabase) |
| **Backend** | Node.js + Express |
| **Frontend** | HTML5 + CSS3 + JavaScript |
| **Autenticação** | JWT (Supabase) |

## 📁 Estrutura do Projeto

```
inventario_T.I/
├── backend/
│   └── routes/
│       └── ativos.js         # Endpoints CRUD
├── config/
│   └── supabase.js           # Configuração Supabase
├── frontend/
│   └── index.html            # Interface web
├── db/
│   └── scripts.sql           # Scripts SQL
├── docs/
│   └── ID_Sistema_Implementacao.md  # Documentação técnica
└── README.md
```

## 🔧 Instalação

### Pré-requisitos
- Node.js 16+
- Supabase account
- Git

### Passo 1: Clonar repositório

```bash
git clone https://github.com/Jamelops/inventario_T.I.git
cd inventario_T.I
```

### Passo 2: Configurar Banco de Dados

1. Criar projeto no Supabase
2. Executar SQL em `db/scripts.sql`
3. Copiar URL e chave pública

### Passo 3: Configurar Backend

```bash
cd backend
npm install
```

Criar `.env`:
```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-publica
PORT=3000
```

Iniciar:
```bash
node server.js
```

### Passo 4: Abrir Frontend

```bash
open frontend/index.html
```

Ou:
```bash
http://localhost:3000
```

## 📊 IDs Humanizados

| Tipo | Prefixo | Exemplos |
|---|---|---|
| Notebook | N | N1, N2, N3... |
| Desktop | D | D1, D2, D3... |
| Servidor | S | S1, S2, S3... |
| Outro | O | O1, O2, O3... |

## 🎮 Como Usar

### Criar Ativo
1. Preencha o formulário "Novo Ativo"
2. Clique em "✅ Criar Ativo"
3. ID humanizado é gerado automaticamente

### Editar Ativo
1. Clique no ✏️ na linha do ativo
2. Modifique os dados
3. Clique em "💾 Salvar"

### Deletar Ativo
1. Clique no 🗑️ na linha do ativo
2. Confirme a exclusão

### Filtrar
1. Use a barra lateral para filtrar por tipo
2. Veja estatísticas em tempo real

## 🔗 API Endpoints

### GET /api/ativos
Listar todos os ativos

```bash
curl http://localhost:3000/api/ativos
```

### POST /api/ativos
Criar novo ativo

```bash
curl -X POST http://localhost:3000/api/ativos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Notebook Dell",
    "tipo": "notebook",
    "descricao": "Intel i7, 16GB",
    "localizacao": "Sala 301"
  }'
```

### PUT /api/ativos/:id
Atualizar ativo

```bash
curl -X PUT http://localhost:3000/api/ativos/uuid-aqui \
  -H "Content-Type: application/json" \
  -d '{"nome": "Novo Nome"}'
```

### DELETE /api/ativos/:id
Deletar ativo

```bash
curl -X DELETE http://localhost:3000/api/ativos/uuid-aqui
```

## 📈 Recursos

- ✅ CRUD completo
- ✅ Filtros por tipo
- ✅ Estatísticas em tempo real
- ✅ IDs humanizados automáticos
- ✅ Design responsivo
- ✅ Alertas de sucesso/erro
- ✅ Interface intuitiva
- ✅ Performance otimizada

## 🔒 Segurança

- ✅ UUIDs como chave primária
- ✅ Validação no backend
- ✅ Proteção contra SQL injection
- ✅ CORS configurado
- ✅ Suporte a JWT (Supabase)

## 🐛 Troubleshooting

### Erro de conexão
- [ ] Verificar se backend está rodando
- [ ] Verificar variáveis de ambiente
- [ ] Verificar console do navegador

### IDs não aparecem
- [ ] Verificar se trigger PostgreSQL está ativo
- [ ] Verificar logs do backend
- [ ] Executar testes SQL

## 📚 Documentação

Ver `docs/ID_Sistema_Implementacao.md` para documentação técnica completa.

## 👨‍💻 Desenvolvedor

**Arthur Lima Almeida Prado**
- 🎓 Análise e Desenvolvimento de Sistemas - UNIC
- 📍 Cuiabá, MT - Brasil
- 🔗 GitHub: [@Jamelops](https://github.com/Jamelops)

## 📄 Licença

MIT License - Use livremente!

## ⭐ Contribuições

Contribuições são bem-vindas! Abra uma issue ou pull request.

---

**Status**: ✅ Production Ready  
**Versão**: 1.0.0  
**Data**: 20/01/2026