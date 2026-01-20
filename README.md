# 📊 Inventário T.I. - IDs Humanizados

**Sistema de Gerenciamento de Ativos com IDs Humanizados (N1, D2, S3, etc)**

![Status](https://img.shields.io/badge/status-funcional-success?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D14-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 🚀 Começar Rápido

### Terminal 1: Backend
```bash
cd backend
npm install
npm start
# Rodando em http://localhost:3000
```

### Terminal 2 (ou browser): Frontend
```bash
# Opção 1: Abrir arquivo direto
open inventario.html  # Mac
start inventario.html # Windows

# Opção 2: Servidor local
python -m http.server 8000
# Acesse: http://localhost:8000/inventario.html
```

✅ **Pronto! Agora você tem:**
- ✅ 3 ativos pré-carregados
- ✅ IDs humanizados funcionando (N1, N2, D1)
- ✅ CRUD completo
- ✅ Filtros por tipo
- ✅ Estatísticas em tempo real

---

## 📁 Estrutura do Projeto

```
inventario_T.I/
├── backend/
│   ├── server.js          # Servidor Express
│   └── package.json       # Dependências
├── inventario.html        # Frontend standalone
├── docs/
│   └── HUMANIZED_IDS_IMPLEMENTATION.md
├── SETUP_COMPLETO.md      # Guia passo a passo
└── README.md              # Este arquivo
```

---

## 🎯 Funcionalidades

### ✨ IDs Humanizados Automáticos

| Tipo | Prefixo | Exemplo |
|------|---------|----------|
| 📱 Notebook | **N** | N1, N2, N3 |
| 🖥️ Desktop | **D** | D1, D2, D3 |
| 🗄️ Servidor | **S** | S1, S2, S3 |
| 📦 Outro | **O** | O1, O2, O3 |

### 📋 Operações CRUD

✅ **Criar** - Novo ativo com ID automático  
✅ **Ler** - Listar e filtrar ativos  
✅ **Atualizar** - Editar informações do ativo  
✅ **Deletar** - Remover ativo  

### 🎨 Interface

- 📊 Dashboard com estatísticas
- 🔍 Filtros por tipo de ativo
- 📈 Contadores em tempo real
- 🎯 Badges com cores por categoria
- ✅ Alertas visuais (sucesso/erro)
- 📱 Responsivo (mobile, tablet, desktop)

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Endpoints Disponíveis

#### GET /ativos
Listar todos os ativos
```bash
curl http://localhost:3000/api/ativos
```

#### GET /ativos/:id
Obtér ativo específico
```bash
curl http://localhost:3000/api/ativos/1
```

#### POST /ativos
Criar novo ativo
```bash
curl -X POST http://localhost:3000/api/ativos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Servidor novo",
    "tipo": "servidor",
    "descricao": "AMD Ryzen",
    "localizacao": "Data Center"
  }'
```

#### PUT /ativos/:id
Atualizar ativo
```bash
curl -X PUT http://localhost:3000/api/ativos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Novo nome",
    "status": "inativo"
  }'
```

#### DELETE /ativos/:id
Deletar ativo
```bash
curl -X DELETE http://localhost:3000/api/ativos/1
```

#### GET /stats
Obter estatísticas
```bash
curl http://localhost:3000/api/stats
```

#### GET /health
Verificar saúde do servidor
```bash
curl http://localhost:3000/api/health
```

---

## 💾 Estrutura de Dados

### Ativo (Asset)

```json
{
  "id_interno": "1",
  "id_humanizado": "N1",
  "nome": "Notebook Dell",
  "tipo": "notebook",
  "descricao": "Intel i7, 16GB RAM",
  "localizacao": "Sala 301",
  "status": "ativo",
  "data_criacao": "2026-01-20T20:59:00Z",
  "data_atualizacao": "2026-01-20T20:59:00Z"
}
```

### Tipos Válidos
- `notebook`
- `desktop`
- `servidor`
- `outro`

### Status Válidos
- `ativo`
- `inativo`

---

## 🛠️ Desenvolvimento

### Com Auto-reload

```bash
cd backend
npm run dev  # Usa nodemon
```

### Variáveis de Ambiente

```bash
# .env (opcional)
PORT=3000
NODE_ENV=development
```

---

## 🧪 Testes Manuais

### Teste 1: Criar Ativo
1. Preencha formulário com:
   - Nome: "Meu Servidor"
   - Tipo: "Servidor"
   - Descrição: "AMD Ryzen 9"
   - Localização: "Data Center"
2. Clique "✅ Criar Ativo"
3. ✅ Deve aparecer como "S1" na tabela

### Teste 2: Filtrar
1. Clique "📱 Notebooks" no sidebar
2. ✅ Tabela deve mostrar só N1 e N2

### Teste 3: Editar
1. Clique ✏️ em qualquer ativo
2. Mude nome e status
3. Clique "💾 Salvar"
4. ✅ Mudanças refletem na tabela

### Teste 4: Deletar
1. Clique 🗑️ em qualquer ativo
2. Confirme
3. ✅ Ativo desaparece

---

## 📚 Documentação

- 📖 [Setup Completo](./SETUP_COMPLETO.md) - Guia passo a passo
- 📖 [Implementação IDs](./docs/HUMANIZED_IDS_IMPLEMENTATION.md) - Detalhes técnicos
- 🔧 [Backend](./backend/server.js) - Código do servidor
- 🌐 [Frontend](./inventario.html) - HTML standalone

---

## 🚀 Próximas Melhorias

- [ ] Banco de dados (PostgreSQL)
- [ ] Autenticação/Login
- [ ] Permissões por usuário
- [ ] Exportar PDF/Excel
- [ ] Backup automático
- [ ] Deploy (Heroku/AWS)
- [ ] Testes automatizados
- [ ] Docker compose

---

## 📝 License

MIT © 2026 Arthur Lima Almeida Prado

---

## 🤝 Contribuições

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ em Cuiabá - MT**
