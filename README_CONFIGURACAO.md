# 🎭 Sistema de Reconhecimento Facial - Guia de Configuração

## 📋 Pré-requisitos

### 1. Supabase
- ✅ Conta no Supabase criada
- ✅ Projeto configurado
- ✅ Chaves de API disponíveis

### 2. CompreFace (Opcional)
- Docker instalado
- CompreFace rodando na porta 8000

## 🚀 Configuração do Supabase

### Passo 1: Executar Schema SQL
1. Acesse o Supabase Dashboard
2. Vá para **SQL Editor**
3. Execute o arquivo `supabase_schema.sql`
4. Verifique se as tabelas foram criadas:
   - `usuarios_faciais`
   - `logs_acesso`
   - `config_sistema`
   - `metricas_sistema`

### Passo 2: Verificar Configurações
As configurações padrão serão inseridas automaticamente:
- CompreFace URL: `http://localhost:8000/api/v1`
- API Key: `9dafb0f7-bee3-4f05-84b0-9c12306e257d`
- Threshold: `0.6`
- Timeout: `30 segundos`

### Passo 3: Testar Conexão
O sistema testará automaticamente a conexão com o Supabase ao carregar.

## 🐳 Configuração do CompreFace (Opcional)

### Instalação via Docker
```bash
# Clonar repositório CompreFace
git clone https://github.com/exadel-inc/CompreFace.git
cd CompreFace

# Iniciar serviços
docker-compose up -d

# Verificar se está rodando
curl http://localhost:8000/api/v1/status
```

### Configuração da API Key
1. Acesse `http://localhost:8000`
2. Crie uma conta de administrador
3. Gere uma nova API Key
4. Atualize no arquivo `supabase_config.js`

## 📊 Estrutura do Banco de Dados

### Tabela `usuarios_faciais`
```sql
- id (UUID, PK)
- nome_completo (VARCHAR)
- email (VARCHAR, UNIQUE)
- matricula (VARCHAR, UNIQUE)
- empresa (VARCHAR)
- cargo (VARCHAR)
- face_id (VARCHAR, UNIQUE) -- ID do rosto no CompreFace
- face_embedding (TEXT) -- Embedding facial
- foto_perfil (TEXT) -- URL da foto
- ativo (BOOLEAN)
- data_cadastro (TIMESTAMP)
- ultimo_acesso (TIMESTAMP)
```

### Tabela `logs_acesso`
```sql
- id (UUID, PK)
- usuario_id (UUID, FK)
- tipo_acesso (VARCHAR) -- 'facial', 'manual', 'admin'
- status (VARCHAR) -- 'sucesso', 'falha', 'erro'
- confianca (DECIMAL) -- Nível de confiança
- ip_address (INET)
- user_agent (TEXT)
- observacoes (TEXT)
- created_at (TIMESTAMP)
```

## 🔧 Funcionalidades Implementadas

### ✅ Sistema de Reconhecimento Facial
- Detecção de rostos via CompreFace
- Modo simulado quando CompreFace não disponível
- Interface visual com feedback em tempo real
- Integração com Supabase para persistência

### ✅ Gerenciamento de Usuários
- Cadastro de usuários com dados faciais
- Busca por face_id ou matrícula
- Controle de acesso e permissões
- Histórico de acessos

### ✅ Sistema de Logs
- Registro automático de tentativas de acesso
- Métricas de performance
- Relatórios de uso
- Auditoria completa

### ✅ Configurações Flexíveis
- Configurações centralizadas no banco
- Thresholds ajustáveis
- Timeouts configuráveis
- Modo simulado para desenvolvimento

## 🎯 Como Usar

### 1. Acesso ao Sistema
1. Abra `index.html` no navegador
2. Aguarde a detecção de pessoa (YOLO)
3. Clique na tela para ativar reconhecimento facial
4. Posicione o rosto na área demarcada
5. Aguarde o reconhecimento

### 2. Modo Simulado
- Quando CompreFace não estiver disponível
- Simula detecção e reconhecimento
- Registra acessos no Supabase
- Útil para desenvolvimento e testes

### 3. Modo Real
- Requer CompreFace rodando
- Reconhecimento facial real
- Maior precisão e confiabilidade
- Ideal para produção

## 📈 Monitoramento

### Relatórios Disponíveis
- Acessos por usuário
- Taxa de sucesso
- Tempo de resposta
- Erros do sistema

### Métricas em Tempo Real
- Total de detecções
- Reconhecimentos bem-sucedidos
- Falhas de reconhecimento
- Performance do sistema

## 🔒 Segurança

### Políticas RLS
- Row Level Security habilitado
- Controle de acesso por usuário
- Logs de auditoria
- Dados sensíveis protegidos

### Boas Práticas
- API Keys em variáveis de ambiente
- HTTPS em produção
- Backup regular do banco
- Monitoramento de acessos

## 🐛 Troubleshooting

### Problemas Comuns

#### CompreFace não conecta
- Verifique se Docker está rodando
- Confirme se a porta 8000 está livre
- Teste: `curl http://localhost:8000/api/v1/status`

#### Supabase não conecta
- Verifique as credenciais
- Confirme se o projeto está ativo
- Teste a conexão no dashboard

#### Câmera não funciona
- Verifique permissões do navegador
- Teste em HTTPS
- Confirme se a câmera está disponível

### Logs de Debug
- Abra o Console do navegador (F12)
- Verifique mensagens de erro
- Monitore requisições de rede
- Analise logs no Supabase

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do console
2. Consulte a documentação do Supabase
3. Verifique a documentação do CompreFace
4. Analise os logs no banco de dados

---

**Sistema desenvolvido para RandonCorp - Hub de Inovação** 🚀
