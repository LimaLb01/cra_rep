/**
 * Sistema de Reconhecimento Facial - Arquivo Principal
 * Coordena todos os módulos e gerencia o fluxo da aplicação
 */

class FacialRecognitionSystem {
    constructor() {
        this.personDetector = null;
        this.faceDetector = null;
        this.supabaseManager = null;
        this.sonicWaveform = null;
        this.currentScreen = 'idle';
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('🚀 Inicializando Sistema de Reconhecimento Facial...');
            
            // Inicializar Supabase
            await this.initSupabase();
            
            // Inicializar detectores
            await this.initDetectors();
            
            // Inicializar interface
            this.initUI();
            
            // Inicializar animação de fundo
            this.initBackgroundAnimation();
            
            this.isInitialized = true;
            console.log('✅ Sistema inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
            this.showError('Erro ao inicializar sistema. Recarregue a página.');
        }
    }

    async initSupabase() {
        if (typeof window.supabase !== 'undefined') {
            window.supabaseClient = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
            window.supabaseManager = new SupabaseManager();
            console.log('✅ Supabase inicializado');
        } else {
            console.error('❌ Supabase não carregado');
            throw new Error('Supabase não disponível');
        }
    }

    async initDetectors() {
        // Inicializar detector de pessoas
        this.personDetector = new PersonDetector();
        const personDetectorLoaded = await this.personDetector.init();
        
        if (!personDetectorLoaded) {
            throw new Error('Falha ao carregar detector de pessoas');
        }

        // Configurar callbacks do detector de pessoas
        this.personDetector.onPersonDetected = () => this.onPersonDetected();
        this.personDetector.onStatusUpdate = (message) => this.updateStatus(message);

        // Inicializar detector facial
        this.faceDetector = new FaceDetector();
        await this.faceDetector.init();

        // Configurar callbacks do detector facial
        this.faceDetector.onRecognitionResult = (success, message) => this.onRecognitionResult(success, message);
        this.faceDetector.onStatusUpdate = (message, type) => this.updateStatus(message, type);
        this.faceDetector.onTitleUpdate = (message) => this.updateTitle(message);

        // Armazenar globalmente para acesso externo
        window.personDetector = this.personDetector;
        window.faceDetector = this.faceDetector;
    }

