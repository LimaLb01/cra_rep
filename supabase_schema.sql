-- Schema para Sistema de Reconhecimento Facial
-- Execute este SQL no Supabase SQL Editor

-- 1. Tabela de usuários com dados faciais
CREATE TABLE IF NOT EXISTS usuarios_faciais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    matricula VARCHAR(50) UNIQUE,
    empresa VARCHAR(255),
    cargo VARCHAR(255),
    face_id VARCHAR(255) UNIQUE, -- ID do rosto no CompreFace
    face_embedding TEXT, -- Embedding facial (opcional)
    foto_perfil TEXT, -- URL da foto de perfil
    ativo BOOLEAN DEFAULT true,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de logs de acesso
CREATE TABLE IF NOT EXISTS logs_acesso (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios_faciais(id),
    tipo_acesso VARCHAR(50) NOT NULL, -- 'facial', 'manual', 'admin'
    status VARCHAR(50) NOT NULL, -- 'sucesso', 'falha', 'erro'
    confianca DECIMAL(5,4), -- Nível de confiança do reconhecimento
    ip_address INET,
    user_agent TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS config_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de métricas de performance
CREATE TABLE IF NOT EXISTS metricas_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data_metrica DATE NOT NULL,
    total_deteccoes INTEGER DEFAULT 0,
    total_reconhecimentos INTEGER DEFAULT 0,
    taxa_sucesso DECIMAL(5,4) DEFAULT 0,
    tempo_medio_resposta DECIMAL(8,3), -- em segundos
    erros_sistema INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_faciais_face_id ON usuarios_faciais(face_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_faciais_matricula ON usuarios_faciais(matricula);
CREATE INDEX IF NOT EXISTS idx_usuarios_faciais_ativo ON usuarios_faciais(ativo);
CREATE INDEX IF NOT EXISTS idx_logs_acesso_usuario ON logs_acesso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_acesso_data ON logs_acesso(created_at);
CREATE INDEX IF NOT EXISTS idx_metricas_data ON metricas_sistema(data_metrica);

-- RLS (Row Level Security) - Políticas de segurança
ALTER TABLE usuarios_faciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme necessário)
CREATE POLICY "Permitir leitura para usuários autenticados" ON usuarios_faciais
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de logs" ON logs_acesso
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura de logs" ON logs_acesso
    FOR SELECT USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_faciais_updated_at 
    BEFORE UPDATE ON usuarios_faciais 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_sistema_updated_at 
    BEFORE UPDATE ON config_sistema 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para inserir usuário facial (contorna RLS)
CREATE OR REPLACE FUNCTION public.inserir_usuario_facial(
    p_nome_completo text,
    p_matricula text,
    p_empresa text,
    p_cargo text,
    p_face_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    novo_usuario_id uuid;
    resultado json;
BEGIN
    -- Inserir usuário na tabela
    INSERT INTO public.usuarios_faciais (
        nome_completo,
        matricula,
        empresa,
        cargo,
        face_id,
        ativo,
        created_at
    ) VALUES (
        p_nome_completo,
        p_matricula,
        p_empresa,
        p_cargo,
        p_face_id,
        true,
        now()
    ) RETURNING id INTO novo_usuario_id;
    
    -- Retornar resultado
    resultado := json_build_object(
        'id', novo_usuario_id,
        'nome_completo', p_nome_completo,
        'matricula', p_matricula,
        'empresa', p_empresa,
        'cargo', p_cargo,
        'face_id', p_face_id,
        'status', 'sucesso'
    );
    
    RETURN resultado;
END;
$$;

-- Inserir configurações padrão do sistema
INSERT INTO config_sistema (chave, valor, descricao, tipo) VALUES
('compreface_url', 'http://localhost:8000/api/v1', 'URL base do CompreFace', 'string'),
('compreface_api_key', '9dafb0f7-bee3-4f05-84b0-9c12306e257d', 'Chave API do CompreFace', 'string'),
('threshold_reconhecimento', '0.6', 'Limiar mínimo para reconhecimento facial', 'number'),
('timeout_deteccao', '30', 'Timeout para detecção facial em segundos', 'number'),
('max_tentativas', '3', 'Número máximo de tentativas de reconhecimento', 'number'),
('modo_simulado', 'false', 'Ativar modo simulado quando CompreFace não disponível', 'boolean')
ON CONFLICT (chave) DO NOTHING;

-- Inserir usuário de teste
INSERT INTO usuarios_faciais (nome_completo, email, matricula, empresa, cargo, face_id) VALUES
('João Silva', 'joao.silva@empresa.com', '12345', 'RandonCorp', 'Desenvolvedor', 'test_face_001'),
('Maria Santos', 'maria.santos@empresa.com', '67890', 'RandonCorp', 'Analista', 'test_face_002'),
('Pedro Oliveira', 'pedro.oliveira@empresa.com', '11111', 'RandonCorp', 'Gerente', 'test_face_003')
ON CONFLICT (matricula) DO NOTHING;

-- View para relatórios de acesso
CREATE OR REPLACE VIEW relatorio_acessos AS
SELECT 
    u.nome_completo,
    u.matricula,
    u.empresa,
    COUNT(l.id) as total_acessos,
    COUNT(CASE WHEN l.status = 'sucesso' THEN 1 END) as acessos_sucesso,
    COUNT(CASE WHEN l.status = 'falha' THEN 1 END) as acessos_falha,
    MAX(l.created_at) as ultimo_acesso,
    ROUND(
        COUNT(CASE WHEN l.status = 'sucesso' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(l.id), 0) * 100, 2
    ) as taxa_sucesso_percentual
FROM usuarios_faciais u
LEFT JOIN logs_acesso l ON u.id = l.usuario_id
WHERE u.ativo = true
GROUP BY u.id, u.nome_completo, u.matricula, u.empresa
ORDER BY total_acessos DESC;

-- Função para registrar acesso
CREATE OR REPLACE FUNCTION registrar_acesso(
    p_usuario_id UUID,
    p_tipo_acesso VARCHAR(50),
    p_status VARCHAR(50),
    p_confianca DECIMAL(5,4) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_observacoes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO logs_acesso (
        usuario_id, tipo_acesso, status, confianca, 
        ip_address, user_agent, observacoes
    ) VALUES (
        p_usuario_id, p_tipo_acesso, p_status, p_confianca,
        p_ip_address, p_user_agent, p_observacoes
    ) RETURNING id INTO log_id;
    
    -- Atualizar último acesso do usuário
    UPDATE usuarios_faciais 
    SET ultimo_acesso = NOW() 
    WHERE id = p_usuario_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar usuário por face_id
CREATE OR REPLACE FUNCTION buscar_usuario_por_face(face_id_param VARCHAR(255))
RETURNS TABLE (
    id UUID,
    nome_completo VARCHAR(255),
    email VARCHAR(255),
    matricula VARCHAR(255),
    empresa VARCHAR(255),
    cargo VARCHAR(255),
    ativo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id, u.nome_completo, u.email, u.matricula, 
        u.empresa, u.cargo, u.ativo
    FROM usuarios_faciais u
    WHERE u.face_id = face_id_param 
    AND u.ativo = true;
END;
$$ LANGUAGE plpgsql;
