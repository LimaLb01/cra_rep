/**
 * Detector de Pessoas usando COCO-SSD
 * Responsável por detectar presença de pessoas na câmera
 */
class PersonDetector {
    constructor() {
        this.model = null;
        this.isDetecting = false;
        this.detectionCount = 0;
        this.requiredDetections = 2;
        this.detectionTimeout = null;
        this.onPersonDetected = null;
        this.onStatusUpdate = null;
        
        // Configurações de performance
        this.detectionInterval = 150; // ms
        this.optimizationEnabled = true;
        this.lastDetectionTime = 0;
    }

    async init() {
        try {
            console.log('Carregando COCO-SSD para detecção de pessoas...');
            this.model = await cocoSsd.load();
            console.log('COCO-SSD carregado com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao carregar COCO-SSD:', error);
            return false;
        }
    }

    startDetection() {
        if (!this.model) {
            console.error('Modelo não carregado');
            return;
        }

        this.isDetecting = true;
        this.detectionCount = 0;
        this.updateStatus('COCO-SSD ativo - Detectando pessoas...');
        this.detectLoop();
    }

    stopDetection() {
        this.isDetecting = false;
        if (this.detectionTimeout) {
            clearTimeout(this.detectionTimeout);
            this.detectionTimeout = null;
        }
        this.updateStatus('Detecção de pessoas parada');
    }

    async detectLoop() {
        if (!this.isDetecting) return;

        try {
            // Otimização de performance
            const now = Date.now();
            if (this.optimizationEnabled && now - this.lastDetectionTime < this.detectionInterval) {
                requestAnimationFrame(() => this.detectLoop());
                return;
            }
            this.lastDetectionTime = now;

            // Detectar pessoas
            const videoEl = document.getElementById('hiddenVideo');
            if (!videoEl) {
                requestAnimationFrame(() => this.detectLoop());
                return;
            }
            const predictions = await this.model.detect(videoEl);
            
            if (predictions && predictions.length > 0) {
                const personDetections = predictions.filter(prediction => 
                    prediction.class === 'person' && prediction.score > 0.5
                );

                if (personDetections.length > 0) {
                    this.handlePersonDetected(personDetections.length);
                } else {
                    this.resetDetection();
                }
            } else {
                this.resetDetection();
            }
        } catch (error) {
            console.error('Erro na detecção:', error);
        }

        // Continuar loop
        if (this.isDetecting) {
            requestAnimationFrame(() => this.detectLoop());
        }
    }

    handlePersonDetected(count) {
        this.detectionCount++;
        console.log(`Detectou ${count} pessoa(s)`);
        
        this.updateStatus(`Pessoa detectada! (${this.detectionCount}/${this.requiredDetections})`);

        if (this.detectionCount >= this.requiredDetections) {
            this.confirmPersonDetection();
        }
    }

    confirmPersonDetection() {
        this.updateStatus('Pessoa detectada! Aguardando 5 segundos...');
        
        // Aguardar 5 segundos para confirmar presença
        this.detectionTimeout = setTimeout(() => {
            if (this.isDetecting) {
                this.updateStatus('Redirecionando para tela do cracha...');
                this.onPersonDetected && this.onPersonDetected();
            }
        }, 5000);
    }

    resetDetection() {
        this.detectionCount = 0;
        if (this.detectionTimeout) {
            clearTimeout(this.detectionTimeout);
            this.detectionTimeout = null;
        }
        this.updateStatus('Detectando pessoas...');
    }

    updateStatus(message) {
        console.log(`Status: ${message}`);
        this.onStatusUpdate && this.onStatusUpdate(message);
    }

    // Otimização para dispositivos fracos
    optimizeForPerformance() {
        this.detectionInterval = 300; // Reduzir FPS
        this.optimizationEnabled = true;
        console.log('Otimização de performance ativada');
    }

    // Reset para performance normal
    resetPerformance() {
        this.detectionInterval = 150;
        this.optimizationEnabled = false;
        console.log('Performance normal restaurada');
    }
}

// Exportar para uso global
window.PersonDetector = PersonDetector;