    initUI() {
        // Configurar botão de reiniciar
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.restartFacialRecognition());
        }

        // Configurar câmera oculta para detecção de pessoas
        this.setupHiddenCamera();
    }

    // Configurar câmera para reconhecimento facial
    setupFaceCamera() {
        const faceVideo = document.getElementById('faceVideo');
        if (faceVideo && !faceVideo.srcObject) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
                .then(stream => {
                    faceVideo.srcObject = stream;
                    return faceVideo.play();
                })
                .then(() => {
                    console.log('📹 Câmera configurada para reconhecimento facial');
                })
                .catch(error => {
                    console.error('❌ Erro ao acessar câmera facial:', error);
                });
        }
    }

    setupHiddenCamera() {
        const hiddenVideo = document.getElementById('hiddenVideo');
        if (hiddenVideo) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    hiddenVideo.srcObject = stream;
                    hiddenVideo.play();
                    console.log('📹 Câmera oculta configurada para detecção de pessoas');
                })
                .catch(error => {
                    console.error('❌ Erro ao acessar câmera:', error);
                });
        }
    }

    onPersonDetected() {
        console.log('👤 Pessoa detectada, iniciando reconhecimento facial...');
        this.switchToFaceDetection();
    }

    switchToFaceDetection() {
        // Esconder tela de descanso
        const idleScreen = document.getElementById('idleScreen');
        const scannerScreen = document.getElementById('scannerScreen');
        
        if (idleScreen) idleScreen.style.display = 'none';
        if (scannerScreen) scannerScreen.style.display = 'flex';
        
        this.currentScreen = 'scanner';
        
        // Parar detecção de pessoas
        this.personDetector.stopDetection();
        
        // Garantir câmera de rosto configurada
        this.setupFaceCamera();
        
        // Iniciar reconhecimento facial
        this.faceDetector.startDetection();
    }

    initBackgroundAnimation() {
        const canvas = document.getElementById('vortexCanvas');
        if (canvas) {
            this.sonicWaveform = new SonicWaveformCanvas(canvas);
            window.sonicWaveform = this.sonicWaveform;
            console.log('🎵 Animação de fundo inicializada');
        }
    }

    switchToIdle() {
        // Mostrar tela de descanso
        const idleScreen = document.getElementById('idleScreen');
        const scannerScreen = document.getElementById('scannerScreen');
        
        if (idleScreen) idleScreen.style.display = 'flex';
        if (scannerScreen) scannerScreen.style.display = 'none';
        
        this.currentScreen = 'idle';
        
        // Parar reconhecimento facial
        this.faceDetector.stopDetection();
        
        // Reiniciar detecção de pessoas
        this.personDetector.startDetection();
    }

    onRecognitionResult(success, message) {
        // Implementar lógica de resultado do reconhecimento
        console.log('🎯 Resultado do reconhecimento:', success, message);
    }

    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('detectionStatus');
        if (statusElement) {
            const icon = statusElement.querySelector('.material-symbols-outlined');
            const text = statusElement.querySelector('span:last-child');
            
            // Atualizar ícone baseado no tipo
            switch (type) {
                case 'success':
                    icon.textContent = 'check_circle';
                    statusElement.style.color = '#00FF80';
                    break;
                case 'error':
                    icon.textContent = 'error';
                    statusElement.style.color = '#FF4444';
                    break;
                case 'warning':
                    icon.textContent = 'warning';
                    statusElement.style.color = '#FFA500';
                    break;
                case 'processing':
                    icon.textContent = 'sync';
                    statusElement.style.color = '#FFA500';
                    break;
                default:
                    icon.textContent = 'search';
                    statusElement.style.color = '#00FFC0';
            }
            
            text.textContent = message;
        }
    }

    updateTitle(message) {
        const titleElement = document.querySelector('.scanner-title');
        if (titleElement) {
            titleElement.textContent = message;
            titleElement.style.color = '#00FF80';
            titleElement.style.fontSize = '2.5rem';
            titleElement.style.fontWeight = 'bold';
            titleElement.style.textShadow = '0 0 20px rgba(0, 255, 128, 0.8)';
        }
    }

    restartFacialRecognition() {
        console.log('🔄 Reiniciando sistema de reconhecimento facial...');
        
        if (this.faceDetector) {
            this.faceDetector.hideRestartButton();
            this.faceDetector.startDetection();
            
            // Resetar título
            this.updateTitle('Reconhecimento Facial');
        }
    }

    showError(message) {
        console.error('❌ Erro:', message);
        // Implementar exibição de erro na UI
        alert(message); // Temporário - implementar UI melhor
    }

    // Método para otimização de performance
    optimizeForPerformance() {
        if (this.personDetector) {
            this.personDetector.optimizeForPerformance();
        }
    }

    // Método para reset de performance
    resetPerformance() {
        if (this.personDetector) {
            this.personDetector.resetPerformance();
        }
    }
}

// Função global para reiniciar reconhecimento facial
function restartFacialRecognition() {
    if (window.facialRecognitionSystem) {
        window.facialRecognitionSystem.restartFacialRecognition();
    }
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', async function() {
    try {
        window.facialRecognitionSystem = new FacialRecognitionSystem();
        await window.facialRecognitionSystem.init();
        
        // Iniciar detecção de pessoas
        window.facialRecognitionSystem.personDetector.startDetection();
        
    } catch (error) {
        console.error('❌ Erro fatal na inicialização:', error);
    }
});

// Cleanup quando a página for fechada
window.addEventListener('beforeunload', function() {
    if (window.facialRecognitionSystem) {
        if (window.facialRecognitionSystem.personDetector) {
            window.facialRecognitionSystem.personDetector.stopDetection();
        }
        if (window.facialRecognitionSystem.faceDetector) {
            window.facialRecognitionSystem.faceDetector.stopDetection();
        }
    }
    
    if (window.sonicWaveform) {
        window.sonicWaveform.destroy();
    }
});
