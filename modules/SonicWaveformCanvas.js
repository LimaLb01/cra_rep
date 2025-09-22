/**
 * Animação de Ondas Sonoras para Fundo
 * Responsável pela animação visual de fundo
 */
class SonicWaveformCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationId = null;
        this.isListening = false;
        this.voiceIntensity = 0;
        this.voiceFrequency = 0;
        this.voiceAmplitude = 0;
        
        this.mouse = { x: 0, y: 0 };
        this.time = 0;
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.startAnimation();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    startAnimation() {
        this.draw();
    }

    draw() {
        // Limpar canvas com fade
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const lineCount = 60;
        const segmentCount = 80;
        const height = this.canvas.height / 2;

        for (let i = 0; i < lineCount; i++) {
            this.ctx.beginPath();
            const progress = i / lineCount;
            const colorIntensity = Math.sin(progress * Math.PI);
            
            // Cor baseada no estado de escuta
            let color = `rgba(0, 255, 192, ${colorIntensity * 0.5})`;
            if (this.isListening) {
                const intensity = this.voiceIntensity || 0;
                const r = Math.floor(0 + intensity * 255);
                const g = Math.floor(255 - intensity * 100);
                const b = Math.floor(192 + intensity * 63);
                color = `rgba(${r}, ${g}, ${b}, ${colorIntensity * (0.5 + intensity * 0.5)})`;
            }
            
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1.5 + (this.isListening ? this.voiceAmplitude * 2 : 0);

            for (let j = 0; j < segmentCount + 1; j++) {
                const x = (j / segmentCount) * this.canvas.width;
                
                // Influência do mouse
                const distToMouse = Math.hypot(x - this.mouse.x, height - this.mouse.y);
                const mouseEffect = Math.max(0, 1 - distToMouse / 400);

                // Cálculo da onda
                let noise = Math.sin(j * 0.1 + this.time + i * 0.2) * 20;
                let spike = Math.cos(j * 0.2 + this.time + i * 0.1) * Math.sin(j * 0.05 + this.time) * 50;
                
                // Aplicar efeitos de voz se estiver escutando
                if (this.isListening) {
                    const frequencyEffect = Math.sin(j * this.voiceFrequency * 0.1 + this.time) * this.voiceAmplitude * 30;
                    const intensityEffect = this.voiceIntensity * 50;
                    noise += frequencyEffect;
                    spike += intensityEffect;
                }
                
                const y = height + noise + spike * (1 + mouseEffect * 2);

                if (j === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
        }

        this.time += 0.02;
        this.animationId = requestAnimationFrame(() => this.draw());
    }

    // Métodos para controlar a animação baseada na voz
    setListeningState(isListening) {
        this.isListening = isListening;
    }

    updateVoiceData(intensity, frequency, amplitude) {
        this.voiceIntensity = intensity || 0;
        this.voiceFrequency = frequency || 0;
        this.voiceAmplitude = amplitude || 0;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        window.removeEventListener('resize', this.resizeCanvas);
        window.removeEventListener('mousemove', this.handleMouseMove);
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Exportar para uso global
window.SonicWaveformCanvas = SonicWaveformCanvas;
