# 🚀 CompreFace - Configuração Completa

## ✅ **CompreFace Instalado com Sucesso!**

O CompreFace está rodando em `http://localhost:8000` e todos os containers estão funcionando!

## 🔧 **Configuração Necessária**

### **1. Acessar Interface Web**
- URL: `http://localhost:8000`
- A interface web já está aberta no seu navegador

### **2. Criar Aplicativo**
1. **Criar conta de administrador** (primeira vez)
2. **Criar um novo aplicativo**:
   - Nome: `Sistema de Recepção`
   - Descrição: `Detecção de rostos para sistema de crachá`
   - Modelo: `Face Detection` (padrão)

### **3. Obter API Key**
1. Após criar o aplicativo, vá em **"API Keys"**
2. **Copiar a chave da API** gerada
3. **Atualizar no código** `index.html`

### **4. Configurar URL da API**
A URL correta é: `http://localhost:8000/api/v1/detect`

## 🔧 **Atualização do Código**

### **Arquivo: index.html**
```javascript
const config = {
    apiUrl: 'http://localhost:8000/api/v1/detect', // URL correta
    apiKey: 'SUA-API-KEY-AQUI', // Chave obtida na interface
    subject: 'unknown', // Subject para detecção
    minConfidence: 0.7, // 70% de confiança mínima
    maxFaces: 5, // Máximo 5 faces
    enableLandmarks: true, // Ativar landmarks
    enableAgeGender: true, // Ativar idade/gênero
    enableEmotions: true, // Ativar emoções
    enableMaskDetection: true, // Ativar detecção de máscara
    realTime: true // Tempo real
};
```

## 🚀 **Funcionalidades Disponíveis**

### **Detecção de Rostos:**
- ✅ **Detecção de Rostos** - Alta precisão
- ✅ **Landmarks Faciais** - Pontos detalhados
- ✅ **Idade e Gênero** - Estimativas precisas
- ✅ **Detecção de Emoções** - 7 emoções básicas
- ✅ **Detecção de Máscaras** - COVID-19 safety
- ✅ **Múltiplas Faces** - Até 5 faces simultâneas

### **API Endpoints Disponíveis:**
- `POST /api/v1/detect` - Detecção de rostos
- `POST /api/v1/recognize` - Reconhecimento de rostos
- `POST /api/v1/verify` - Verificação de rostos
- `GET /api/v1/subjects` - Listar subjects
- `POST /api/v1/subjects` - Criar subject

## 📊 **Teste da API**

### **Comando de Teste:**
```bash
curl -X POST "http://localhost:8000/api/v1/detect" \
  -H "x-api-key: SUA-API-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "file": "base64-encoded-image",
    "detect_landmarks": true,
    "detect_age": true,
    "detect_gender": true,
    "detect_emotions": true,
    "detect_masks": true
  }'
```

## 🔧 **Troubleshooting**

### **Erro: "Model type does not exists"**
- **Solução**: Usar `/api/v1/detect` em vez de `/api/v1/faces`
- **Causa**: URL incorreta da API

### **Erro: "Missing header: x-api-key"**
- **Solução**: Criar aplicativo na interface web
- **Causa**: API key não configurada

### **Erro: "500 Internal Server Error"**
- **Solução**: Aguardar inicialização completa (2-3 minutos)
- **Causa**: Serviços ainda inicializando

## 🎯 **Próximos Passos**

1. **Acessar Interface Web**: `http://localhost:8000`
2. **Criar Aplicativo** com nome "Sistema de Recepção"
3. **Copiar API Key** gerada
4. **Atualizar código** com a API key
5. **Testar detecção** de rostos

## 📚 **Documentação da API**

- **Swagger UI**: `http://localhost:8000/api/v1/swagger-ui.html`
- **API Docs**: `http://localhost:8000/api/v1/v2/api-docs`
- **Health Check**: `http://localhost:8000/api/v1/health`

## 🚀 **Status dos Containers**

```
✅ compreface-ui (Interface Web) - Porta 8000
✅ compreface-api (API REST) - Porta 8080
✅ compreface-core (ML Engine) - Porta 3000
✅ compreface-admin (Admin) - Porta 8080
✅ compreface-postgres-db (Database) - Porta 5432
```

---

**O CompreFace está pronto para uso! Agora configure a API key e teste a detecção!** 🚀👤🤖✨
