// Configuração do Supabase para Sistema de Reconhecimento Facial
// Este arquivo contém as configurações e funções para integração com Supabase

const SUPABASE_CONFIG = (window.CONFIG && window.CONFIG.supabase) ? window.CONFIG.supabase : {
    url: 'https://cretuodvidcfqwgpnauz.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZXR1b2R2aWRjZnF3Z3BuYXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MTA5MDIsImV4cCI6MjA3Mzk4NjkwMn0.6WxPs27ox3DAOC2HiW0QTQl4AXxNNlNsWjKlB0NdVQY',
    tables: {
        usuarios: 'usuarios_faciais',
        logs: 'logs_acesso',
        config: 'config_sistema',
        metricas: 'metricas_sistema'
    }
};

// Classe para gerenciar dados do Supabase
        class SupabaseManager {
            constructor() {
                // Usar instância global se disponível, senão criar nova
                if (window.supabaseClient) {
                    this.supabase = window.supabaseClient;
                } else {
                    this.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
                }
            }

    // Buscar usuário por face_id
    async buscarUsuarioPorFace(faceId) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.usuarios)
                .select('*')
                .eq('face_id', faceId)
                .eq('ativo', true)
                .single();

            if (error) {
                console.error('Erro ao buscar usuário:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Erro na busca do usuário:', error);
            return null;
        }
    }

    // Buscar usuário por matrícula
    async buscarUsuarioPorMatricula(matricula) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.usuarios)
                .select('*')
                .eq('matricula', matricula)
                .eq('ativo', true)
                .single();

            if (error) {
                console.error('Erro ao buscar usuário por matrícula:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Erro na busca por matrícula:', error);
            return null;
        }
    }

    // Buscar usuário por nome (para reconhecimento facial)
    async buscarUsuarioPorNome(nome) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.usuarios)
                .select('*')
                .eq('nome_completo', nome)
                .eq('ativo', true)
                .limit(1);

            if (error) {
                console.error('Erro ao buscar usuário por nome:', error);
                return null;
            }

            // Retornar o primeiro resultado ou null se não houver
            return data && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.error('Erro na busca por nome:', error);
            return null;
        }
    }

    // Registrar acesso do usuário
    async registrarAcesso(usuarioId, tipoAcesso, status, confianca = null, observacoes = null) {
        try {
            const logData = {
                usuario_id: usuarioId,
                tipo_acesso: tipoAcesso,
                status: status,
                confianca: confianca,
                ip_address: await this.getClientIP(),
                user_agent: navigator.userAgent,
                observacoes: observacoes
            };

            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.logs)
                .insert([logData]);

            if (error) {
                console.error('Erro ao registrar acesso:', error);
                return false;
            }

            console.log('✅ Acesso registrado com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao registrar acesso:', error);
            return false;
        }
    }

    // Obter configurações do sistema
    async obterConfiguracao(chave) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.config)
                .select('valor, tipo')
                .eq('chave', chave)
                .single();

            if (error) {
                console.error('Erro ao obter configuração:', error);
                return null;
            }

            // Converter valor baseado no tipo
            switch (data.tipo) {
                case 'number':
                    return parseFloat(data.valor);
                case 'boolean':
                    return data.valor === 'true';
                case 'json':
                    return JSON.parse(data.valor);
                default:
                    return data.valor;
            }
        } catch (error) {
            console.error('Erro ao obter configuração:', error);
            return null;
        }
    }

    // Atualizar última data de acesso do usuário
    async atualizarUltimoAcesso(usuarioId) {
        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.usuarios)
                .update({ ultimo_acesso: new Date().toISOString() })
                .eq('id', usuarioId);

            if (error) {
                console.error('Erro ao atualizar último acesso:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erro ao atualizar último acesso:', error);
            return false;
        }
    }

    // Obter métricas do sistema
    async obterMetricas(data = null) {
        try {
            let query = this.supabase
                .from(SUPABASE_CONFIG.tables.metricas)
                .select('*');

            if (data) {
                query = query.eq('data_metrica', data);
            } else {
                // Últimos 30 dias
                const dataLimite = new Date();
                dataLimite.setDate(dataLimite.getDate() - 30);
                query = query.gte('data_metrica', dataLimite.toISOString().split('T')[0]);
            }

            const { data: metricas, error } = await query.order('data_metrica', { ascending: false });

            if (error) {
                console.error('Erro ao obter métricas:', error);
                return [];
            }

            return metricas;
        } catch (error) {
            console.error('Erro ao obter métricas:', error);
            return [];
        }
    }

    // Obter relatório de acessos
    async obterRelatorioAcessos() {
        try {
            const { data, error } = await this.supabase
                .from('relatorio_acessos')
                .select('*');

            if (error) {
                console.error('Erro ao obter relatório:', error);
                return [];
            }

            return data;
        } catch (error) {
            console.error('Erro ao obter relatório:', error);
            return [];
        }
    }

    // Obter IP do cliente (simulado)
    async getClientIP() {
        try {
            // Em produção, você pode usar um serviço como ipify.org
            return '127.0.0.1';
        } catch (error) {
            return 'unknown';
        }
    }

    // Cadastrar novo usuário
    async cadastrarUsuario(dadosUsuario) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.usuarios)
                .insert([dadosUsuario])
                .select()
                .single();

            if (error) {
                console.error('Erro ao cadastrar usuário:', error);
                return null;
            }

            console.log('✅ Usuário cadastrado com sucesso');
            return data;
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            return null;
        }
    }

    // Atualizar dados do usuário
    async atualizarUsuario(usuarioId, dadosAtualizacao) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.usuarios)
                .update(dadosAtualizacao)
                .eq('id', usuarioId)
                .select()
                .single();

            if (error) {
                console.error('Erro ao atualizar usuário:', error);
                return null;
            }

            console.log('✅ Usuário atualizado com sucesso');
            return data;
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return null;
        }
    }
}

// Exportar para uso global
window.SupabaseManager = SupabaseManager;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
