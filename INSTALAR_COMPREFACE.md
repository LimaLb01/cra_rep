# 🐳 Como Instalar o CompreFace

## 📋 Pré-requisitos

### 1. Docker e Docker Compose
```bash
# Verificar se Docker está instalado
docker --version
docker-compose --version
```

### 2. Portas Disponíveis
- **8000** - CompreFace API
- **8001** - CompreFace Admin
- **5432** - PostgreSQL (opcional)

## 🚀 Instalação Rápida

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/exadel-inc/CompreFace.git
cd CompreFace
```

### Passo 2: Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env
nano .env
```

### Passo 3: Configurações Recomendadas
```env
# .env
POSTGRES_PASSWORD=compreface
POSTGRES_USER=compreface
POSTGRES_DB=compreface
POSTGRES_PORT=5432
POSTGRES_HOST=compreface-postgres-db

# CompreFace
ADMIN_JAVA_OPTS=-Xmx1g
API_JAVA_OPTS=-Xmx1g
UI_JAVA_OPTS=-Xmx1g

# Portas
API_PORT=8000
ADMIN_PORT=8001
```

### Passo 4: Iniciar o CompreFace
```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar se está rodando
docker-compose ps
```

### Passo 5: Verificar Instalação
```bash
# Testar API
curl http://localhost:8000/api/v1/status

# Acessar interface web
# http://localhost:8001
```

## 🔧 Configuração da API Key

### Passo 1: Acessar Interface Admin
1. Abra `http://localhost:8001`
2. Crie uma conta de administrador
3. Faça login

### Passo 2: Criar Aplicação
1. Vá para "Applications"
2. Clique em "Add Application"
3. Nome: `Sistema RandonCorp`
4. Copie a **API Key** gerada

### Passo 3: Atualizar Código
Substitua a API Key no código:
```javascript
this.apiKey = 'SUA_NOVA_API_KEY_AQUI';
```

## 🧪 Testando a Instalação

### Teste 1: Status da API
```bash
curl -X GET "http://localhost:8000/api/v1/status" \
  -H "x-api-key: SUA_API_KEY"
```

### Teste 2: Detecção de Faces
```bash
curl -X POST "http://localhost:8000/api/v1/faces/detect" \
  -H "x-api-key: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"file": "base64_encoded_image"}'
```

### Teste 3: Cadastrar Usuário
```bash
curl -X POST "http://localhost:8000/api/v1/faces" \
  -H "x-api-key: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"file": "base64_encoded_image", "subject": "test_user_001"}'
```

## 🔍 Troubleshooting

### Problema: Porta 8000 já está em uso
```bash
# Verificar o que está usando a porta
netstat -tulpn | grep :8000

# Parar o serviço
sudo systemctl stop nome_do_servico

# Ou usar outra porta
# Editar docker-compose.yml
```

### Problema: Docker não inicia
```bash
# Verificar logs
docker-compose logs

# Reiniciar Docker
sudo systemctl restart docker

# Limpar containers
docker-compose down
docker system prune -a
```

### Problema: Erro de permissão
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar sessão
logout
```

### Problema: Memória insuficiente
```bash
# Verificar memória disponível
free -h

# Ajustar limites no .env
API_JAVA_OPTS=-Xmx512m
ADMIN_JAVA_OPTS=-Xmx512m
UI_JAVA_OPTS=-Xmx512m
```

## 📊 Monitoramento

### Verificar Status dos Serviços
```bash
# Status dos containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Uso de recursos
docker stats
```

### Acessar Logs
```bash
# Logs da API
docker-compose logs compreface-api

# Logs do Admin
docker-compose logs compreface-admin

# Logs do UI
docker-compose logs compreface-ui
```

## 🔄 Atualização

### Atualizar CompreFace
```bash
# Parar serviços
docker-compose down

# Atualizar código
git pull origin master

# Reconstruir e iniciar
docker-compose up -d --build
```

## 🗑️ Desinstalação

### Remover CompreFace
```bash
# Parar e remover containers
docker-compose down

# Remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Remover imagens
docker rmi $(docker images | grep compreface | awk '{print $3}')
```

## 📚 Documentação Oficial

- **GitHub**: https://github.com/exadel-inc/CompreFace
- **Documentação**: https://github.com/exadel-inc/CompreFace/wiki
- **API Reference**: http://localhost:8000/api/v1/docs

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs: `docker-compose logs`
2. Consulte a documentação oficial
3. Verifique se todas as portas estão livres
4. Confirme se o Docker está funcionando

---

**Após instalar o CompreFace, atualize a API Key no código e teste o sistema!** 🚀
