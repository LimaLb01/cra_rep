/**
 * Detector de Reconhecimento Facial usando CompreFace
 * Responsável por reconhecer rostos e identificar usuários
 */
class FaceDetector {
    constructor() {
        this.baseUrl = CONFIG.compreface.baseUrl;
        this.apiKey = CONFIG.compreface.apiKey;
        this.isDetecting = false;
        this.useSimulatedMode = false;
        this.subjectId = null;
        this.onRecognitionResult = null;
        this.onStatusUpdate = null;
        this.onTitleUpdate = null;
    }

    async init() {
        console.log('🎭 Inicializando sistema de reconhecimento facial...');
        
        const isAvailable = await this.checkCompreFaceStatus();
        
        if (isAvailable) {
            console.log('✅ Sistema de reconhecimento facial inicializado');
            this.useSimulatedMode = false;
        } else {
            console.log('⚠️ CompreFace não disponível, usando modo simulado');
            this.useSimulatedMode = true;
            this.showSimulationWarning();
        }
        
        return true;
    }

    async checkCompreFaceStatus() {
        try {
            const controller = new AbortController();
            const timeoutMs = (CONFIG.system && CONFIG.system.faceDetectionTimeout) ? CONFIG.system.faceDetectionTimeout : 5000;
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(`${this.baseUrl}${CONFIG.compreface.endpoints.faces}`, {
                method: 'GET',
                headers: {
                    'x-api-key': this.apiKey
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                console.log('✅ CompreFace está online e configurado');
                return true;
            } else if (response.status === 400) {
                console.log('✅ CompreFace está online (sem faces cadastradas)');
                return true;
            } else {
                throw new Error(`CompreFace não disponível: ${response.status}`);
            }
        } catch (error) {
            console.warn('⚠️ CompreFace não está disponível:', error.message);
            return false;
        }
    }

    async performRealDetection() {
        try {
            console.log('🔍 Iniciando detecção real com CompreFace...');
            
            // Capturar frame da câmera
            const video = document.getElementById('faceVideo');
            if (!video) {
                console.error('Vídeo não encontrado');
                this.simulateFaceDetection();
                return;
            }

            // Garantir que o vídeo esteja pronto
            if (video.readyState < 2 || !video.videoWidth) {
                await new Promise(resolve => {
                    const onReady = () => { video.removeEventListener('loadeddata', onReady); resolve(); };
                    video.addEventListener('loadeddata', onReady);
                });
            }

            // Obter frame como Blob
            const blob = await this.getFrameBlob(video);

            // Enviar para CompreFace
            const formData = new FormData();
            formData.append('file', blob, 'face.jpg');

            const controller = new AbortController();
            const timeoutMs = (CONFIG.system && CONFIG.system.faceDetectionTimeout) ? CONFIG.system.faceDetectionTimeout : 10000;
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(`${this.baseUrl}${CONFIG.compreface.endpoints.recognize}`, {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey
                },
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const result = await response.json();
                console.log('🎯 Resultado do CompreFace:', result);
                this.processRecognitionResult(result);
            } else {
                console.error('Erro no reconhecimento:', response.status);
                if (CONFIG.ui && CONFIG.ui.enableSimulation) {
                    this.simulateFaceDetection();
                } else {
                    this.updateStatus('CompreFace indisponível e simulação desativada', 'error');
                }
            }

        } catch (error) {
            console.error('Erro na detecção real:', error);
            if (CONFIG.ui && CONFIG.ui.enableSimulation) {
                this.simulateFaceDetection();
            } else {
                this.updateStatus('CompreFace indisponível e simulação desativada', 'error');
            }
        }
    }

    async getFrameBlob(video) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const blob = await fetch(dataUrl).then(r => r.blob());
        return blob;
    }

    showSimulationWarning() {
        this.updateStatus('⚠️ Modo simulado ativo - CompreFace não disponível', 'warning');
    }

    startDetection() {
        this.isDetecting = true;
        this.updateStatus('Iniciando detecção facial...', 'info');
        
        if (this.useSimulatedMode) {
            this.simulateFaceDetection();
        } else {
            this.performRealDetection();
        }
    }

    stopDetection() {
        this.isDetecting = false;
        this.updateStatus('Detecção facial parada', 'info');
    }

    simulateFaceDetection() {
        const randomDelay = Math.random() * 3000 + 2000; // 2-5 segundos
        
        setTimeout(async () => {
            if (this.isDetecting) {
                console.log('🎭 Simulando detecção de rosto...');
                
                // Usar o usuário real "Lucas Brasil Lima" para simulação
                const usuarioSimulado = { 
                    nome_completo: 'Lucas Brasil Lima', 
                    matricula: '55942', 
                    empresa: 'Conexo', 
                    cargo: 'Assistente Administrativo' 
                };
                this.subjectId = usuarioSimulado.nome_completo;
                
                // Simular resultado de reconhecimento
                this.processRecognitionResult({
                    result: [{
                        subjects: [{
                            subject: usuarioSimulado.nome_completo,
                            similarity: 0.85
                        }]
                    }]
                });
            }
        }, randomDelay);
    }

    processRecognitionResult(result) {
        if (result.result && result.result.length > 0) {
            const recognition = result.result[0];
            if (recognition.subjects && recognition.subjects.length > 0) {
                const subject = recognition.subjects[0];
                console.log('🎯 Resultado do reconhecimento:', result);
                console.log(`👤 Usuário reconhecido: ${subject.subject} (similaridade: ${subject.similarity})`);
                
                this.subjectId = subject.subject;
                this.handleRecognitionResult(true, 'Reconhecimento bem-sucedido');
            } else {
                this.handleRecognitionResult(false, 'Nenhum rosto reconhecido');
            }
        } else {
            this.handleRecognitionResult(false, 'Nenhum rosto detectado');
        }
    }

    async handleRecognitionResult(success, message) {
        // Parar detecção imediatamente
        this.stopDetection();
        
        if (success) {
            console.log('✅ Reconhecimento bem-sucedido!');
            this.updateStatus('Verificando usuário...', 'processing');
            
            // Buscar dados do usuário no Supabase pelo nome
            if (this.subjectId && window.supabaseManager) {
                try {
                    const usuario = await window.supabaseManager.buscarUsuarioPorNome(this.subjectId);
                    if (usuario) {
                        console.log('👤 Usuário encontrado:', usuario);
                        
                        // Registrar acesso no Supabase
                        await this.registrarAcessoUsuario(usuario, 'facial', 'sucesso', 0.9);
                        
                        // Atualizar título da tela com nome do usuário
                        this.updateTitle(`Bem-vindo, ${usuario.nome_completo}!`);
                        
                        // Redirecionar após 3 segundos
                        setTimeout(() => {
                            this.redirectToWelcome(usuario);
                        }, 3000);
                    } else {
                        console.log('⚠️ Usuário não encontrado no banco de dados');
                        this.updateStatus('Usuário não cadastrado no sistema', 'error');
                        this.showRestartButton();
                    }
                } catch (error) {
                    console.error('Erro ao buscar usuário:', error);
                    this.updateStatus('Erro ao verificar usuário', 'error');
                }
            } else {
                setTimeout(() => {
                    this.redirectToWelcome();
                }, 2000);
            }
        } else {
            console.log('❌ Reconhecimento falhou');
            this.updateStatus('Acesso negado. Tente novamente.', 'error');
            this.showRestartButton();
        }
    }

    async registrarAcessoUsuario(usuario, tipoAcesso, status, confianca) {
        try {
            await window.supabaseManager.registrarAcesso(
                usuario.id,
                tipoAcesso,
                status,
                confianca,
                `Reconhecimento facial - ${this.useSimulatedMode ? 'Modo simulado' : 'CompreFace'}`
            );
            console.log('✅ Acesso registrado no Supabase');
        } catch (error) {
            console.error('Erro ao registrar acesso:', error);
        }
    }

    updateStatus(message, type = 'info') {
        this.onStatusUpdate && this.onStatusUpdate(message, type);
    }

    updateTitle(message) {
        this.onTitleUpdate && this.onTitleUpdate(message);
    }

    showRestartButton() {
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.classList.add('visible');
        }
    }

    hideRestartButton() {
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.classList.remove('visible');
        }
    }

    redirectToWelcome(usuario = null) {
        console.log('🚀 Redirecionando para tela de boas-vindas...');
        
        if (usuario) {
            console.log(`👋 Bem-vindo, ${usuario.nome_completo}!`);
            console.log(`📋 Matrícula: ${usuario.matricula}`);
            console.log(`🏢 Empresa: ${usuario.empresa}`);
            console.log(`💼 Cargo: ${usuario.cargo}`);
        }
        
        // Implementar redirecionamento real aqui
        setTimeout(() => {
            this.resetToIdle();
        }, 3000);
    }

    resetToIdle() {
        // Voltar para tela de descanso
        this.hideRestartButton();
        this.updateTitle('Reconhecimento Facial');
        this.updateStatus('Detectando rosto...', 'info');
        
        // Reiniciar detecção de pessoas
        if (window.personDetector) {
            window.personDetector.startDetection();
        }
    }
}

// Exportar para uso global
window.FaceDetector = FaceDetector;
