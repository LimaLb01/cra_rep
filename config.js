// Configuração do Sistema de Reconhecimento Facial
// ⚠️ IMPORTANTE: Em produção, use variáveis de ambiente ou backend

const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://cretuodvidcfqwgpnauz.supabase.co',
        // ⚠️ Em produção, use chave anônima com permissões mínimas
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZXR1b2R2aWRjZnF3Z3BuYXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MTA5MDIsImV4cCI6MjA3Mzk4NjkwMn0.6WxPs27ox3DAOC2HiW0QTQl4AXxNNlNsWjKlB0NdVQY',
        tables: {
            usuarios: 'usuarios_faciais',
            logs: 'logs_acesso',
            config: 'config_sistema',
            metricas: 'metricas_sistema'
        }
    },
    
    // CompreFace Configuration
    compreface: {
        // ⚠️ Em produção, use HTTPS e domínio real
        baseUrl: window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://seu-dominio.com',
        apiKey: 'c3e84a46-1a08-4913-8330-31818f0c0e06',
        endpoints: {
            faces: '/api/v1/faces',
            recognize: '/api/v1/recognition/recognize',
            applications: '/api/v1/applications'
        }
    },
    
    // System Configuration
    system: {
        detectionInterval: 150, // ms
        personDetectionTimeout: 5000, // ms
        faceDetectionTimeout: 10000, // ms
        inactivityTimeout: 30000, // ms
        maxRetries: 3
    },
    
    // UI Configuration
    ui: {
        showDebugInfo: false, // Em produção, sempre false
        enableSimulation: true, // Fallback quando CompreFace não disponível
        showLoadingStates: true
    }
};

// Exportar para uso global
window.CONFIG = CONFIG;
